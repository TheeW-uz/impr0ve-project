// GET  /api/goals/daily?dateKey=2026-05-12
// POST /api/goals/daily
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const createSchema = z.object({
  dateKey             : z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid dateKey format'),
  title               : z.string().min(1).max(200),
  notes               : z.string().max(1000).optional().default(''),
  priority            : z.enum(['LOW','MEDIUM','HIGH','CRITICAL']).optional().default('MEDIUM'),
  timeEstimateMinutes : z.number().int().min(1).max(1440).optional().default(30),
  subtasks            : z.array(z.object({ title: z.string().min(1) })).optional().default([]),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const dateKey = req.nextUrl.searchParams.get('dateKey');
  const monthKey = req.nextUrl.searchParams.get('monthKey'); // e.g., "2026-05"

  const goals = await prisma.dailyGoal.findMany({
    where: {
      userId: auth.sub,
      ...(dateKey ? { dateKey } : {}),
      ...(monthKey ? { dateKey: { startsWith: monthKey } } : {}),
    },
    include: { subtasks: true },
    orderBy: [{ dateKey: 'asc' }, { priority: 'desc' }, { createdAt: 'asc' }],
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

  const goal = await prisma.dailyGoal.create({
    data: {
      ...data,
      userId  : auth.sub,
      subtasks: { create: subtasks },
    },
    include: { subtasks: true },
  });

  await prisma.activityLog.create({
    data: { userId: auth.sub, type: 'DAILY_GOAL_CREATED', entityId: goal.id },
  });

  return ok(goal, 201);
}
