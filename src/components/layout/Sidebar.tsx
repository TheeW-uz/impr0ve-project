'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Target, ShieldBan, List, Code, Flame, Calendar, CalendarRange, Star } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStore, computeCodingStreak } from '@/lib/store';
import { useAuth } from '@/lib/auth-store';
import { LogOut, Settings, User as UserIcon, ChevronDown, ChevronRight } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/todo', label: 'To-Do List', icon: Target },
  { 
    label: 'Goals', 
    icon: Target,
    subItems: [
      { href: '/goals/monthly', label: 'Monthly Goals', icon: Calendar },
      { href: '/goals/yearly', label: 'Yearly Goals', icon: CalendarRange },
      { href: '/goals/lifetime', label: 'Lifetime Goals', icon: Star },
    ]
  },
  { href: '/side-quests', label: 'Side Quests', icon: List },
  { href: '/stuff', label: 'Stuff To Do', icon: List },
  { href: '/banned-activities', label: 'Banned Activities', icon: ShieldBan },
  { href: '/coding', label: 'Coding', icon: Code },

];

export function Sidebar() {
  const [open, setOpen] = useState(true);
  const [goalsExpanded, setGoalsExpanded] = useState(true);
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
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
              {navItems.map((item) => {
                if (item.subItems) {
                  const isAnySubActive = item.subItems.some(sub => pathname === sub.href);
                  return (
                    <div key={item.label} className="space-y-1">
                      <button
                        onClick={() => setGoalsExpanded(!goalsExpanded)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                          isAnySubActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <item.icon className={cn('w-5 h-5 transition-all', isAnySubActive ? 'text-primary-400' : 'group-hover:text-primary-400')} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {goalsExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                      </button>
                      
                      <AnimatePresence>
                        {goalsExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-1"
                          >
                            {item.subItems.map((sub) => {
                              const isSubActive = pathname === sub.href;
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  className={cn(
                                    'flex items-center gap-3 pl-11 pr-3 py-2 rounded-xl text-[13px] font-medium transition-all group',
                                    isSubActive
                                      ? 'bg-primary-500/10 text-white'
                                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                                  )}
                                >
                                  <sub.icon className={cn('w-4 h-4', isSubActive ? 'text-primary-400' : 'group-hover:text-primary-400')} />
                                  <span>{sub.label}</span>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                      isActive
                        ? 'bg-primary-500/10 text-white border border-primary-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <item.icon className={cn(
                      'w-5 h-5 transition-all',
                      isActive ? 'text-primary-400' : 'group-hover:text-primary-400 group-hover:scale-110'
                    )} />
                    <span>{item.label}</span>
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
