import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1),
  note: z.string().optional().default(''),
  plannedDate: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const items = await prisma.stuffToDoItem.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: 'desc' },
  });

  return ok(items);
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const item = await prisma.stuffToDoItem.create({
    data: {
      ...parsed.data,
      userId: auth.sub,
      plannedDate: parsed.data.plannedDate ? new Date(parsed.data.plannedDate) : null,
    },
  });

  return ok(item, 201);
}
