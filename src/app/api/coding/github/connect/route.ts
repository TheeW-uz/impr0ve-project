import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  try {
    const { username, accessToken = '' } = await req.json();
    if (!username) return err('GitHub username is required', 400);

    // Call GitHub API with robust error handling and User-Agent
    const headers: Record<string, string> = {
      'User-Agent': 'impr0ve-developer-dashboard',
    };
    if (accessToken) {
      headers['Authorization'] = `token ${accessToken}`;
    }

    let profileRes;
    try {
      profileRes = await axios.get(`https://api.github.com/users/${username}`, { headers });
    } catch (apiError: any) {
      const status = apiError.response?.status || 500;
      const msg = apiError.response?.data?.message || 'Failed to fetch GitHub profile';
      return err(`GitHub API Error (${status}): ${msg}`, 400);
    }

    const profile = profileRes.data;

    // Fetch recent repositories
    let repos: any[] = [];
    try {
      const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, { headers });
      repos = reposRes.data.map((r: any) => ({
        name: r.name,
        description: r.description || 'No description provided.',
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language || 'HTML/CSS',
        url: r.html_url,
        updatedAt: r.updated_at,
      }));
    } catch (e) {
      console.error('Failed to fetch repositories:', e);
    }

    // Save GitHub account details to database
    const githubAccount = await prisma.githubAccount.upsert({
      where: { userId: auth.sub },
      create: {
        userId: auth.sub,
        githubId: String(profile.id),
        username: profile.login,
        avatarUrl: profile.avatar_url,
        profileUrl: profile.html_url,
        accessToken: accessToken || 'mock_token_' + Math.random().toString(36).substr(2),
        followers: profile.followers,
        following: profile.following,
        publicRepos: profile.public_repos,
      },
      update: {
        githubId: String(profile.id),
        username: profile.login,
        avatarUrl: profile.avatar_url,
        profileUrl: profile.html_url,
        accessToken: accessToken || undefined,
        followers: profile.followers,
        following: profile.following,
        publicRepos: profile.public_repos,
      },
    });

    // Sync contributions from public events (e.g., last 90 days)
    let syncCount = 0;
    try {
      const eventsRes = await axios.get(`https://api.github.com/users/${username}/events?per_page=100`, { headers });
      const pushEvents = eventsRes.data.filter((ev: any) => ev.type === 'PushEvent');
      
      const commitCountsByDate: Record<string, { count: number, commits: number }> = {};
      pushEvents.forEach((ev: any) => {
        const dateKey = ev.created_at.split('T')[0];
        const commitsCount = ev.payload?.commits?.length || 1;
        if (!commitCountsByDate[dateKey]) {
          commitCountsByDate[dateKey] = { count: 0, commits: 0 };
        }
        commitCountsByDate[dateKey].count += 1;
        commitCountsByDate[dateKey].commits += commitsCount;
      });

      // Upsert contribution days based on GitHub events
      await prisma.$transaction(
        Object.entries(commitCountsByDate).map(([dateKey, stats]) => {
          const date = new Date(dateKey);
          // Intensity from 1 to 4 based on commit counts
          const intensity = Math.min(Math.ceil(stats.commits / 2), 4);
          
          return prisma.codingContributionDay.upsert({
            where: { userId_dateKey: { userId: auth.sub, dateKey } },
            create: {
              userId: auth.sub,
              date,
              dateKey,
              count: stats.count,
              totalMinutes: stats.commits * 15, // Estimate 15 minutes of work per commit
              intensity,
            },
            update: {
              count: { increment: stats.count },
              totalMinutes: { increment: stats.commits * 15 },
              intensity: { set: intensity },
            },
          });
        })
      );
      syncCount = Object.keys(commitCountsByDate).length;
    } catch (e) {
      console.error('Failed to sync contribution events:', e);
    }

    // Award user 100 XP for connecting GitHub!
    await prisma.user.update({
      where: { id: auth.sub },
      data: { xp: { increment: 100 } },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: auth.sub,
        type: 'GITHUB_ACCOUNT_CONNECTED',
        metadata: { username: profile.login, followers: profile.followers, publicRepos: profile.public_repos, syncedDays: syncCount },
        xpDelta: 100,
      },
    });

    // Recalculate coding stats summary
    const allDays = await prisma.codingContributionDay.findMany({
      where: { userId: auth.sub },
      orderBy: { date: 'asc' },
    });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    allDays.forEach((day) => {
      if (!lastDate) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(day.date.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          if (tempStreak > longestStreak) longestStreak = tempStreak;
          tempStreak = 1;
        }
      }
      lastDate = day.date;
    });
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    currentStreak = tempStreak;

    const totalSessions = await prisma.codingSession.count({ where: { userId: auth.sub } });
    const totalMinutesSum = allDays.reduce((sum, d) => sum + d.totalMinutes, 0);

    await prisma.codingStats.upsert({
      where: { userId: auth.sub },
      create: {
        userId: auth.sub,
        totalSessions,
        totalMinutes: totalMinutesSum,
        totalProblems: 0,
        currentStreak,
        longestStreak,
        lastSessionDate: lastDate,
      },
      update: {
        totalMinutes: totalMinutesSum,
        currentStreak,
        longestStreak,
        lastSessionDate: lastDate || undefined,
      },
    });

    return ok({
      account: githubAccount,
      repos,
      syncedDays: syncCount,
      xpAwarded: 100,
    });
  } catch (e: any) {
    console.error('Error connecting GitHub:', e);
    return err(e.message || 'Internal Server Error', 500);
  }
}
