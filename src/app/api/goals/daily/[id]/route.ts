// GET    /api/goals/daily/[id]
// PATCH  /api/goals/daily/[id]
// DELETE /api/goals/daily/[id]
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const patchSchema = z.object({
  title               : z.string().min(1).max(200).optional(),
  notes               : z.string().max(1000).optional(),
  priority            : z.enum(['LOW','MEDIUM','HIGH','CRITICAL']).optional(),
  progress            : z.number().int().min(0).max(100).optional(),
  completed           : z.boolean().optional(),
  failed              : z.boolean().optional(),
  timeEstimateMinutes : z.number().int().min(1).optional(),
});

async function getGoal(id: string, userId: string) {
  return prisma.dailyGoal.findFirst({ where: { id, userId }, include: { subtasks: true } });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);
  const goal = await getGoal(params.id, auth.sub);
  if (!goal) return err('Goal not found', 404);
  return ok(goal);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const existing = await getGoal(params.id, auth.sub);
  if (!existing) return err('Goal not found', 404);

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const data: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.completed === true && !existing.completed) {
    data.completedAt = new Date();
    data.progress    = 100;
    data.failed      = false;

    // Award XP
    const xpMap = { LOW: 10, MEDIUM: 20, HIGH: 35, CRITICAL: 50 };
    const xp = xpMap[existing.priority];
    await prisma.user.update({ where: { id: auth.sub }, data: { xp: { increment: xp } } });
    await prisma.activityLog.create({
      data: { userId: auth.sub, type: 'DAILY_GOAL_COMPLETED', entityId: params.id, xpDelta: xp },
    });
  }

  if (parsed.data.failed === true && !existing.failed) {
    data.failedAt  = new Date();
    data.completed = false;
  }

  const goal = await prisma.dailyGoal.update({
    where: { id: params.id },
    data,
    include: { subtasks: true },
  });

  return ok(goal);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const existing = await getGoal(params.id, auth.sub);
  if (!existing) return err('Goal not found', 404);

  await prisma.dailyGoal.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
