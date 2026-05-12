'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthState } from '@/types/auth';
import { AuthService } from './services';

interface AuthStore extends AuthState {
  register: (data: { email: string; username: string; password: string }) => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expiresAt: null,
      rememberMe: false,
      isLoading: false,
      error: null,

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await AuthService.register(data);
          const { accessToken, refreshToken, user } = res.data.data;
          
          localStorage.setItem('impr0ve-refresh-token', refreshToken);
          
          set({ 
            user, 
            token: accessToken, 
            isLoading: false 
          });
        } catch (err: any) {
          const message = err.response?.data?.error || 'Registration failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      login: async (email, password, rememberMe) => {
        set({ isLoading: true, error: null });
        try {
          const res = await AuthService.login({ email, password, rememberMe });
          const { accessToken, refreshToken, user } = res.data.data;

          localStorage.setItem('impr0ve-refresh-token', refreshToken);
          
          set({ 
            user, 
            token: accessToken, 
            rememberMe,
            isLoading: false 
          });
        } catch (err: any) {
          const message = err.response?.data?.error || 'Login failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: async () => {
        const refreshToken = localStorage.getItem('impr0ve-refresh-token');
        if (refreshToken) {
          AuthService.logout(refreshToken).catch(() => {});
        }
        localStorage.removeItem('impr0ve-refresh-token');
        set({ user: null, token: null, expiresAt: null, error: null });
        window.location.href = '/login';
      },

      updateProfile: async (updates) => {
        try {
          const res = await AuthService.updateProfile(updates);
          set({ user: res.data.data });
        } catch (err: any) {
          console.error('Profile update failed', err);
        }
      },

      refreshUser: async () => {
        try {
          const res = await AuthService.getMe();
          set({ user: res.data.data });
        } catch (err) {
          console.error('Failed to refresh user data', err);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'impr0ve-auth-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        rememberMe: state.rememberMe
      }),
    }
  )
);

