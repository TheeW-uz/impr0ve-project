// GET  /api/punishment-rules
// POST /api/punishment-rules
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const createSchema = z.object({
  title:                z.string().min(1, 'Title is required').max(200),
  description:          z.string().max(1000).optional().default(''),
  appliesTo:            z.enum(['TODO', 'MONTHLY', 'YEARLY']),
  failedCountThreshold: z.number().int().min(1, 'Threshold must be at least 1'),
  punishmentType:       z.string().min(1, 'Punishment type is required').max(100),
  punishmentAction:     z.string().min(1, 'Punishment action is required').max(500),
  active:               z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const rules = await prisma.punishmentRule.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: 'desc' },
  });

  return ok(rules);
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const rule = await prisma.punishmentRule.create({
    data: {
      userId:               auth.sub,
      title:                parsed.data.title,
      description:          parsed.data.description,
      appliesTo:            parsed.data.appliesTo,
      failedCountThreshold: parsed.data.failedCountThreshold,
      punishmentType:       parsed.data.punishmentType,
      punishmentAction:     parsed.data.punishmentAction,
      active:               parsed.data.active,
    },
  });

  return ok(rule, 201);
}
