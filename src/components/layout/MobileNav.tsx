'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Target, List, Code, Menu, Settings, LogOut, X, Calendar, CalendarRange, Star, ShieldBan, User as UserIcon, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-store';
import { useLanguage } from '@/lib/language-context';
import { CommandSearch } from './CommandSearch';

export function MobileNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [showMore, setShowMore] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isPublicRoute = ['/login', '/register', '/forgot-password', '/'].includes(pathname);
  if (!user || isPublicRoute) return null;

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { href: '/todo',      label: t('nav.todo').split(' ')[0], icon: Target },
    { href: '/coding',    label: t('nav.coding'),    icon: Code },
    { href: '/search',    label: t('common.search'), icon: Search },
  ];

  const moreItems = [
    { href: '/goals/monthly',     label: t('nav.monthly_goals'),     icon: Calendar },
    { href: '/goals/yearly',      label: t('nav.yearly_goals'),      icon: CalendarRange },
    { href: '/goals/lifetime',    label: t('nav.lifetime_goals'),    icon: Star },
    { href: '/side-quests',       label: t('nav.side_quests'),       icon: List },
    { href: '/stuff',             label: t('nav.stuff_todo'),        icon: List },
    { href: '/banned-activities', label: t('nav.banned_activities'), icon: ShieldBan },
    { href: '/settings',          label: t('nav.settings'),          icon: Settings },
  ];

  return (
    <>
      {/* Top Mobile Bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-[10px]">i</div>
          <span className="text-sm font-bold tracking-tight text-white">impr0ve</span>
        </div>
        <Link href="/settings" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
            {user.username.substring(0, 2)}
          </div>
        </Link>
      </div>

      {/* More Menu Drawer */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-white/10 rounded-t-[2.5rem] z-50 lg:hidden overflow-hidden"
            >
              <div className="p-6 pb-10">
                {/* User Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-xl font-black text-white uppercase">
                      {user.username.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{user.username}</h4>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowMore(false)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Grid Links */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {moreItems.map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setShowMore(false)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2.5 p-5 rounded-[1.75rem] border transition-all',
                        pathname === item.href
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-white'
                          : 'bg-white/[0.03] border-white/5 hover:bg-white/5 text-gray-400 hover:text-white'
                      )}>
                      <item.icon className={cn('w-5 h-5', pathname === item.href ? 'text-emerald-400' : '')} />
                      <span className="text-xs font-bold text-center leading-tight">{item.label}</span>
                    </Link>
                  ))}
                  <button onClick={() => { logout(); setShowMore(false); }}
                    className="flex flex-col items-center justify-center gap-2.5 p-5 rounded-[1.75rem] bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all text-red-400">
                    <LogOut className="w-5 h-5" />
                    <span className="text-xs font-bold">{t('nav.logout')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gray-950/80 backdrop-blur-2xl border-t border-white/5 z-40 flex items-center justify-around px-2 lg:hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          if (href === '/search') {
            return (
              <button key="search-btn" onClick={() => setSearchOpen(true)}
                className="flex flex-col items-center justify-center gap-1 w-full h-full text-gray-500 hover:text-gray-400 transition-all">
                <Search className="w-5 h-5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
              </button>
            );
          }

          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
          return (
            <Link key={href} href={href}
              className={cn('flex flex-col items-center justify-center gap-1 w-full h-full transition-all relative',
                isActive ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-400')}>
              <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
              <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
              {isActive && (
                <motion.div layoutId="mobile-nav-active"
                  className="absolute -top-px w-8 h-[2px] bg-emerald-400 rounded-full" />
              )}
            </Link>
          );
        })}
        <button onClick={() => setShowMore(true)}
          className={cn('flex flex-col items-center justify-center gap-1 w-full h-full transition-all', showMore ? 'text-emerald-400' : 'text-gray-500')}>
          <Menu className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
        </button>
      </nav>

      {/* Global Command Palette */}
      <CommandSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
