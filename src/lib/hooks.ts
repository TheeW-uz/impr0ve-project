import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoalService, QuestService, CodingService, AnalyticsService } from './services';

// ─── Daily Goals Hooks ───────────────────────────────────────────────
export function useDailyGoals(params?: { dateKey?: string; monthKey?: string }) {
  return useQuery({
    queryKey: ['goals', 'daily', params],
    queryFn: () => GoalService.getDaily(params).then(res => res.data.data),
  });
}


export function useCreateDailyGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => GoalService.createDaily(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', 'daily'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateDailyGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => GoalService.updateDaily(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', 'daily'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// ─── Side Quest Hooks ───────────────────────────────────────────────
export function useQuests() {
  return useQuery({
    queryKey: ['quests'],
    queryFn: () => QuestService.getAll().then(res => res.data.data),
  });
}

export function useUpdateQuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => QuestService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// ─── Coding Activity Hooks ──────────────────────────────────────────
export function useCodingActivities(params?: any) {
  return useQuery({
    queryKey: ['coding', params],
    queryFn: () => CodingService.getActivities(params).then(res => res.data.data),
  });
}

export function useLogCodingActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => CodingService.logActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coding'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// ─── Analytics Hooks ────────────────────────────────────────────────
export function useContributionGraph() {
  return useQuery({
    queryKey: ['analytics', 'contribution-graph'],
    queryFn: () => AnalyticsService.getContributionGraph().then(res => res.data.data),
  });
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => AnalyticsService.getSummary().then(res => res.data.data),
  });
}
