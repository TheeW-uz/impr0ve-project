'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'react';
import { Search, X, Loader2, User, Trophy, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SocialService } from '@/lib/services';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';

interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const getRankTitle = (lvl: number) => {
  if (lvl <= 2) return 'Beginner Learner';
  if (lvl <= 4) return 'Consistent Builder';
  if (lvl <= 6) return 'SaaS Creator';
  if (lvl <= 8) return 'Staff Developer';
  if (lvl <= 10) return 'Systems Specialist';
  if (lvl <= 12) return 'Abstractions Architect';
  return 'Elite Technical Leader';
};

export function CommandSearch({ isOpen, onClose }: CommandSearchProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['search-users', query],
    queryFn: () => SocialService.searchUsers(query).then(res => res.data.data),
    enabled: query.length >= 2,
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (username: string) => {
    router.push(`/users/${username}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(users.length - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (users[selectedIndex]) {
        handleSelect(users[selectedIndex].username);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      {/* Palette Body */}
      <div
        className="w-full max-w-2xl bg-gray-950/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[70vh]"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <Search className="w-5 h-5 text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('nav.search_placeholder')}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-white placeholder:text-gray-600 focus:outline-none text-sm"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results / Help Panel */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {query.length < 2 ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-gray-700" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600">
                {t('social.search_title')}
              </p>
              <p className="text-[11px] text-gray-700">{t('social.search_min')}</p>
            </div>
          ) : users.length === 0 && !isLoading ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <User className="w-8 h-8 mx-auto text-gray-700" />
              <p className="text-xs font-bold text-gray-600">{t('social.no_results')}</p>
              <p className="text-[11px] text-gray-700">{t('social.no_results_desc')}</p>
            </div>
          ) : (
            users.map((item: any, index: number) => {
              const isSelected = selectedIndex === index;
              return (
                <div
                  key={item.username}
                  onClick={() => handleSelect(item.username)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all border border-transparent',
                    isSelected ? 'bg-emerald-500/10 border-emerald-500/20 text-white' : 'hover:bg-white/[0.02] text-gray-400'
                  )}
                >
                  {/* Left Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-bold text-white text-xs uppercase shrink-0">
                    {item.username.substring(0, 2)}
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.username}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                        {t('coding.level_label')} {item.level || 1}
                      </span>
                    </div>

                    {/* Status text */}
                    {item.statusText ? (
                      <p className="text-xs text-gray-400 truncate mt-1 flex items-center gap-1.5 font-medium">
                        {item.statusEmoji && <span>{item.statusEmoji}</span>}
                        <span>{item.statusText}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-600 italic mt-1 font-medium">{getRankTitle(item.level || 1)}</p>
                    )}
                  </div>

                  {/* Stats highlights */}
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    {item.codingStats?.currentStreak > 0 && (
                      <div className="flex items-center gap-1 text-orange-400 text-xs font-black">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{item.codingStats.currentStreak}d</span>
                      </div>
                    )}
                    <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                      {item.xp || 0} XP
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Command Footer */}
        <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-gray-600 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}
