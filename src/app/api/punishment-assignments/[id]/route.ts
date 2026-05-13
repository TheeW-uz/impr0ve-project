// PUT /api/punishment-assignments/:id
// Mark as COMPLETED or SKIPPED
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['COMPLETED', 'SKIPPED']),
  reason: z.string().max(500).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const existing = await prisma.punishmentAssignment.findUnique({
    where: { id: params.id },
  });
  if (!existing) return err('Not found', 404);
  if (existing.userId !== auth.sub) return err('Forbidden', 403);

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const updated = await prisma.punishmentAssignment.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      completedAt: parsed.data.status === 'COMPLETED' ? new Date() : null,
      ...(parsed.data.reason ? { reason: parsed.data.reason } : {}),
    },
    include: { rule: true },
  });

  return ok(updated);
}
