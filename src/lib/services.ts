import api from './api';

export const AuthService = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.patch('/auth/me', data),
};

export const GoalService = {
  // Daily
  getDaily: (params?: { dateKey?: string; monthKey?: string }) => {
    const query = new URLSearchParams();
    if (params?.dateKey) query.set('dateKey', params.dateKey);
    if (params?.monthKey) query.set('monthKey', params.monthKey);
    const qs = query.toString();
    return api.get(`/goals/daily${qs ? `?${qs}` : ''}`);
  },

  createDaily: (data: any) => api.post('/goals/daily', data),
  updateDaily: (id: string, data: any) => api.patch(`/goals/daily/${id}`, data),
  deleteDaily: (id: string) => api.delete(`/goals/daily/${id}`),
  failStale: () => api.post('/goals/daily/fail-stale'),

  // Monthly
  getMonthly: (monthKey?: string) => api.get(`/goals/monthly${monthKey ? `?monthKey=${monthKey}` : ''}`),
  createMonthly: (data: any) => api.post('/goals/monthly', data),
  updateMonthly: (id: string, data: any) => api.patch(`/goals/monthly/${id}`, data),
  deleteMonthly: (id: string) => api.delete(`/goals/monthly/${id}`),

  // Yearly
  getYearly: (yearKey?: string) => api.get(`/goals/yearly${yearKey ? `?yearKey=${yearKey}` : ''}`),
  createYearly: (data: any) => api.post('/goals/yearly', data),
  updateYearly: (id: string, data: any) => api.patch(`/goals/yearly/${id}`, data),
  deleteYearly: (id: string) => api.delete(`/goals/yearly/${id}`),

  // Lifetime
  getLifetime: () => api.get('/goals/lifetime'),
  createLifetime: (data: any) => api.post('/goals/lifetime', data),
  updateLifetime: (id: string, data: any) => api.patch(`/goals/lifetime/${id}`, data),
  deleteLifetime: (id: string) => api.delete(`/goals/lifetime/${id}`),
  addMilestone: (goalId: string, data: any) => api.post(`/goals/lifetime/${goalId}/milestones`, data),
};

export const QuestService = {
  getAll: () => api.get('/side-quests'),
  create: (data: any) => api.post('/side-quests', data),
  update: (id: string, data: any) => api.patch(`/side-quests/${id}`, data),
  delete: (id: string) => api.delete(`/side-quests/${id}`),
};

export const CodingService = {
  getActivities: (params?: any) => api.get('/coding', { params }),
  logActivity: (data: any) => api.post('/coding', data),
  deleteActivity: (id: string) => api.delete(`/coding/${id}`),
};

export const AnalyticsService = {
  getContributionGraph: () => api.get('/analytics/contribution-graph'),
  getSummary: () => api.get('/analytics/summary'),
};

export const SettingsService = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data: any) => api.patch('/settings', data),
};

export const BannedActivityService = {
  getAll: () => api.get('/banned-activities'),
  create: (data: any) => api.post('/banned-activities', data),
  update: (id: string, data: any) => api.put(`/banned-activities/${id}`, data),
  delete: (id: string) => api.delete(`/banned-activities/${id}`),
  markBroken: (id: string) => api.post(`/banned-activities/${id}/break`),
};

export const PunishmentService = {
  getRules: () => api.get('/punishment-rules'),
  createRule: (data: any) => api.post('/punishment-rules', data),
  updateRule: (id: string, data: any) => api.put(`/punishment-rules/${id}`, data),
  deleteRule: (id: string) => api.delete(`/punishment-rules/${id}`),
  getAssignments: (status?: string) => api.get(`/punishment-assignments${status ? `?status=${status}` : ''}`),
  updateAssignment: (id: string, data: any) => api.put(`/punishment-assignments/${id}`, data),
  evaluate: () => api.post('/punishments/evaluate'),
};

export const UserService = {
  updateProfile: (data: any) => api.patch('/users/profile', data),
};

export const StuffToDoService = {
  getAll: () => api.get('/stuff-to-do'),
  create: (data: any) => api.post('/stuff-to-do', data),
  update: (id: string, data: any) => api.put(`/stuff-to-do/${id}`, data),
  delete: (id: string) => api.delete(`/stuff-to-do/${id}`),
};




