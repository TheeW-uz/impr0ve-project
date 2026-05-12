import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.string().min(1).optional(),
  note: z.string().optional(),
  plannedDate: z.string().optional().nullable(),
  completed: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const data: any = { ...parsed.data };
  if (data.plannedDate !== undefined) {
    data.plannedDate = data.plannedDate ? new Date(data.plannedDate) : null;
  }
  
  if (data.completed !== undefined) {
    data.completedAt = data.completed ? new Date() : null;
  }

  const item = await prisma.stuffToDoItem.update({
    where: { id: params.id, userId: auth.sub },
    data,
  });

  return ok(item);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  await prisma.stuffToDoItem.delete({
    where: { id: params.id, userId: auth.sub },
  });

  return ok({ success: true });
}
