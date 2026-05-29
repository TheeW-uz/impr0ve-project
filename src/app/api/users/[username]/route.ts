// GET /api/users/[username] - public profile view
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err } from '@/lib/api-middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      username: true,
      bio: true,
      statusText: true,
      statusEmoji: true,
      xp: true,
      level: true,
      profileVisible: true,
      createdAt: true,
      codingStats: {
        select: {
          currentStreak: true,
          longestStreak: true,
          totalMinutes: true,
          totalSessions: true,
        },
      },
      achievements: {
        select: { badgeKey: true, unlockedAt: true },
        orderBy: { unlockedAt: 'desc' },
      },
      codingGoals: {
        where: { status: 'active' },
        select: { technology: true, targetLevel: true, currentLevel: true },
        take: 3,
      },
    },
  });

  if (!user) return err('User not found', 404);
  if (!user.profileVisible) return err('This profile is private', 403);

  // Derive professional rank from level
  const getRankTitle = (lvl: number) => {
    if (lvl <= 2) return 'Beginner Learner';
    if (lvl <= 4) return 'Consistent Builder';
    if (lvl <= 6) return 'SaaS Creator';
    if (lvl <= 8) return 'Staff Developer';
    if (lvl <= 10) return 'Systems Specialist';
    if (lvl <= 12) return 'Abstractions Architect';
    return 'Elite Technical Leader';
  };

  return ok({
    ...user,
    rankTitle: getRankTitle(user.level),
  });
}
