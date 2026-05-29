'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsService } from '@/lib/services';
import { useAuth } from '@/lib/auth-store';
import { useLanguage } from '@/lib/language-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User as UserIcon, Bell, Lock, Camera, Loader2,
  Globe, Zap, Calendar, MessageSquare, ShieldCheck,
  Fingerprint, Eye, EyeOff, Check, Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'language';

const LANG_OPTIONS = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'uz', label: "O'zbekcha", native: "O'zbek tili", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', native: 'Русский язык', flag: '🇷🇺' },
] as const;

const STATUS_SUGGESTIONS = [
  { emoji: '💻', text: 'Building projects' },
  { emoji: '📚', text: 'Studying right now' },
  { emoji: '🚀', text: 'In deep focus' },
  { emoji: '⚙️', text: 'Working on systems' },
  { emoji: '🎯', text: 'Grinding consistency' },
  { emoji: '🔬', text: 'Learning algorithms' },
];

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [statusText, setStatusText] = useState('');
  const [statusEmoji, setStatusEmoji] = useState('');
  const [profileVisible, setProfileVisible] = useState(true);
  const [selectedLang, setSelectedLang] = useState<'en' | 'uz' | 'ru'>(language);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => SettingsService.getSettings().then(res => res.data.data),
  });

  const { data: userData } = useQuery({
    queryKey: ['me'],
    queryFn: () => import('@/lib/services').then(m => m.AuthService.getMe().then(r => r.data.data)),
  });

  useEffect(() => {
    if (userData) {
      setStatusText(userData.statusText || '');
      setStatusEmoji(userData.statusEmoji || '');
      setProfileVisible(userData.profileVisible ?? true);
    }
  }, [userData]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => import('@/lib/services').then(m => m.UserService.updateProfile(data)),
    onSuccess: (res) => {
      updateProfile(res.data.data);
      toast.success(t('settings.profile_updated'));
    },
    onError: () => toast.error(t('common.error_generic')),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => SettingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success(t('common.synced'));
    },
    onError: () => toast.error(t('common.error_generic')),
  });

  const saveLang = () => {
    setLanguage(selectedLang);
    updateSettingsMutation.mutate({ locale: selectedLang });
    toast.success(t('settings.language_applied'));
  };

  const saveStatus = () => {
    updateSettingsMutation.mutate({ statusText, statusEmoji, profileVisible });
  };

  if (!user) return null;

  const tabs = [
    { id: 'profile', label: t('settings.identity_tab'), icon: UserIcon, color: 'text-emerald-400' },
    { id: 'language', label: t('settings.language_tab'), icon: Languages, color: 'text-blue-400' },
    { id: 'account', label: t('settings.security_tab'), icon: ShieldCheck, color: 'text-purple-400' },
    { id: 'notifications', label: t('settings.signals_tab'), icon: Bell, color: 'text-amber-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 lg:pb-12 px-2">
      <header className="flex items-center gap-6 px-1 pt-4">
        <div className="w-16 h-16 rounded-[2rem] bg-white/[0.03] flex items-center justify-center border border-white/10 shadow-2xl rotate-3 shrink-0">
          <Fingerprint className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            {t('settings.title')}
          </h1>
          <p className="text-gray-500 mt-1 text-xs font-bold uppercase tracking-widest">
            {t('settings.subtitle')}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Nav Rail */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={cn(
                'w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group',
                activeTab === tab.id
                  ? 'bg-white/[0.05] border border-white/10'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
              )}
            >
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all', activeTab === tab.id ? 'bg-white/10' : '')}>
                <tab.icon className={cn('w-4 h-4', activeTab === tab.id ? tab.color : 'text-gray-600')} />
              </div>
              <span className={cn('font-black text-xs uppercase tracking-widest', activeTab === tab.id ? 'text-white' : 'text-gray-500')}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* IDENTITY */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <CardHeader className="p-8 pb-2">
                    <CardTitle className="text-2xl font-black text-white tracking-tight">{t('settings.identity_title')}</CardTitle>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{t('settings.identity_desc')}</p>
                  </CardHeader>
                  <CardContent className="p-8 pt-6">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      updateProfileMutation.mutate({ username: fd.get('username'), bio: fd.get('bio') });
                    }} className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="relative group shrink-0">
                          <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white uppercase shadow-xl">
                            {user.username.substring(0, 2)}
                          </div>
                          <button type="button" className="absolute inset-0 bg-black/60 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <Camera className="w-5 h-5 text-white" />
                          </button>
                        </div>
                        <div>
                          <p className="font-black text-white">{user.username}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">{t('settings.username_label')}</label>
                        <Input name="username" defaultValue={user.username} className="h-12 bg-white/5 border-white/10 rounded-2xl text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">{t('settings.bio_label')}</label>
                        <textarea name="bio" defaultValue={user.bio || ''} placeholder={t('settings.bio_placeholder')} className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none" />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={updateProfileMutation.isPending} className="bg-emerald-500 hover:bg-emerald-600 font-black px-10 h-12 rounded-2xl text-black shadow-lg shadow-emerald-500/20">
                          {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('settings.save_changes')}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Status + Visibility */}
                <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <CardHeader className="p-8 pb-2">
                    <CardTitle className="text-xl font-black text-white tracking-tight">{t('settings.status_title')}</CardTitle>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{t('settings.status_desc')}</p>
                  </CardHeader>
                  <CardContent className="p-8 pt-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl cursor-pointer hover:bg-white/10 transition-all">
                        {statusEmoji || '😶'}
                      </div>
                      <Input
                        value={statusText}
                        onChange={e => setStatusText(e.target.value)}
                        placeholder={t('settings.status_placeholder')}
                        maxLength={120}
                        className="h-12 bg-white/5 border-white/10 rounded-2xl text-white flex-1 outline-none"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_SUGGESTIONS.map(s => (
                        <button key={s.text} onClick={() => { setStatusEmoji(s.emoji); setStatusText(s.text); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-xs font-bold text-gray-400 hover:text-white transition-all">
                          {s.emoji} {s.text}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-sm">{t('settings.visibility_title')}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{t('settings.visibility_desc')}</p>
                        </div>
                        <button onClick={() => setProfileVisible(v => !v)}
                          className={cn('w-12 h-6 rounded-full transition-all relative flex items-center px-0.5', profileVisible ? 'bg-emerald-500' : 'bg-white/10')}>
                          <motion.div animate={{ x: profileVisible ? 24 : 2 }} className="w-5 h-5 bg-white rounded-full shadow-lg" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        {profileVisible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-gray-600" />}
                        <span>{profileVisible ? t('profile.visibility_public') : t('profile.visibility_private')}</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={saveStatus} disabled={updateSettingsMutation.isPending} className="bg-white/10 hover:bg-white/20 font-black px-8 h-11 rounded-2xl text-white text-xs uppercase tracking-wider">
                        {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('settings.save_status')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* LANGUAGE */}
            {activeTab === 'language' && (
              <motion.div key="language" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <CardHeader className="p-8 pb-2">
                    <CardTitle className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                      <Globe className="w-6 h-6 text-blue-400" /> {t('settings.language_title')}
                    </CardTitle>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{t('settings.language_desc')}</p>
                  </CardHeader>
                  <CardContent className="p-8 pt-6 space-y-6">
                    <div className="space-y-3">
                      {LANG_OPTIONS.map(lang => (
                        <button key={lang.code} onClick={() => setSelectedLang(lang.code)}
                          className={cn(
                            'w-full flex items-center gap-5 p-5 rounded-2xl border transition-all text-left',
                            selectedLang === lang.code
                              ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5'
                              : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                          )}>
                          <span className="text-3xl">{lang.flag}</span>
                          <div className="flex-1">
                            <p className="font-black text-white">{lang.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{lang.native}</p>
                          </div>
                          {selectedLang === lang.code && (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 text-xs text-gray-500 leading-relaxed">
                      <strong className="text-gray-400">Note:</strong> {t('settings.language_note')}
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={saveLang} disabled={selectedLang === language} className="bg-blue-500 hover:bg-blue-600 font-black px-10 h-12 rounded-2xl text-white shadow-lg shadow-blue-500/20 disabled:opacity-50">
                        {t('settings.apply_language')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* SECURITY */}
            {activeTab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <CardHeader className="p-8 pb-2">
                    <CardTitle className="text-2xl font-black text-white tracking-tight">{t('settings.security_title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-6 space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">{t('settings.email_label')}</label>
                      <div className="flex gap-3">
                        <Input value={user.email} disabled className="h-12 bg-white/5 border-white/10 opacity-50 rounded-2xl flex-1 text-white font-bold" />
                        <Button variant="outline" className="h-12 rounded-2xl border-white/10 px-6 font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10 shrink-0">{t('settings.email_verified')}</Button>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5 space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Lock className="w-4 h-4 text-purple-400" /> {t('settings.change_password')}
                      </h4>
                      <Input type="password" placeholder={t('settings.current_password')} className="h-12 bg-white/5 border-white/10 rounded-2xl text-white outline-none" />
                      <div className="grid grid-cols-2 gap-3">
                        <Input type="password" placeholder={t('settings.new_password')} className="h-12 bg-white/5 border-white/10 rounded-2xl text-white outline-none" />
                        <Input type="password" placeholder={t('settings.confirm_password')} className="h-12 bg-white/5 border-white/10 rounded-2xl text-white outline-none" />
                      </div>
                      <Button className="w-full bg-white/10 hover:bg-white/20 text-white font-black h-12 rounded-2xl text-xs uppercase tracking-widest">{t('settings.update_password')}</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <motion.div key="notifs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <CardHeader className="p-8 pb-2">
                    <CardTitle className="text-2xl font-black text-white tracking-tight">{t('settings.notifications_title')}</CardTitle>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{t('settings.notifications_desc')}</p>
                  </CardHeader>
                  <CardContent className="p-8 pt-6 space-y-4">
                    {[
                      { id: 'dailyReminders', label: t('settings.notif_reminders'), desc: t('settings.notif_reminders_desc'), icon: Zap, color: 'text-emerald-400' },
                      { id: 'goalDeadlines', label: t('settings.notif_deadlines'), desc: t('settings.notif_deadlines_desc'), icon: Calendar, color: 'text-blue-400' },
                      { id: 'marketingEmails', label: t('settings.notif_marketing'), desc: t('settings.notif_marketing_desc'), icon: MessageSquare, color: 'text-amber-400' },
                    ].map(item => (
                      <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn('w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center', item.color)}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                        <button onClick={() => updateSettingsMutation.mutate({ [item.id]: !(settings?.[item.id] ?? true) })}
                          className={cn('w-11 h-6 rounded-full transition-all relative flex items-center px-0.5', (settings?.[item.id] ?? true) ? 'bg-emerald-500' : 'bg-white/10')}>
                          <motion.div animate={{ x: (settings?.[item.id] ?? true) ? 21 : 2 }} className="w-5 h-5 bg-white rounded-full shadow-lg" />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
