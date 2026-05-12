// GET  /api/side-quests
// POST /api/side-quests
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const createSchema = z.object({
  title    : z.string().min(1).max(200),
  notes    : z.string().max(1000).optional().default(''),
  totalDays: z.number().int().min(1).max(3650),
  startDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const quests = await prisma.sideQuest.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: 'desc' },
  });

  // Attach computed percentage
  const withPercent = quests.map(q => ({
    ...q,
    percentage: q.totalDays > 0 ? Math.round((q.completedDays / q.totalDays) * 100) : 0,
  }));

  return ok(withPercent);
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const quest = await prisma.sideQuest.create({
    data: {
      ...parsed.data,
      userId   : auth.sub,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
    },
  });

  await prisma.activityLog.create({
    data: { userId: auth.sub, type: 'SIDE_QUEST_CREATED', entityId: quest.id },
  });

  return ok({ ...quest, percentage: 0 }, 201);
}
