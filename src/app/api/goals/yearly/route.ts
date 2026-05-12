// GET  /api/goals/yearly?yearKey=2026
// POST /api/goals/yearly
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const createSchema = z.object({
  yearKey  : z.string().regex(/^\d{4}$/, 'Invalid yearKey (YYYY)'),
  title    : z.string().min(1).max(200),
  notes    : z.string().max(1000).optional().default(''),
  priority : z.enum(['LOW','MEDIUM','HIGH','CRITICAL']).optional().default('MEDIUM'),
  subtasks : z.array(z.object({ title: z.string().min(1) })).optional().default([]),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);
  const yearKey = req.nextUrl.searchParams.get('yearKey') ?? undefined;
  const goals = await prisma.yearlyGoal.findMany({
    where: { userId: auth.sub, ...(yearKey ? { yearKey } : {}) },
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
  const goal = await prisma.yearlyGoal.create({
    data: { ...data, userId: auth.sub, subtasks: { create: subtasks } },
    include: { subtasks: true },
  });
  await prisma.activityLog.create({
    data: { userId: auth.sub, type: 'YEARLY_GOAL_CREATED', entityId: goal.id },
  });
  return ok(goal, 201);
}
