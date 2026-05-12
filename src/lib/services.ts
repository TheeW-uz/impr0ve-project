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
  getDaily: (dateKey?: string) => api.get(`/goals/daily${dateKey ? `?dateKey=${dateKey}` : ''}`),
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
