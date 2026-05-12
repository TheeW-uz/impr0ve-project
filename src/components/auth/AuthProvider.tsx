'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Target } from 'lucide-react';

const publicRoutes = ['/login', '/register', '/forgot-password', '/'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, token, expiresAt, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check session expiration
    if (expiresAt && new Date() > new Date(expiresAt)) {
      logout();
      return;
    }

    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname?.startsWith('/verify')
    );

    if (!user && !isPublicRoute) {
      router.push('/login');
    }

    if (user && isPublicRoute && pathname !== '/') {
      router.push('/dashboard');
    }
  }, [user, pathname, expiresAt, router, logout]);

  // Initial loading state (simulated)
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  
  if (!user && !isPublicRoute && pathname !== '/') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center"
        >
          <Target className="w-8 h-8 text-white" />
        </motion.div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Authenticating...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
