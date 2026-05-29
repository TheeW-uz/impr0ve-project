import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  try {
    const account = await prisma.githubAccount.findUnique({
      where: { userId: auth.sub },
    });

    if (!account) {
      return ok({ linked: false });
    }

    // Fetch fresh repositories lists
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
    } catch (e) {
      console.error('Failed to fetch repositories during profile read:', e);
    }

    // Fetch latest commits/events
    let events: any[] = [];
    try {
      const headers = { 'User-Agent': 'impr0ve-developer-dashboard' };
      const eventsRes = await axios.get(`https://api.github.com/users/${account.username}/events?per_page=10`, { headers });
      
      const pushEvents = eventsRes.data.filter((ev: any) => ev.type === 'PushEvent');
      events = pushEvents.flatMap((ev: any) => {
        const repoName = ev.repo?.name;
        const commits = ev.payload?.commits || [];
        return commits.map((c: any) => ({
          repoName,
          sha: c.sha?.substring(0, 7),
          message: c.message,
          author: c.author?.name,
          date: ev.created_at,
        }));
      }).slice(0, 5);
    } catch (e) {
      console.error('Failed to fetch commits during profile read:', e);
    }

    return ok({
      linked: true,
      account,
      repos,
      latestCommits: events,
    });
  } catch (e: any) {
    console.error('Error fetching GitHub profile:', e);
    return err(e.message || 'Internal Server Error', 500);
  }
}
