// GET / PATCH / DELETE /api/goals/yearly/[id]
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const patchSchema = z.object({
  title    : z.string().min(1).max(200).optional(),
  notes    : z.string().max(1000).optional(),
  priority : z.enum(['LOW','MEDIUM','HIGH','CRITICAL']).optional(),
  progress : z.number().int().min(0).max(100).optional(),
  completed: z.boolean().optional(),
  failed   : z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);
  const goal = await prisma.yearlyGoal.findFirst({
    where: { id: params.id, userId: auth.sub }, include: { subtasks: true },
  });
  if (!goal) return err('Goal not found', 404);
  return ok(goal);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);
  const existing = await prisma.yearlyGoal.findFirst({ where: { id: params.id, userId: auth.sub } });
  if (!existing) return err('Goal not found', 404);
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);
  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.completed === true && !existing.completed) {
    data.completedAt = new Date();
    data.progress = 100;
    data.failed = false;
    const xp = 250;
    await prisma.user.update({ where: { id: auth.sub }, data: { xp: { increment: xp } } });
    await prisma.activityLog.create({
      data: { userId: auth.sub, type: 'YEARLY_GOAL_COMPLETED', entityId: params.id, xpDelta: xp },
    });
  }
  const goal = await prisma.yearlyGoal.update({
    where: { id: params.id }, data, include: { subtasks: true },
  });
  return ok(goal);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);
  const existing = await prisma.yearlyGoal.findFirst({ where: { id: params.id, userId: auth.sub } });
  if (!existing) return err('Goal not found', 404);
  await prisma.yearlyGoal.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
