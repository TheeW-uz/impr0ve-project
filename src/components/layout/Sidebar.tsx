'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Target, ShieldBan, List, Code, Flame, Calendar, CalendarRange, Star, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/lib/services';
import { useAuth } from '@/lib/auth-store';
import { useLanguage } from '@/lib/language-context';
import { LogOut, Settings, User as UserIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { CommandSearch } from './CommandSearch';

export function Sidebar() {
  const [open, setOpen] = useState(true);
  const [goalsExpanded, setGoalsExpanded] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => DashboardService.getSummary().then(res => res.data.data.summary),
    enabled: !!user,
  });

  const streak = summary?.coding?.currentStreak || 0;
  const isPublicRoute = ['/login', '/register', '/forgot-password', '/'].includes(pathname);
  if (!user || isPublicRoute) return null;

  const navItems = [
    { href: '/dashboard',  label: t('nav.dashboard'),         icon: Home },
    { href: '/todo',       label: t('nav.todo'),              icon: Target },
    {
      label: t('nav.monthly_goals').replace(' Goals', ''), // "Goals"
      icon: Target,
      subItems: [
        { href: '/goals/monthly',  label: t('nav.monthly_goals'),  icon: Calendar },
        { href: '/goals/yearly',   label: t('nav.yearly_goals'),   icon: CalendarRange },
        { href: '/goals/lifetime', label: t('nav.lifetime_goals'), icon: Star },
      ],
    },
    { href: '/side-quests',       label: t('nav.side_quests'),       icon: List },
    { href: '/stuff',             label: t('nav.stuff_todo'),        icon: List },
    { href: '/banned-activities', label: t('nav.banned_activities'), icon: ShieldBan },
    { href: '/coding',            label: t('nav.coding'),            icon: Code },
  ];

  return (
    <>
      {/* Desktop toggle */}
      <button
        className="fixed top-4 left-4 z-50 rounded-xl p-2 bg-gray-950/80 backdrop-blur-md hover:bg-white/5 text-gray-200 transition-colors border border-white/5 shadow-lg hidden lg:flex"
        onClick={() => setOpen(prev => !prev)}
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
            <div className="px-6 mb-5 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black text-sm">i</div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">impr0ve</span>
            </div>

            {/* Quick Search Trigger */}
            <div className="px-4 mb-4">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-left transition-all group"
              >
                <Search className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                <span className="text-xs text-gray-500 group-hover:text-gray-400 font-medium flex-1">
                  {t('nav.search_placeholder').replace('...', '')}
                </span>
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[9px] font-medium text-gray-500">
                  <span className="text-[10px]">⌘</span>K
                </kbd>
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
              {navItems.map(item => {
                if ('subItems' in item && item.subItems) {
                  const isAnySubActive = item.subItems.some(sub => pathname === sub.href);
                  return (
                    <div key={item.label} className="space-y-0.5">
                      <button
                        onClick={() => setGoalsExpanded(!goalsExpanded)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                          isAnySubActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <item.icon className={cn('w-4 h-4 transition-all', isAnySubActive ? 'text-emerald-400' : 'group-hover:text-emerald-400')} />
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        {goalsExpanded ? <ChevronDown className="w-3.5 h-3.5 opacity-40" /> : <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
                      </button>

                      <AnimatePresence>
                        {goalsExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-0.5 pl-2"
                          >
                            {item.subItems.map(sub => {
                              const isSubActive = pathname === sub.href;
                              return (
                                <Link key={sub.href} href={sub.href}
                                  className={cn(
                                    'flex items-center gap-3 pl-9 pr-3 py-2 rounded-xl text-[13px] font-medium transition-all group',
                                    isSubActive ? 'bg-emerald-500/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'
                                  )}>
                                  <sub.icon className={cn('w-3.5 h-3.5', isSubActive ? 'text-emerald-400' : 'group-hover:text-emerald-400')} />
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

                const isActive = pathname === (item as any).href;
                return (
                  <Link key={(item as any).href} href={(item as any).href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                      isActive ? 'bg-emerald-500/10 text-white border border-emerald-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}>
                    <item.icon className={cn('w-4 h-4 transition-all', isActive ? 'text-emerald-400' : 'group-hover:text-emerald-400 group-hover:scale-110')} />
                    <span>{item.label}</span>
                    {isActive && <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </Link>
                );
              })}
            </nav>

            {/* Streak badge */}
            <div className="px-4 mt-auto">
              <div className={cn('p-4 rounded-2xl border', streak > 0 ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20' : 'bg-white/5 border-white/5')}>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{t('profile.coding_streak')}</p>
                <div className="flex items-center gap-2">
                  <Flame className={cn('w-5 h-5', streak > 0 ? 'text-orange-400' : 'text-gray-600')} />
                  <p className={cn('text-lg font-black', streak > 0 ? 'text-white' : 'text-gray-600')}>
                    {streak > 0 ? `${streak} ${t('common.days')}` : `0 ${t('common.days')}`}
                  </p>
                </div>
                {streak === 0 && <p className="text-[9px] text-gray-600 mt-1">{t('dashboard.start_logging')}</p>}
              </div>
            </div>

            {/* User + Logout */}
            <div className="mt-3 px-3 border-t border-white/10 pt-3">
              <Link href="/settings"
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group mb-1',
                  pathname === '/settings' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
                  {user.username.substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{user.username}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
                <Settings className="w-4 h-4 text-gray-600 group-hover:text-gray-300 shrink-0" />
              </Link>

              <button onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all group">
                <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Global Command Palette */}
      <CommandSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
