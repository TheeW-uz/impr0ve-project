// GET  /api/coding
// POST /api/coding
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';
import { z } from 'zod';

const createSchema = z.object({
  dateKey     : z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title       : z.string().min(1).max(200),
  description : z.string().max(1000).optional().default(''),
  minutesSpent: z.number().int().min(1).max(1440),
  language    : z.string().max(50).optional(),
});

// XP = 1 per minute, max 120 per session
function calcXp(minutes: number) {
  return Math.min(minutes, 120);
}

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const limit   = parseInt(req.nextUrl.searchParams.get('limit') ?? '50');
  const dateKey = req.nextUrl.searchParams.get('dateKey') ?? undefined;

  const activities = await prisma.codingActivity.findMany({
    where: { userId: auth.sub, ...(dateKey ? { dateKey } : {}) },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 200),
  });

  return ok(activities);
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 422);

  const xpEarned = calcXp(parsed.data.minutesSpent);

  // Create activity + upsert contribution day in one transaction
  const [activity] = await prisma.$transaction([
    prisma.codingActivity.create({
      data: { ...parsed.data, userId: auth.sub, xpEarned },
    }),
    prisma.contributionDay.upsert({
      where : { userId_dateKey: { userId: auth.sub, dateKey: parsed.data.dateKey } },
      create: { userId: auth.sub, dateKey: parsed.data.dateKey, count: 1, xpEarned, minutesSpent: parsed.data.minutesSpent },
      update: {
        count       : { increment: 1 },
        xpEarned    : { increment: xpEarned },
        minutesSpent: { increment: parsed.data.minutesSpent },
      },
    }),
    prisma.user.update({
      where: { id: auth.sub },
      data : { xp: { increment: xpEarned } },
    }),
    prisma.activityLog.create({
      data: { userId: auth.sub, type: 'CODING_LOGGED', xpDelta: xpEarned,
              metadata: { minutes: parsed.data.minutesSpent, language: parsed.data.language } },
    }),
  ]);

  return ok(activity, 201);
}
