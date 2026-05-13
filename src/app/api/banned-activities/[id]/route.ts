// PUT    /api/banned-activities/:id
// DELETE /api/banned-activities/:id
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const updateSchema = z.object({
  title:    z.string().min(1).max(200).optional(),
  reason:   z.string().max(500).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  notes:    z.string().max(1000).optional(),
});

export async function PUT(
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

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const updated = await prisma.bannedActivity.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return ok(updated);
}

export async function DELETE(
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

  await prisma.bannedActivity.delete({ where: { id: params.id } });

  return ok({ message: 'Deleted successfully' });
}
