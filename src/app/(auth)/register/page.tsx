'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validatePassword = (pass: string) => {
    return pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (formData.password !== formData.confirmPassword) {
      setLocalError(t('auth.register.error_passwords_match'));
      return;
    }

    if (!validatePassword(formData.password)) {
      setLocalError(t('auth.register.error_password_weak'));
      return;
    }

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
      router.push('/dashboard');
    } catch (err) {
      // Handled by store
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
    if (localError) setLocalError(null);
  };

  return (
    <AuthLayout>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">{t('auth.register.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('auth.register.subtitle')}</p>
        </div>

        <AnimatePresence mode="wait">
          {(error || localError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error || localError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">{t('auth.register.email_label')}</label>
            <Input
              name="email"
              type="email"
              placeholder={t('auth.register.email_placeholder')}
              value={formData.email}
              onChange={handleChange}
              className="bg-white/5 border-white/10 h-11 focus:ring-primary-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">{t('auth.register.username_label')}</label>
            <Input
              name="username"
              type="text"
              placeholder={t('auth.register.username_placeholder')}
              value={formData.username}
              onChange={handleChange}
              className="bg-white/5 border-white/10 h-11 focus:ring-primary-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">{t('auth.register.password_label')}</label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
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
            {formData.password && (
              <div className="grid grid-cols-2 gap-2 mt-2 px-1">
                {[
                  { label: t('auth.password_checks.chars'), met: formData.password.length >= 8 },
                  { label: t('auth.password_checks.uppercase'), met: /[A-Z]/.test(formData.password) },
                  { label: t('auth.password_checks.number'), met: /[0-9]/.test(formData.password) },
                  { label: t('auth.password_checks.special'), met: /[^A-Za-z0-9]/.test(formData.password) }
                ].map(check => (
                  <div key={check.label} className="flex items-center gap-1.5">
                    <div className={cn('w-3.5 h-3.5 rounded-full flex items-center justify-center', check.met ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-700')}>
                      <Check className="w-2 h-2" />
                    </div>
                    <span className={cn('text-[10px] font-medium', check.met ? 'text-green-400' : 'text-gray-600')}>{check.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">{t('auth.register.confirm_password_label')}</label>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="bg-white/5 border-white/10 h-11 focus:ring-primary-500"
              required
            />
          </div>

          <div className="flex items-start gap-2 px-1 py-1">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary-500 mt-0.5"
            />
            <label htmlFor="terms" className="text-xs text-gray-500 leading-tight select-none">
              {t('auth.register.terms')}{' '}
              <span className="text-emerald-400 hover:underline cursor-pointer">{t('auth.register.terms_of_service')}</span>{' '}
              {t('auth.register.and')}{' '}
              <span className="text-emerald-400 hover:underline cursor-pointer">{t('auth.register.privacy_policy')}</span>.
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
                {t('auth.register.create_account')}{' '}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            {t('auth.register.have_account')}{' '}
            <Link href="/login" className="text-emerald-400 font-bold hover:underline">
              {t('auth.register.log_in')}
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
