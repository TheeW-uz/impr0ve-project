// GET /api/punishment-assignments
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  const status = req.nextUrl.searchParams.get('status') ?? undefined;

  const assignments = await prisma.punishmentAssignment.findMany({
    where: {
      userId: auth.sub,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      rule: {
        select: {
          id: true,
          title: true,
          appliesTo: true,
          punishmentType: true,
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  return ok(assignments);
}
