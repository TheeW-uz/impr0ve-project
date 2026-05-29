import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  try {
    const goal = await prisma.codingGoal.findFirst({
      where: {
        id: params.id,
        userId: auth.sub,
      },
      include: {
        roadmap: {
          include: {
            phases: {
              include: {
                tasks: {
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
            aiRecommendations: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        progressHistory: {
          orderBy: { recordedAt: 'desc' },
        },
      },
    });

    if (!goal) return err('Coding goal not found', 404);
    return ok(goal);
  } catch (e: any) {
    console.error('Error fetching individual goal:', e);
    return err(e.message || 'Internal Server Error', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  try {
    const body = await req.json();
    const existing = await prisma.codingGoal.findFirst({
      where: {
        id: params.id,
        userId: auth.sub,
      },
    });

    if (!existing) return err('Coding goal not found', 404);

    const updated = await prisma.codingGoal.update({
      where: { id: params.id },
      data: {
        status: body.status !== undefined ? body.status : undefined, // 'active', 'paused', 'completed'
        dailyMinutes: body.dailyMinutes !== undefined ? parseInt(body.dailyMinutes) : undefined,
        currentLevel: body.currentLevel !== undefined ? body.currentLevel : undefined,
        targetLevel: body.targetLevel !== undefined ? body.targetLevel : undefined,
      },
      include: {
        roadmap: {
          include: {
            phases: {
              include: {
                tasks: {
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
            aiRecommendations: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        progressHistory: {
          orderBy: { recordedAt: 'desc' },
        },
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: auth.sub,
        type: 'CODING_GOAL_UPDATED',
        entityId: params.id,
        metadata: { technology: updated.technology, status: updated.status, dailyMinutes: updated.dailyMinutes },
        xpDelta: 0,
      },
    });

    return ok(updated);
  } catch (e: any) {
    console.error('Error patching coding goal:', e);
    return err(e.message || 'Internal Server Error', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  try {
    const existing = await prisma.codingGoal.findFirst({
      where: {
        id: params.id,
        userId: auth.sub,
      },
    });

    if (!existing) return err('Coding goal not found', 404);

    await prisma.codingGoal.delete({
      where: { id: params.id },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: auth.sub,
        type: 'CODING_GOAL_DELETED',
        metadata: { technology: existing.technology },
        xpDelta: 0,
      },
    });

    return ok({ message: 'Coding goal deleted successfully' });
  } catch (e: any) {
    console.error('Error deleting coding goal:', e);
    return err(e.message || 'Internal Server Error', 500);
  }
}
