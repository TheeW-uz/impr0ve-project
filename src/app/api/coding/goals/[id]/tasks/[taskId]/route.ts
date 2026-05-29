import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  try {
    const { completed } = await req.json();
    if (completed === undefined) return err('Completed field is required', 400);

    // 1. Verify ownership of the goal & get task
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
                tasks: true,
              },
            },
          },
        },
      },
    });

    if (!goal || !goal.roadmap) {
      return err('Coding goal or roadmap not found', 404);
    }

    // Find the target task
    let targetTask: any = null;
    let targetPhase: any = null;

    for (const phase of goal.roadmap.phases) {
      const found = phase.tasks.find(t => t.id === params.taskId);
      if (found) {
        targetTask = found;
        targetPhase = phase;
        break;
      }
    }

    if (!targetTask) {
      return err('Roadmap task not found under this goal', 404);
    }

    // 2. Perform updates inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      const completedAt = completed ? new Date() : null;

      // Update the task completion status
      const updatedTask = await tx.roadmapTask.update({
        where: { id: params.taskId },
        data: {
          completed,
          completedAt,
        },
      });

      // Calculate XP delta
      let xpDelta = 0;
      if (completed && !targetTask.completed) {
        xpDelta = targetTask.isProject ? 50 : 20;
      } else if (!completed && targetTask.completed) {
        xpDelta = targetTask.isProject ? -50 : -20;
      }

      // Update goal's XP earned
      await tx.codingGoal.update({
        where: { id: params.id },
        data: {
          xpEarned: { increment: xpDelta },
        },
      });

      // Update global user XP
      const user = await tx.user.update({
        where: { id: auth.sub },
        data: {
          xp: { increment: xpDelta },
        },
      });

      // Level up calculation: simple level = floor(xp / 1000) + 1
      const targetLevel = Math.max(1, Math.floor(user.xp / 1000) + 1);
      if (targetLevel > user.level) {
        await tx.user.update({
          where: { id: auth.sub },
          data: { level: targetLevel },
        });

        // Log Level Up Activity
        await tx.activityLog.create({
          data: {
            userId: auth.sub,
            type: 'LEVEL_UP',
            metadata: { level: targetLevel },
            xpDelta: 0,
          },
        });
      }

      // Recalculate phase completion state
      const siblings = await tx.roadmapTask.findMany({
        where: { phaseId: targetPhase.id },
      });

      const allCompleted = siblings.every(s => s.id === params.taskId ? completed : s.completed);
      
      await tx.roadmapPhase.update({
        where: { id: targetPhase.id },
        data: {
          completed: allCompleted,
        },
      });

      // Recalculate completed phases in roadmap
      const allPhases = await tx.roadmapPhase.findMany({
        where: { roadmapId: goal.roadmap!.id },
      });

      const completedPhasesCount = allPhases.reduce(
        (acc, p) => p.id === targetPhase.id ? (allCompleted ? acc + 1 : acc) : (p.completed ? acc + 1 : acc),
        0
      );

      await tx.codingRoadmap.update({
        where: { id: goal.roadmap!.id },
        data: {
          completedPhases: completedPhasesCount,
        },
      });

      // Create activity log for task completion
      if (completed && !targetTask.completed) {
        await tx.activityLog.create({
          data: {
            userId: auth.sub,
            type: 'ROADMAP_TASK_COMPLETED',
            entityId: targetTask.id,
            metadata: {
              technology: goal.technology,
              taskTitle: targetTask.title,
              isProject: targetTask.isProject,
            },
            xpDelta,
          },
        });
      }

      return {
        task: updatedTask,
        xpEarned: xpDelta,
        phaseCompleted: allCompleted,
      };
    });

    return ok(result);
  } catch (e: any) {
    console.error('Error toggling roadmap task:', e);
    return err(e.message || 'Internal Server Error', 500);
  }
}
