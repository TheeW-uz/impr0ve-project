'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Target, List, Code, Menu, Settings, LogOut, X, Calendar, CalendarRange, Star, ShieldBan } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-store';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/todo', label: 'To-Do', icon: Target },
  { href: '/coding', label: 'Coding', icon: Code },
];




export function MobileNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showMore, setShowMore] = useState(false);
  
  const isPublicRoute = ['/login', '/register', '/forgot-password', '/'].includes(pathname);

  if (!user || isPublicRoute) return null;

  const moreItems = [
    { href: '/goals/monthly', label: 'Monthly Goals', icon: Calendar },
    { href: '/goals/yearly', label: 'Yearly Goals', icon: CalendarRange },
    { href: '/goals/lifetime', label: 'Lifetime Goals', icon: Star },
    { href: '/side-quests', label: 'Side Quests', icon: List },
    { href: '/stuff', label: 'Stuff To Do', icon: List },
    { href: '/banned-activities', label: 'Banned Activities', icon: ShieldBan },
    { href: '/settings', label: 'Settings', icon: Settings },

  ];



  return (
    <>
      {/* Top Mobile Bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center font-black text-white text-[10px]">i</div>
          <span className="text-sm font-bold tracking-tight text-white">impr0ve</span>
        </div>
        <Link href="/settings" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-tr from-primary-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
            {user.username.substring(0, 2)}
          </div>
        </Link>
      </div>

      {/* More Menu Drawer */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-white/10 rounded-t-[2.5rem] z-50 lg:hidden overflow-hidden"
            >
              <div className="p-6 pb-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-blue-600 flex items-center justify-center text-xl font-black text-white uppercase">
                      {user.username.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{user.username}</h4>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowMore(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {moreItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all"
                    >
                      <item.icon className="w-6 h-6 text-primary-400" />
                      <span className="text-sm font-bold text-white">{item.label}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => { logout(); setShowMore(false); }}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-6 h-6 text-red-400" />
                    <span className="text-sm font-bold text-red-400">Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gray-950/80 backdrop-blur-2xl border-t border-white/5 z-40 flex items-center justify-around px-2 lg:hidden pb-safe">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full h-full transition-all relative',
                isActive ? 'text-primary-400' : 'text-gray-500 hover:text-gray-400'
              )}
            >
              <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute -top-[1px] w-8 h-[2px] bg-primary-400 rounded-full"
                />
              )}
            </Link>
          );
        })}
        <button
          onClick={() => setShowMore(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-full h-full transition-all',
            showMore ? 'text-primary-400' : 'text-gray-500'
          )}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </>
  );
}
