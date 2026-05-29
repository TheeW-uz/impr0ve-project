import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const historySchema = z.object({
  minutes: z.number().int().min(1).max(480),
  notes: z.string().optional().default(''),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  try {
    const body = await req.json();
    const parsed = historySchema.safeParse(body);
    if (!parsed.success) {
      return err(parsed.error.issues[0].message, 400);
    }

    const { minutes, notes } = parsed.data;

    // 1. Verify goal exists
    const goal = await prisma.codingGoal.findFirst({
      where: {
        id: params.id,
        userId: auth.sub,
      },
    });

    if (!goal) return err('Coding goal not found', 404);

    const sessionDate = new Date();
    const dateKey = sessionDate.toISOString().split('T')[0];

    const result = await prisma.$transaction(async (tx) => {
      // 1. Add progress history
      const history = await tx.progressHistory.create({
        data: {
          goalId: params.id,
          minutes,
          notes,
          recordedAt: sessionDate,
        },
      });

      // 2. Add standard CodingSession for unified logs
      await tx.codingSession.create({
        data: {
          userId: auth.sub,
          title: `Study Session: ${goal.technology}`,
          projectName: `${goal.technology} Roadmap`,
          language: goal.technology,
          durationMinutes: minutes,
          difficulty: goal.difficulty,
          notes: notes || `Roadmap study for ${goal.technology}`,
          completed: true,
          sessionDate,
        },
      });

      // 3. Upsert contribution day
      const intensity = Math.min(Math.floor(minutes / 30), 4);
      await tx.codingContributionDay.upsert({
        where: { userId_dateKey: { userId: auth.sub, dateKey } },
        create: {
          userId: auth.sub,
          date: sessionDate,
          dateKey,
          count: 1,
          totalMinutes: minutes,
          intensity: intensity || 1,
        },
        update: {
          count: { increment: 1 },
          totalMinutes: { increment: minutes },
          intensity: { set: intensity || 1 },
        },
      });

      // 4. Award XP (1 XP per minute studied!)
      const xpDelta = minutes;
      const user = await tx.user.update({
        where: { id: auth.sub },
        data: { xp: { increment: xpDelta } },
      });

      // Level up calculation
      const targetLevel = Math.max(1, Math.floor(user.xp / 1000) + 1);
      if (targetLevel > user.level) {
        await tx.user.update({
          where: { id: auth.sub },
          data: { level: targetLevel },
        });

        await tx.activityLog.create({
          data: {
            userId: auth.sub,
            type: 'LEVEL_UP',
            metadata: { level: targetLevel },
            xpDelta: 0,
          },
        });
      }

      // 5. Update goal's cumulative XP
      await tx.codingGoal.update({
        where: { id: params.id },
        data: {
          xpEarned: { increment: xpDelta },
        },
      });

      // 6. Recalculate coding stats & streaks
      const allDays = await tx.codingContributionDay.findMany({
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

      const totalSessions = await tx.codingSession.count({ where: { userId: auth.sub } });
      const totalMinutesSum = allDays.reduce((sum, d) => sum + d.totalMinutes, 0);

      await tx.codingStats.upsert({
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
          totalSessions,
          totalMinutes: totalMinutesSum,
          currentStreak,
          longestStreak,
          lastSessionDate: lastDate || undefined,
        },
      });

      // 7. Log activity
      await tx.activityLog.create({
        data: {
          userId: auth.sub,
          type: 'CODING_GOAL_STUDIED',
          entityId: params.id,
          metadata: { technology: goal.technology, minutes, notes },
          xpDelta,
        },
      });

      return history;
    });

    return ok(result, 201);
  } catch (e: any) {
    console.error('Error logging study history:', e);
    return err(e.message || 'Internal Server Error', 500);
  }
}
