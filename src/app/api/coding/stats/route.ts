import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  let stats = await prisma.codingStats.findUnique({
    where: { userId: auth.sub }
  });

  if (!stats) {
    stats = await prisma.codingStats.create({
      data: { userId: auth.sub }
    });
  }

  return ok(stats);
}
