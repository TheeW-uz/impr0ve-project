'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/language-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, rememberMe);
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            {t('auth.login.title')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('auth.login.subtitle')}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">
              {t('auth.login.email_label')}
            </label>
            <Input
              type="email"
              placeholder={t('auth.login.email_placeholder')}
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) clearError(); }}
              className="bg-white/5 border-white/10 h-11 focus:ring-primary-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {t('auth.login.password_label')}
              </label>
              <Link href="/forgot-password" title={t('auth.login.forgot_password')} className="text-[10px] font-bold text-primary-400 hover:text-primary-300">
                {t('auth.login.forgot_password')}
              </Link>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.login.password_placeholder')}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) clearError(); }}
                className="bg-white/5 border-white/10 h-11 pr-10 focus:ring-primary-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer select-none">
              {t('auth.login.remember_me')}
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-black" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                {t('auth.login.sign_in')}{' '}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            {t('auth.login.no_account')}{' '}
            <Link href="/register" className="text-emerald-400 font-bold hover:underline">
              {t('auth.login.sign_up_free')}
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
