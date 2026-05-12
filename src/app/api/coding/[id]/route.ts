// DELETE /api/coding/[id]
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const activity = await prisma.codingActivity.findFirst({
    where: { id: params.id, userId: auth.sub },
  });
  if (!activity) return err('Activity not found', 404);

  // Deduct from contribution day
  await prisma.$transaction([
    prisma.codingActivity.delete({ where: { id: params.id } }),
    prisma.contributionDay.updateMany({
      where: { userId: auth.sub, dateKey: activity.dateKey },
      data : {
        count       : { decrement: 1 },
        xpEarned    : { decrement: activity.xpEarned },
        minutesSpent: { decrement: activity.minutesSpent },
      },
    }),
    prisma.user.update({
      where: { id: auth.sub },
      data : { xp: { decrement: activity.xpEarned } },
    }),
  ]);

  return ok({ deleted: true });
}
