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

  const updated = await prisma.bannedActivity.update({
    where: { id: params.id },
    data: {
      timesBroken: { increment: 1 },
      lastBrokenAt: new Date(),
    },
  });

  return ok(updated);
}
