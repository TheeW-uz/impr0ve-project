'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthState } from '@/types/auth';
import { AuthService } from './services';

interface AuthStore extends AuthState {
  verificationToken: string | null;
  requiresVerification: boolean;
  deviceId: string | null;
  register: (data: { email: string; username: string; password: string }) => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ requiresVerification?: boolean } | void>;
  verifyDevice: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
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
      verificationToken: null,
      requiresVerification: false,
      deviceId: typeof window !== 'undefined' ? (localStorage.getItem('impr0ve-device-id') || (() => {
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('impr0ve-device-id', id);
        return id;
      })()) : null,

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
        const { deviceId } = get();
        set({ isLoading: true, error: null, requiresVerification: false, verificationToken: null });
        try {
          const res = await AuthService.login({ 
            email, 
            password, 
            rememberMe,
            deviceId: deviceId || 'web-browser',
            deviceName: typeof window !== 'undefined' ? window.navigator.userAgent.split(') ')[0] + ')' : 'Web Browser'
          });
          const data = res.data.data;

          if (data.requiresVerification) {
            set({ 
              requiresVerification: true, 
              verificationToken: data.verificationToken,
              isLoading: false 
            });
            return { requiresVerification: true };
          }

          const { accessToken, refreshToken, user } = data;
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

      verifyDevice: async (code) => {
        const { verificationToken } = get();
        if (!verificationToken) throw new Error('No verification token found');

        set({ isLoading: true, error: null });
        try {
          const res = await AuthService.verifyDevice({ code, verificationToken });
          const { accessToken, refreshToken, user } = res.data.data;

          localStorage.setItem('impr0ve-refresh-token', refreshToken);
          
          set({ 
            user, 
            token: accessToken, 
            requiresVerification: false,
            verificationToken: null,
            isLoading: false 
          });
        } catch (err: any) {
          const message = err.response?.data?.error || 'Verification failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      resendCode: async () => {
        const { verificationToken } = get();
        if (!verificationToken) throw new Error('No verification token found');

        set({ isLoading: true, error: null });
        try {
          await AuthService.resendCode({ verificationToken });
          set({ isLoading: false });
        } catch (err: any) {
          const message = err.response?.data?.error || 'Failed to resend code';
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

