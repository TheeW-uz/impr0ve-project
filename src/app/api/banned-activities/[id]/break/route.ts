// POST /api/banned-activities/:id/break
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const existing = await prisma.bannedActivity.findUnique({
    where: { id: params.id },
  });
  if (!existing) return err('Not found', 404);
  if (existing.userId !== auth.sub) return err('Forbidden', 403);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update banned activity count
    const updated = await tx.bannedActivity.update({
      where: { id: params.id },
      data: {
        timesBroken: { increment: 1 },
        lastBrokenAt: new Date(),
      },
    });

    // 2. Perform minor progression decrement (non-toxic support, cap at 0)
    const currentXp = auth.sub ? await tx.user.findUnique({ where: { id: auth.sub }, select: { xp: true } }) : null;
    const xpPenalty = currentXp && currentXp.xp >= 25 ? 25 : 0;

    if (xpPenalty > 0) {
      await tx.user.update({
        where: { id: auth.sub },
        data: { xp: { decrement: xpPenalty } },
      });
    }

    // 3. Register relapse in ActivityLog for unified analytics tracking
    await tx.activityLog.create({
      data: {
        userId: auth.sub,
        type: 'BANNED_ACTIVITY_RELAPSE',
        entityId: params.id,
        metadata: {
          title: existing.title,
          severity: existing.severity,
          recoveryReboot: true,
        },
        xpDelta: -xpPenalty,
      },
    });

    return updated;
  });

  return ok(result);
}
