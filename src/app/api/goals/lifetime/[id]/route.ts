// GET / PATCH / DELETE /api/goals/lifetime/[id]
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const patchSchema = z.object({
  title         : z.string().min(1).max(200).optional(),
  notes         : z.string().max(2000).optional(),
  progress      : z.number().int().min(0).max(100).optional(),
  completed     : z.boolean().optional(),
  category      : z.string().max(50).optional(),
  estimatedYears: z.number().min(0).max(100).optional(),
});

// POST /api/goals/lifetime/[id]/milestones
// POST /api/goals/lifetime/[id]/journal

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);
  const goal = await prisma.lifetimeGoal.findFirst({
    where: { id: params.id, userId: auth.sub },
    include: { milestones: true, journal: { orderBy: { createdAt: 'desc' } } },
  });
  if (!goal) return err('Goal not found', 404);
  return ok(goal);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);
  const existing = await prisma.lifetimeGoal.findFirst({ where: { id: params.id, userId: auth.sub } });
  if (!existing) return err('Goal not found', 404);
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);
  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.completed === true && !existing.completed) {
    data.completedAt = new Date();
    const xp = 500;
    await prisma.user.update({ where: { id: auth.sub }, data: { xp: { increment: xp } } });
    await prisma.activityLog.create({
      data: { userId: auth.sub, type: 'LIFETIME_GOAL_COMPLETED', entityId: params.id, xpDelta: xp },
    });
  }
  const goal = await prisma.lifetimeGoal.update({
    where: { id: params.id }, data,
    include: { milestones: true, journal: { orderBy: { createdAt: 'desc' } } },
  });
  return ok(goal);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);
  const existing = await prisma.lifetimeGoal.findFirst({ where: { id: params.id, userId: auth.sub } });
  if (!existing) return err('Goal not found', 404);
  await prisma.lifetimeGoal.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
