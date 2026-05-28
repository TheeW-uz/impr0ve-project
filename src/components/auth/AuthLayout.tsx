'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#030712]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-4 sm:p-8 z-10"
      >
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/20 mb-3 sm:mb-4">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">impr0ve</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Elevate your potential</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 sm:p-6 shadow-2xl">
          {children}
        </div>

        <p className="text-center mt-4 text-xs text-gray-500">
          © {new Date().getFullYear()} Impr0ve Productivity. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
