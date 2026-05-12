// GET  /api/goals/lifetime
// POST /api/goals/lifetime
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const createSchema = z.object({
  title         : z.string().min(1).max(200),
  notes         : z.string().max(2000).optional().default(''),
  category      : z.string().max(50).optional().default('Personal'),
  estimatedYears: z.number().min(0).max(100).optional(),
  milestones    : z.array(z.object({ title: z.string().min(1), targetDate: z.string().optional() })).optional().default([]),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);
  const goals = await prisma.lifetimeGoal.findMany({
    where: { userId: auth.sub },
    include: { milestones: true, journal: { orderBy: { createdAt: 'desc' }, take: 10 } },
    orderBy: { createdAt: 'desc' },
  });
  return ok(goals);
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);
  const { milestones, ...data } = parsed.data;
  const goal = await prisma.lifetimeGoal.create({
    data: {
      ...data,
      userId: auth.sub,
      milestones: {
        create: milestones.map(m => ({
          title: m.title,
          targetDate: m.targetDate ? new Date(m.targetDate) : undefined,
        })),
      },
    },
    include: { milestones: true, journal: true },
  });
  return ok(goal, 201);
}
