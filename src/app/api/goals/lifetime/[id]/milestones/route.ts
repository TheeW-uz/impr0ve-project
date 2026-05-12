// POST /api/goals/lifetime/[id]/milestones        — add milestone
// PATCH /api/goals/lifetime/[id]/milestones/[mid] — toggle/update
// DELETE /api/goals/lifetime/[id]/milestones/[mid]
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const createSchema = z.object({
  title     : z.string().min(1).max(200),
  targetDate: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const goal = await prisma.lifetimeGoal.findFirst({ where: { id: params.id, userId: auth.sub } });
  if (!goal) return err('Goal not found', 404);

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const milestone = await prisma.lifetimeMilestone.create({
    data: {
      goalId    : params.id,
      title     : parsed.data.title,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined,
    },
  });
  return ok(milestone, 201);
}
