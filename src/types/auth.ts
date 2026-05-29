export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  avatarUrl?: string;
  bio?: string;
  xp: number;
  level: number;
  statusText?: string;
  statusEmoji?: string;
  profileVisible?: boolean;
  locale?: string;
  preferences: {
    theme: 'dark' | 'light';
    notifications: {
      dailyReminders: boolean;
      goalDeadlines: boolean;
      marketing: boolean;
    };
  };
}

export interface AuthSession {
  user: User | null;
  token: string | null;
  expiresAt: string | null;
  rememberMe: boolean;
}

export interface AuthState extends AuthSession {
  isLoading: boolean;
  error: string | null;
}
