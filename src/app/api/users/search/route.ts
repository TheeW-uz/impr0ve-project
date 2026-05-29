// GET /api/users/search?q=username
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) return err('Query must be at least 2 characters', 422);

  const users = await prisma.user.findMany({
    where: {
      profileVisible: true,
      username: { contains: q, mode: 'insensitive' },
      id: { not: auth.sub }, // exclude self
    },
    select: {
      id: true,
      username: true,
      bio: true,
      statusText: true,
      statusEmoji: true,
      xp: true,
      level: true,
      createdAt: true,
      codingStats: {
        select: { currentStreak: true, longestStreak: true, totalMinutes: true }
      },
      achievements: {
        select: { badgeKey: true, unlockedAt: true },
        orderBy: { unlockedAt: 'desc' },
        take: 5,
      },
    },
    take: 20,
    orderBy: { xp: 'desc' },
  });

  return ok(users);
}
