// GET / PATCH / DELETE /api/side-quests/[id]
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const patchSchema = z.object({
  title        : z.string().min(1).max(200).optional(),
  notes        : z.string().max(1000).optional(),
  totalDays    : z.number().int().min(1).optional(),
  completedDays: z.number().int().min(0).optional(),
  completed    : z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);
  const quest = await prisma.sideQuest.findFirst({ where: { id: params.id, userId: auth.sub } });
  if (!quest) return err('Quest not found', 404);
  const percentage = quest.totalDays > 0
    ? Math.round((quest.completedDays / quest.totalDays) * 100) : 0;
  return ok({ ...quest, percentage });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const existing = await prisma.sideQuest.findFirst({ where: { id: params.id, userId: auth.sub } });
  if (!existing) return err('Quest not found', 404);

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const data: Record<string, unknown> = { ...parsed.data };

  // Auto-complete when completedDays >= totalDays
  const newCompleted = parsed.data.completedDays ?? existing.completedDays;
  const newTotal     = parsed.data.totalDays ?? existing.totalDays;
  if (newCompleted >= newTotal) data.completed = true;

  if (data.completed && !existing.completed) {
    const xp = 150;
    await prisma.user.update({ where: { id: auth.sub }, data: { xp: { increment: xp } } });
    await prisma.activityLog.create({
      data: { userId: auth.sub, type: 'SIDE_QUEST_COMPLETED', entityId: params.id, xpDelta: xp },
    });
  }

  const quest = await prisma.sideQuest.update({ where: { id: params.id }, data });
  const percentage = quest.totalDays > 0
    ? Math.round((quest.completedDays / quest.totalDays) * 100) : 0;
  return ok({ ...quest, percentage });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);
  const existing = await prisma.sideQuest.findFirst({ where: { id: params.id, userId: auth.sub } });
  if (!existing) return err('Quest not found', 404);
  await prisma.sideQuest.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
