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

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();
  
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
      setLocalError('Passwords do not match');
      return;
    }

    if (!validatePassword(formData.password)) {
      setLocalError('Password must be at least 8 characters and include uppercase + numbers');
      return;
    }

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password // Simulated
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
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Create your account</h2>
          <p className="text-sm text-gray-500 mt-1">Start your journey toward high performance.</p>
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Email Address</label>
            <Input
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className="bg-white/5 border-white/10 h-11 focus:ring-primary-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Username</label>
            <Input
              name="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              className="bg-white/5 border-white/10 h-11 focus:ring-primary-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Password</label>
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
                  { label: '8+ chars', met: formData.password.length >= 8 },
                  { label: 'Uppercase', met: /[A-Z]/.test(formData.password) },
                  { label: 'Number', met: /[0-9]/.test(formData.password) },
                  { label: 'Special', met: /[^A-Za-z0-9]/.test(formData.password) }
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Confirm Password</label>
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
            <label htmlFor="terms" className="text-xs text-gray-500 leading-tight">
              I agree to the <span className="text-primary-400 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary-400 hover:underline cursor-pointer">Privacy Policy</span>.
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/20 group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-400 font-bold hover:underline">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
