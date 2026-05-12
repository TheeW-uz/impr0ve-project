'use client';

import { useState } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSent(true);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.div
              key="request"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-white">Reset password</h2>
                <p className="text-sm text-gray-500 mt-1">Enter your email and we'll send you a recovery link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Email Address</label>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/10 h-11 pl-10 focus:ring-primary-500"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all"
                >
                  {isLoading ? 'Sending Link...' : 'Send Recovery Link'}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center py-4 space-y-4"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Check your email</h2>
                <p className="text-sm text-gray-500 mt-2">
                  We've sent a recovery link to <span className="text-white font-medium">{email}</span>
                </p>
              </div>
              <p className="text-[10px] text-gray-600">
                Didn't receive it? Check your spam folder or try again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center pt-2">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
