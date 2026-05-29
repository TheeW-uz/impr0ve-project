import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  try {
    const account = await prisma.githubAccount.findUnique({
      where: { userId: auth.sub },
    });

    if (!account) {
      return err('No GitHub account linked', 400);
    }

    // Cache check: prevent syncing more than once every 5 minutes to avoid hitting GitHub rate limits
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (account.updatedAt > fiveMinutesAgo) {
      // Just fetch local cached data to avoid rate limit
      let repos: any[] = [];
      try {
        const headers = { 'User-Agent': 'impr0ve-developer-dashboard' };
        const reposRes = await axios.get(`https://api.github.com/users/${account.username}/repos?sort=updated&per_page=6`, { headers });
        repos = reposRes.data.map((r: any) => ({
          name: r.name,
          description: r.description || 'No description provided.',
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language || 'HTML/CSS',
          url: r.html_url,
          updatedAt: r.updated_at,
        }));
      } catch (err) {
        console.error('Failed to get repos for cached return:', err);
      }
      return ok({
        account,
        repos,
        cached: true,
        message: 'Synchronized (from cache)',
      });
    }

    // Refresh profile details from GitHub API
    const headers: Record<string, string> = {
      'User-Agent': 'impr0ve-developer-dashboard',
    };
    if (account.accessToken && !account.accessToken.startsWith('mock_token_')) {
      headers['Authorization'] = `token ${account.accessToken}`;
    }

    let profileRes;
    try {
      profileRes = await axios.get(`https://api.github.com/users/${account.username}`, { headers });
    } catch (e: any) {
      return err(`Failed to fetch GitHub profile during sync: ${e.message}`, 400);
    }

    const profile = profileRes.data;

    // Fetch recent repositories
    let repos: any[] = [];
    try {
      const reposRes = await axios.get(`https://api.github.com/users/${account.username}/repos?sort=updated&per_page=6`, { headers });
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
      console.error('Failed to fetch repositories during sync:', e);
    }

    // Update account details in DB
    const updatedAccount = await prisma.githubAccount.update({
      where: { userId: auth.sub },
      data: {
        followers: profile.followers,
        following: profile.following,
        publicRepos: profile.public_repos,
        avatarUrl: profile.avatar_url,
      },
    });

    // Sync contributions from public events
    let syncCount = 0;
    try {
      const eventsRes = await axios.get(`https://api.github.com/users/${account.username}/events?per_page=100`, { headers });
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
          const intensity = Math.min(Math.ceil(stats.commits / 2), 4);

          return prisma.codingContributionDay.upsert({
            where: { userId_dateKey: { userId: auth.sub, dateKey } },
            create: {
              userId: auth.sub,
              date,
              dateKey,
              count: stats.count,
              totalMinutes: stats.commits * 15,
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
      console.error('Failed to sync contribution events during sync:', e);
    }

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
      account: updatedAccount,
      repos,
      syncedDays: syncCount,
      cached: false,
      message: 'GitHub data synchronized successfully!',
    });
  } catch (e: any) {
    console.error('Error syncing GitHub:', e);
    return err(e.message || 'Internal Server Error', 500);
  }
}
