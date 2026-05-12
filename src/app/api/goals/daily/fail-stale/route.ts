// POST /api/goals/daily/fail-stale
// Called on app load — auto-fails daily goals from past days that weren't completed
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const result = await prisma.dailyGoal.updateMany({
    where: {
      userId   : auth.sub,
      completed: false,
      failed   : false,
      dateKey  : { lt: todayKey },
    },
    data: { failed: true, failedAt: new Date() },
  });

  return ok({ failedCount: result.count });
}
