// PUT    /api/punishment-rules/:id
// DELETE /api/punishment-rules/:id
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const updateSchema = z.object({
  title:                z.string().min(1).max(200).optional(),
  description:          z.string().max(1000).optional(),
  appliesTo:            z.enum(['TODO', 'MONTHLY', 'YEARLY']).optional(),
  failedCountThreshold: z.number().int().min(1).optional(),
  punishmentType:       z.string().min(1).max(100).optional(),
  punishmentAction:     z.string().min(1).max(500).optional(),
  active:               z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const existing = await prisma.punishmentRule.findUnique({
    where: { id: params.id },
  });
  if (!existing) return err('Not found', 404);
  if (existing.userId !== auth.sub) return err('Forbidden', 403);

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const updated = await prisma.punishmentRule.update({
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

  const existing = await prisma.punishmentRule.findUnique({
    where: { id: params.id },
  });
  if (!existing) return err('Not found', 404);
  if (existing.userId !== auth.sub) return err('Forbidden', 403);

  // cascade deletes assignments via Prisma relation
  await prisma.punishmentRule.delete({ where: { id: params.id } });

  return ok({ message: 'Deleted successfully' });
}
