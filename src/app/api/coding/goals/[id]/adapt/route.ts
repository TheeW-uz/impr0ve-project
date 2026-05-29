import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, getAuthUser } from '@/lib/api-middleware';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getAuthUser(req);
  if (!auth) return err('Unauthorized', 401);

  try {
    // 1. Fetch goal, roadmap, phases, tasks, and progress history
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
        progressHistory: {
          orderBy: { recordedAt: 'desc' },
        },
      },
    });

    if (!goal || !goal.roadmap) {
      return err('Coding goal or roadmap not found', 404);
    }

    // 2. Perform pace detection analysis
    const totalTasks = goal.roadmap.phases.flatMap(p => p.tasks).length || 1;
    const completedTasks = goal.roadmap.phases.flatMap(p => p.tasks).filter(t => t.completed).length;
    const completionRate = completedTasks / totalTasks;

    // Check progress history logs
    const historyLogs = goal.progressHistory;
    const totalMinutesLogged = historyLogs.reduce((sum, h) => sum + h.minutes, 0);
    const logsCount = historyLogs.length;

    let detectedPace = 'Normal';
    let adaptationNote = 'Learning rate is perfectly on track. Estimated syllabus milestones maintain original trajectory.';
    let recommendedTopic = 'Core syntax refinement';
    let recommendedReason = 'Continuing standard workflow guarantees solid knowledge accumulation before advanced capstone sprints.';
    let recommendedExercise = 'Review recent documentation sheets and practice by building 3 isolated sandboxes.';
    let recommendedProject = 'Develop a mock routing configuration with robust state bindings.';

    if (logsCount >= 2) {
      // Calculate average minutes per log or frequency
      const mostRecentLog = historyLogs[0].recordedAt.getTime();
      const oldestLog = historyLogs[logsCount - 1].recordedAt.getTime();
      const durationDays = Math.ceil(Math.abs(mostRecentLog - oldestLog) / (1000 * 60 * 60 * 24)) || 1;
      const logsPerDay = logsCount / durationDays;

      if (logsPerDay > 0.8 && completionRate > 0.3) {
        // High Speed progress detected!
        detectedPace = 'Fast-tracked';
        adaptationNote = 'High velocity detected! AI learning engine has accelerated your trajectory. We loaded advanced concepts and condensed foundational weeks.';
        recommendedTopic = `Advanced optimization patterns in ${goal.technology}`;
        recommendedReason = 'Your rapid task completion signals excellent core comprehension. Spurring advanced performance patterns will maximize learning efficiency.';
        recommendedExercise = 'Run benchmarking checks on your code blocks and refactor loops to reduce time complexity.';
        recommendedProject = 'A high-concurrency event processor or a robust middleware system.';
      } else if (logsPerDay < 0.3 || (durationDays > 7 && completionRate < 0.1)) {
        // Slower pace detected
        detectedPace = 'Paced learning';
        adaptationNote = 'Paced velocity detected. AI engine has scaled down task complexities to establish stronger fundamentals and avoid technical fatigue.';
        recommendedTopic = 'Micro-architectures & sandboxing';
        recommendedReason = 'Taking incremental steps with hands-on practice builds deeper neural paths and solidifies abstractions before advanced topics.';
        recommendedExercise = 'Rebuild 2 basic tasks from Phase 1 without referencing search resources. Focus on clean, readable layout.';
        recommendedProject = 'A localized UI widget or a modular CLI interface.';
      }
    }

    // 3. Update roadmap details and insert new AI recommendation in transaction
    const newRecommendation = await prisma.$transaction(async (tx) => {
      // Adjust roadmap Weeks dynamically based on velocity
      let targetWeeks = goal.roadmap!.estimatedWeeks;
      if (detectedPace === 'Fast-tracked') {
        targetWeeks = Math.max(2, Math.floor(goal.roadmap!.estimatedWeeks * 0.8));
      } else if (detectedPace === 'Paced learning') {
        targetWeeks = Math.floor(goal.roadmap!.estimatedWeeks * 1.2);
      }

      await tx.codingRoadmap.update({
        where: { id: goal.roadmap!.id },
        data: {
          adaptationNote,
          estimatedWeeks: targetWeeks,
        },
      });

      // Insert AI recommendation
      const rec = await tx.aiRecommendation.create({
        data: {
          roadmapId: goal.roadmap!.id,
          topic: recommendedTopic,
          reason: recommendedReason,
          exercise: recommendedExercise,
          projectIdea: recommendedProject,
          detectedPace,
        },
      });

      // Log Activity
      await tx.activityLog.create({
        data: {
          userId: auth.sub,
          type: 'AI_ROADMAP_ADAPTED',
          entityId: goal.id,
          metadata: { technology: goal.technology, detectedPace, newWeeks: targetWeeks },
          xpDelta: 0,
        },
      });

      return rec;
    });

    return ok({
      recommendation: newRecommendation,
      detectedPace,
      adaptationNote,
    });
  } catch (e: any) {
    console.error('Error adapting roadmap:', e);
    return err(e.message || 'Internal Server Error', 500);
  }
}
