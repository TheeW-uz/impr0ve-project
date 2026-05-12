// GET  /api/roadmap
// POST /api/roadmap
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(''),
  dueDate: z.string().optional(),
  parentId: z.string().optional(),
  milestones: z.array(z.object({ title: z.string().min(1) })).optional().default([])
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const items = await prisma.roadmapItem.findMany({
    where: { userId: auth.sub, parentId: null }, // Fetch root items
    include: {
      milestones: true,
      children: {
        include: { milestones: true }
      }
    },
    orderBy: { order: 'asc' }
  });

  return ok(items);
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const { milestones, ...data } = parsed.data;

  const item = await prisma.roadmapItem.create({
    data: {
      ...data,
      userId: auth.sub,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      milestones: {
        create: milestones
      }
    },
    include: { milestones: true }
  });

  return ok(item, 201);
}
