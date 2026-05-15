import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { todayKey, thisMonthKey, thisYearKey } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const userId = auth.sub;
  const today = todayKey();
  const thisMonth = thisMonthKey();
  const thisYear = thisYearKey();

  // Fetch all relevant data for the user
  const [
    dailyGoals,
    monthlyGoals,
    yearlyGoals,
    lifetimeGoals,
    sideQuests,
    codingStats,
    bannedActivities,
    punishments,
    stuffToDo,
  ] = await Promise.all([
    prisma.dailyGoal.findMany({ where: { userId } }),
    prisma.monthlyGoal.findMany({ where: { userId, monthKey: thisMonth } }),
    prisma.yearlyGoal.findMany({ where: { userId, yearKey: thisYear } }),
    prisma.lifetimeGoal.findMany({ where: { userId } }),
    prisma.sideQuest.findMany({ where: { userId } }),
    prisma.codingStats.findUnique({ where: { userId } }),
    prisma.bannedActivity.findMany({ where: { userId } }),
    prisma.punishmentAssignment.findMany({ where: { userId, status: 'PENDING' } }),
    prisma.stuffToDoItem.findMany({ where: { userId } }),
  ]);

  // Today's stats
  const todayGoals = dailyGoals.filter(g => g.dateKey === today);
  const todayDone = todayGoals.filter(g => g.completed).length;
  const todayTotal = todayGoals.length;

  // Lifetime/All-time stats
  const totalDailyDone = dailyGoals.filter(g => g.completed).length;
  const totalDailyFailed = dailyGoals.filter(g => g.failed).length;
  const totalDailyTotal = dailyGoals.length;

  // Monthly stats
  const monthDone = monthlyGoals.filter(g => g.completed).length;
  const monthTotal = monthlyGoals.length;

  // Yearly stats
  const yearDone = yearlyGoals.filter(g => g.completed).length;
  const yearTotal = yearlyGoals.length;

  // Calculate Daily Goal Streak
  let goalStreak = 0;
  const sortedDateKeys = Array.from(new Set(dailyGoals.map(g => g.dateKey))).sort().reverse();
  for (const dk of sortedDateKeys) {
    const dayGoals = dailyGoals.filter(g => g.dateKey === dk);
    const dayDone = dayGoals.every(g => g.completed) && dayGoals.length > 0;
    if (dayDone) {
      goalStreak++;
    } else {
      // If we skip a day but it's today and not yet over, don't break streak? 
      // Actually simple streak: must have completed ALL goals for that day.
      if (dk !== today) break;
    }
  }

  // Productivity Score Calculation
  // A simple score based on completion rates and streaks
  let productivityScore = 0;
  if (totalDailyTotal > 0) {
    const dailyRate = totalDailyDone / totalDailyTotal;
    productivityScore += dailyRate * 40; // Max 40 points from daily
  }
  if (monthTotal > 0) {
    const monthRate = monthDone / monthTotal;
    productivityScore += monthRate * 20; // Max 20 points from monthly
  }
  if (codingStats) {
    productivityScore += Math.min(codingStats.currentStreak * 2, 20); // Max 20 points from coding streak
  }
  productivityScore += Math.min(goalStreak * 2, 20); // Max 20 points from goal streak
  productivityScore = Math.round(productivityScore);

  return ok({
    summary: {
      todo: {
        total: totalDailyTotal,
        completed: totalDailyDone,
        failed: totalDailyFailed,
        streak: goalStreak,
        today: {
          total: todayTotal,
          completed: todayDone,
        }
      },
      goals: {
        monthly: {
          total: monthTotal,
          completed: monthDone,
          progress: monthTotal > 0 ? Math.round((monthDone / monthTotal) * 100) : 0,
        },
        yearly: {
          total: yearTotal,
          completed: yearDone,
          progress: yearTotal > 0 ? Math.round((yearDone / yearTotal) * 100) : 0,
        },
        lifetime: {
          total: lifetimeGoals.length,
          completed: lifetimeGoals.filter(g => g.completed).length,
          avgProgress: lifetimeGoals.length > 0 
            ? Math.round(lifetimeGoals.reduce((a, g) => a + g.progress, 0) / lifetimeGoals.length) 
            : 0,
        }
      },
      quests: {
        total: sideQuests.length,
        completed: sideQuests.filter(q => q.completed).length,
        active: sideQuests.filter(q => !q.completed).length,
      },
      coding: {
        currentStreak: codingStats?.currentStreak || 0,
        longestStreak: codingStats?.longestStreak || 0,
        totalHours: Math.round((codingStats?.totalMinutes || 0) / 60),
        todayMinutes: 0, // Will be calculated below or fetched separately if needed
      },
      banned: {
        total: bannedActivities.length,
        brokenCount: bannedActivities.reduce((a, b) => a + b.timesBroken, 0),
      },
      punishments: {
        pending: punishments.length,
      },
      stuffToDo: {
        total: stuffToDo.length,
        completed: stuffToDo.filter(s => s.completed).length,
      },
      productivityScore,
    }
  });
}
