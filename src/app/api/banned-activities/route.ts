// GET  /api/banned-activities
// POST /api/banned-activities
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser, validateBody } from '@/lib/api-middleware';
import { z } from 'zod';

const createSchema = z.object({
  title:    z.string().min(1, 'Title is required').max(200),
  reason:   z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('LOW'),
  notes:    z.string().max(1000).optional().default(''),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const activities = await prisma.bannedActivity.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: 'desc' },
  });

  return ok(activities);
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const activity = await prisma.bannedActivity.create({
    data: {
      userId:   auth.sub,
      title:    parsed.data.title,
      reason:   parsed.data.reason,
      category: parsed.data.category,
      severity: parsed.data.severity,
      notes:    parsed.data.notes,
    },
  });

  return ok(activity, 201);
}
