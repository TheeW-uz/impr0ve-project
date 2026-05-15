// GET /api/analytics/summary
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const [
    totalGoals,
    completedGoals,
    totalCodingMinutes,
    totalXp,
    recentLogs
  ] = await Promise.all([
    prisma.dailyGoal.count({ where: { userId: auth.sub } }),
    prisma.dailyGoal.count({ where: { userId: auth.sub, completed: true } }),
    prisma.codingSession.aggregate({
      where: { userId: auth.sub },
      _sum: { durationMinutes: true }
    }),
    prisma.user.findUnique({
      where: { id: auth.sub },
      select: { xp: true, level: true }
    }),
    prisma.activityLog.findMany({
      where: { userId: auth.sub },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  return ok({
    goals: {
      total: totalGoals,
      completed: completedGoals,
      completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0
    },
    coding: {
      totalMinutes: totalCodingMinutes._sum.durationMinutes || 0,
      hours: Math.round((totalCodingMinutes._sum.durationMinutes || 0) / 60)
    },
    user: totalXp,
    recentActivity: recentLogs
  });
}
