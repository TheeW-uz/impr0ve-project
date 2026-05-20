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

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyDevice, resendCode, requiresVerification, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (requiresVerification) {
        await verifyDevice(code);
        router.push('/dashboard');
      } else {
        const result = await login(email, password, rememberMe);
        if (result && result.requiresVerification) {
          // Stay on page, UI will switch to code input
          return;
        }
        router.push('/dashboard');
      }
    } catch (err) {
      // Error is handled by store
    }
  };

  const handleResend = async () => {
    setResendStatus('sending');
    try {
      await resendCode();
      setResendStatus('sent');
      setTimeout(() => setResendStatus('idle'), 5000);
    } catch (err) {
      setResendStatus('idle');
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            {requiresVerification ? 'Verify Device' : 'Welcome back'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {requiresVerification 
              ? `We sent a 5-digit code to ${email}.` 
              : 'Please enter your details to sign in.'}
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
          <AnimatePresence mode="wait">
            {!requiresVerification ? (
              <motion.div
                key="login-fields"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Email Address</label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) clearError(); }}
                    className="bg-white/5 border-white/10 h-11 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Password</label>
                    <Link href="/forgot-password" title="Forgot password?" className="text-[10px] font-bold text-primary-400 hover:text-primary-300">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
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
                  <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer">
                    Remember me for 30 days
                  </label>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="verify-fields"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Verification Code</label>
                  <Input
                    type="text"
                    placeholder="12345"
                    maxLength={5}
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/[^0-9]/g, '')); if (error) clearError(); }}
                    className="bg-white/5 border-white/10 h-14 text-center text-2xl tracking-[1em] font-bold focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendStatus === 'sending'}
                    className="text-xs text-primary-400 hover:text-primary-300 font-medium"
                  >
                    {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? 'Code Sent!' : "Didn't receive a code? Resend"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/20 group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                {requiresVerification ? 'Verify' : 'Sign In'}{' '}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary-400 font-bold hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
