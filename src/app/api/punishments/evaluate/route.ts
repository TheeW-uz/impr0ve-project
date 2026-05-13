// POST /api/punishments/evaluate
// Evaluates failed todos/goals and auto-assigns punishments
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const now = new Date();
  const userId = auth.sub;

  // ── 1. Count failed todos (DailyGoal: not completed, dateKey in the past) ──
  const todayKey = now.toISOString().slice(0, 10);
  const failedTodoCount = await prisma.dailyGoal.count({
    where: {
      userId,
      completed: false,
      dateKey: { lt: todayKey },
    },
  });

  // ── 2. Count failed monthly goals ──
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const failedMonthlyCount = await prisma.monthlyGoal.count({
    where: {
      userId,
      completed: false,
      monthKey: { lt: thisMonthKey },
    },
  });

  // ── 3. Count failed yearly goals ──
  const thisYearKey = String(now.getFullYear());
  const failedYearlyCount = await prisma.yearlyGoal.count({
    where: {
      userId,
      completed: false,
      yearKey: { lt: thisYearKey },
    },
  });

  // ── 4. Get active punishment rules ──
  const activeRules = await prisma.punishmentRule.findMany({
    where: { userId, active: true },
  });

  const created: any[] = [];
  const skipped: any[] = [];

  for (const rule of activeRules) {
    let failCount = 0;
    let sourcePeriod = '';

    if (rule.appliesTo === 'TODO') {
      failCount = failedTodoCount;
      sourcePeriod = todayKey; // group by "evaluated on this day"
    } else if (rule.appliesTo === 'MONTHLY') {
      failCount = failedMonthlyCount;
      sourcePeriod = thisMonthKey;
    } else if (rule.appliesTo === 'YEARLY') {
      failCount = failedYearlyCount;
      sourcePeriod = thisYearKey;
    }

    if (failCount < rule.failedCountThreshold) continue;

    // ── 5. Prevent duplicate assignments ──
    const exists = await prisma.punishmentAssignment.findFirst({
      where: { userId, ruleId: rule.id, sourcePeriod },
    });

    if (exists) {
      skipped.push({ ruleId: rule.id, reason: 'Already assigned for this period' });
      continue;
    }

    // ── 6. Create the assignment ──
    const assignment = await prisma.punishmentAssignment.create({
      data: {
        userId,
        ruleId:          rule.id,
        sourceType:      rule.appliesTo,
        sourcePeriod,
        reason: `${failCount} ${rule.appliesTo.toLowerCase()} item(s) failed — threshold was ${rule.failedCountThreshold}`,
        punishmentAction: rule.punishmentAction,
        status:          'PENDING',
      },
    });

    created.push(assignment);
  }

  return ok({
    evaluated: {
      todo:    failedTodoCount,
      monthly: failedMonthlyCount,
      yearly:  failedYearlyCount,
    },
    created: created.length,
    skipped: skipped.length,
    assignments: created,
  });
}
