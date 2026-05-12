// GET  /api/goals/monthly?monthKey=2026-05
// POST /api/goals/monthly
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const createSchema = z.object({
  monthKey : z.string().regex(/^\d{4}-\d{2}$/, 'Invalid monthKey (YYYY-MM)'),
  title    : z.string().min(1).max(200),
  notes    : z.string().max(1000).optional().default(''),
  priority : z.enum(['LOW','MEDIUM','HIGH','CRITICAL']).optional().default('MEDIUM'),
  subtasks : z.array(z.object({ title: z.string().min(1) })).optional().default([]),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const monthKey = req.nextUrl.searchParams.get('monthKey') ?? undefined;

  const goals = await prisma.monthlyGoal.findMany({
    where: { userId: auth.sub, ...(monthKey ? { monthKey } : {}) },
    include: { subtasks: true },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  });

  return ok(goals);
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const { subtasks, ...data } = parsed.data;

  const goal = await prisma.monthlyGoal.create({
    data: { ...data, userId: auth.sub, subtasks: { create: subtasks } },
    include: { subtasks: true },
  });

  await prisma.activityLog.create({
    data: { userId: auth.sub, type: 'MONTHLY_GOAL_CREATED', entityId: goal.id },
  });

  return ok(goal, 201);
}
