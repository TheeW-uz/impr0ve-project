'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Target, Map, List, Bolt, Code, Flame } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStore, computeCodingStreak } from '@/lib/store';
import { useAuth } from '@/lib/auth-store';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/side-quests', label: 'Side Quests', icon: Map },
  { href: '/roadmap', label: 'Roadmap', icon: List },
  { href: '/todo', label: 'Stuff To Do', icon: Bolt },
  { href: '/coding', label: 'Coding', icon: Code },
];

export function Sidebar() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const { codingActivities } = useStore();
  const { current: streak } = computeCodingStreak(codingActivities);
  const { user, logout } = useAuth();

  const isPublicRoute = ['/login', '/register', '/forgot-password', '/'].includes(pathname);

  if (!user || isPublicRoute) return null;

  return (
    <>
      {/* Desktop/Tablet Toggle button */}
      <button
        className="fixed top-4 left-4 z-50 rounded-xl p-2 bg-gray-950/80 backdrop-blur-md hover:bg-white/5 text-gray-200 transition-colors border border-white/5 shadow-lg hidden lg:flex"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle navigation"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence mode="wait">
        {open && (
          <motion.aside
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-950/60 backdrop-blur-2xl border-r border-white/5 shadow-2xl flex flex-col py-6 lg:static lg:h-screen lg:z-0 lg:bg-transparent lg:border-r lg:border-white/5 hidden lg:flex"
          >
            {/* Logo */}
            <div className="px-6 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                i
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                impr0ve
              </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                      isActive
                        ? 'bg-primary-500/10 text-white border border-primary-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className={cn(
                      'w-5 h-5 transition-all',
                      isActive ? 'text-primary-400' : 'group-hover:text-primary-400 group-hover:scale-110'
                    )} />
                    <span>{label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Streak badge — real data */}
            <div className="px-4 mt-auto">
              <div className={cn(
                'p-4 rounded-2xl border',
                streak > 0
                  ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20'
                  : 'bg-white/5 border-white/5'
              )}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Coding Streak</p>
                <div className="flex items-center gap-2">
                  <Flame className={cn('w-5 h-5', streak > 0 ? 'text-orange-400' : 'text-gray-600')} />
                  <p className={cn('text-lg font-black', streak > 0 ? 'text-white' : 'text-gray-600')}>
                    {streak > 0 ? `${streak} day${streak !== 1 ? 's' : ''}` : 'Start your streak'}
                  </p>
                </div>
                {streak === 0 && (
                  <p className="text-[10px] text-gray-600 mt-1">Log coding activity daily</p>
                )}
              </div>
            </div>
            {/* User profile & Logout */}
            <div className="mt-4 px-3 border-t border-white/10 pt-4">
              <Link
                href="/settings"
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group mb-1',
                  pathname === '/settings'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {user.username.substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{user.username}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
                <Settings className="w-4 h-4 text-gray-600 group-hover:text-gray-300" />
              </Link>
              
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all group"
              >
                <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
