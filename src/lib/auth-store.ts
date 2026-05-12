'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthState, AuthSession } from '@/types/auth';
import { v4 as uuidv4 } from 'uuid';

interface AuthStore extends AuthState {
  register: (data: { email: string; username: string; passwordHash: string }) => Promise<void>;
  login: (email: string, passwordHash: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
}

// Simulated local database for users
const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('impr0ve_users_db');
  return stored ? JSON.parse(stored) : [];
};

const saveUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('impr0ve_users_db', JSON.stringify(users));
};

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expiresAt: null,
      rememberMe: false,
      isLoading: false,
      error: null,

      register: async ({ email, username, passwordHash }) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const users = getUsers();
          if (users.some(u => u.email === email)) {
            throw new Error('Email already registered');
          }
          if (users.some(u => u.username === username)) {
            throw new Error('Username already taken');
          }

          const newUser: User = {
            id: uuidv4(),
            email,
            username,
            passwordHash, // In real apps, this would be hashed on server
            createdAt: new Date().toISOString(),
            preferences: { 
              theme: 'dark', 
              notifications: {
                dailyReminders: true,
                goalDeadlines: true,
                marketing: false
              } 
            }
          };

          saveUser(newUser);
          
          // Auto-login after registration
          const token = btoa(JSON.stringify({ id: newUser.id, exp: Date.now() + 86400000 }));
          set({ 
            user: newUser, 
            token, 
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            isLoading: false 
          });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      login: async (email, passwordHash, rememberMe) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const users = getUsers();
          const user = users.find(u => u.email === email && u.passwordHash === passwordHash);
          
          if (!user) {
            throw new Error('Invalid email or password');
          }

          const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
          const expiresAt = new Date(Date.now() + duration).toISOString();
          const token = btoa(JSON.stringify({ id: user.id, exp: Date.now() + duration }));

          set({ user, token, expiresAt, rememberMe, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null, expiresAt: null, error: null });
        // Force a page reload to clear data stores linked to userId
        window.location.href = '/login';
      },

      updateProfile: (updates) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...updates };
        const users = getUsers().map(u => u.id === currentUser.id ? updatedUser : u);
        localStorage.setItem('impr0ve_users_db', JSON.stringify(users));
        set({ user: updatedUser });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'impr0ve-auth-session',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
