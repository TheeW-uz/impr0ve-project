'use client';

import { useQuery } from '@tanstack/react-query';
import { SocialService } from '@/lib/services';
import { motion } from 'framer-motion';
import { Flame, Zap, Shield, Clock, Code, Target, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const BADGE_CONFIG: Record<string, { label: string; emoji: string; color: string; desc: string }> = {
  FIRST_SPRINT: { label: 'First Sprint', emoji: '⚡', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', desc: 'Logged your first coding session' },
  STREAK_7: { label: '7-Day Streak', emoji: '🔥', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', desc: 'Coded for 7 consecutive days' },
  STREAK_30: { label: '30-Day Streak', emoji: '💎', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', desc: 'Coded for 30 consecutive days' },
  CLEAN_WEEK: { label: 'Clean Week', emoji: '🛡️', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: '7 days without any relapse' },
  FIRST_GOAL: { label: 'Goal Setter', emoji: '🎯', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', desc: 'Created your first learning goal' },
  CONSISTENCY: { label: 'Consistency', emoji: '📈', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20', desc: 'Active for 14+ days total' },
};

const getRankTitle = (lvl: number) => {
  if (lvl <= 2) return 'Beginner Learner';
  if (lvl <= 4) return 'Consistent Builder';
  if (lvl <= 6) return 'SaaS Creator';
  if (lvl <= 8) return 'Staff Developer';
  if (lvl <= 10) return 'Systems Specialist';
  if (lvl <= 12) return 'Abstractions Architect';
  return 'Elite Technical Leader';
};

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['public-profile', params.username],
    queryFn: () => SocialService.getPublicProfile(params.username).then(r => r.data.data),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="h-40 bg-white/5 rounded-[2.5rem] animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    const isPrivate = (error as any)?.response?.status === 403;
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        {isPrivate ? <Lock className="w-14 h-14 text-gray-600 mx-auto" /> : <Shield className="w-14 h-14 text-gray-600 mx-auto" />}
        <h2 className="text-2xl font-black text-white">{isPrivate ? 'Private Profile' : 'Profile Not Found'}</h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          {isPrivate ? 'This developer has set their profile to private.' : `No developer with username "${params.username}" exists.`}
        </p>
        <Link href="/search" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>
      </div>
    );
  }

  const unlockedKeys = new Set(profile.achievements.map((a: any) => a.badgeKey));
  const levelProgress = Math.min(100, ((profile.xp - (profile.level - 1) * 1000) / 1000) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 lg:pb-12 space-y-8">
      <div className="pt-6">
        <Link href="/search" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white font-bold uppercase tracking-widest transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
        </Link>
      </div>

      {/* Profile Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-[1.75rem] bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white uppercase shadow-2xl shrink-0">
              {profile.username.substring(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">{profile.username}</h1>
              <p className="text-xs font-black uppercase tracking-widest text-blue-400 mt-0.5">{getRankTitle(profile.level)}</p>
              {profile.bio && <p className="text-sm text-gray-400 mt-2 max-w-xs">{profile.bio}</p>}
            </div>
          </div>

          {profile.statusText && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-sm text-gray-300 shrink-0">
              {profile.statusEmoji && <span>{profile.statusEmoji}</span>}
              <span className="font-medium">{profile.statusText}</span>
            </div>
          )}
        </div>

        {/* XP Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
            <span className="text-gray-500">Level {profile.level} — {profile.xp} XP</span>
            <span className="text-blue-400">{profile.level * 1000 - profile.xp} XP to next level</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: profile.xp, icon: Zap, color: 'text-amber-400' },
          { label: 'Coding Streak', value: `${profile.codingStats?.currentStreak || 0}d`, icon: Flame, color: 'text-orange-400' },
          { label: 'Total Sessions', value: profile.codingStats?.totalSessions || 0, icon: Code, color: 'text-emerald-400' },
          { label: 'Hours Coded', value: `${Math.round((profile.codingStats?.totalMinutes || 0) / 60)}h`, icon: Clock, color: 'text-blue-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
            <stat.icon className={cn('w-4 h-4 mx-auto mb-2', stat.color)} />
            <p className="text-xl font-black text-white">{stat.value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Active Goals */}
      {profile.codingGoals?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-4">
          <h3 className="font-black text-white text-sm flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <Target className="w-4 h-4 text-emerald-400" /> Active Learning Goals
          </h3>
          <div className="space-y-3">
            {profile.codingGoals.map((g: any) => (
              <div key={g.technology} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-sm text-gray-300 font-medium">{g.technology}</span>
                <span className="ml-auto text-[10px] text-gray-600 font-bold uppercase tracking-wider">{g.currentLevel} → {g.targetLevel}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Achievements / Badges */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-purple-400" /> Earned Badges
        </h3>
        {unlockedKeys.size === 0 ? (
          <p className="text-sm text-gray-600 font-medium py-4 text-center">No badges earned yet — badges unlock through real actions.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(BADGE_CONFIG).map(([key, badge]) => {
              const unlocked = unlockedKeys.has(key);
              const achievement = profile.achievements.find((a: any) => a.badgeKey === key);
              return (
                <div key={key} className={cn('p-4 rounded-2xl border transition-all', unlocked ? badge.color : 'text-gray-700 bg-white/[0.01] border-white/5 opacity-40')}>
                  <span className="text-2xl block mb-2">{badge.emoji}</span>
                  <p className="font-black text-sm">{badge.label}</p>
                  <p className="text-[9px] mt-0.5 opacity-70 leading-normal">{badge.desc}</p>
                  {unlocked && achievement && (
                    <p className="text-[8px] mt-2 opacity-60">
                      {new Date(achievement.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <p className="text-center text-[9px] text-gray-700 font-bold uppercase tracking-widest">
        Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
}
