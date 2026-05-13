"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsService, UserService } from '@/lib/services';
import { useAuth } from '@/lib/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User as UserIcon, Mail, Shield, Bell, Camera, 
  Loader2, Check, Lock, Globe, Smartphone, Trash2,
  Calendar, Zap, MessageSquare, ShieldCheck, Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';

type SettingsTab = 'profile' | 'account' | 'notifications';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => SettingsService.getSettings().then(res => res.data.data),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => UserService.updateProfile(data),
    onSuccess: (res) => {
      updateProfile(res.data.data);
      toast({ title: 'Profile updated', description: 'Your public identity has been evolved.', variant: 'success' });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => SettingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({ title: 'Preferences saved', description: 'Your system configuration is updated.', variant: 'success' });
    }
  });

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 lg:pb-12 px-2">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-white/[0.03] flex items-center justify-center border border-white/10 shadow-2xl rotate-3">
            <Fingerprint className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">System Config</h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <span className="text-emerald-500/80 font-black uppercase tracking-[0.2em] text-[10px]">User Parameters</span>
              <span className="w-1 h-1 rounded-full bg-gray-800" />
              <span className="text-sm font-medium">Personalize your execution environment</span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Navigation Rail */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'profile', label: 'Identity', icon: UserIcon, color: 'text-emerald-400' },
            { id: 'account', label: 'Security', icon: ShieldCheck, color: 'text-blue-400' },
            { id: 'notifications', label: 'Signals', icon: Bell, color: 'text-amber-400' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={cn(
                'w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-300 group',
                activeTab === tab.id
                  ? 'bg-white/[0.05] border border-white/10 shadow-xl'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500',
                activeTab === tab.id ? 'bg-white/10' : 'bg-transparent'
              )}>
                <tab.icon className={cn('w-5 h-5', activeTab === tab.id ? tab.color : 'text-gray-600')} />
              </div>
              <span className={cn('font-black text-xs uppercase tracking-widest', activeTab === tab.id ? 'text-white' : 'text-gray-500')}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content Console */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card className="bg-white/[0.02] border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                  <CardHeader className="p-10 pb-2">
                    <CardTitle className="text-3xl font-black text-white tracking-tight">Public Identity</CardTitle>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">How you appear in the collective</p>
                  </CardHeader>
                  <CardContent className="p-10 pt-8">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      updateProfileMutation.mutate({
                        username: formData.get('username'),
                        bio: formData.get('bio'),
                      });
                    }} className="space-y-10">
                      <div className="flex items-center gap-8">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-4xl font-black text-white uppercase shadow-2xl shadow-emerald-500/20">
                            {user.username.substring(0, 2)}
                          </div>
                          <button type="button" className="absolute inset-0 bg-black/60 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <Camera className="w-6 h-6 text-white" />
                          </button>
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">Avatar Matrix</h3>
                          <p className="text-xs text-gray-500 font-medium">Neural visualization of your presence.</p>
                          <div className="flex gap-2 mt-4">
                            <Button type="button" variant="outline" size="sm" className="h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 font-bold px-6">Upload New</Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Username Handle</label>
                          <Input name="username" defaultValue={user.username} className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Mission Directive (Bio)</label>
                          <textarea
                            name="bio"
                            defaultValue={user.bio || ''}
                            placeholder="Define your purpose..."
                            className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={updateProfileMutation.isPending} className="bg-emerald-500 hover:bg-emerald-600 font-black px-12 h-14 rounded-2xl text-black shadow-xl shadow-emerald-500/20 transition-all">
                          {updateProfileMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Identity'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <Card className="bg-white/[0.02] border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                  <CardHeader className="p-10 pb-2">
                    <CardTitle className="text-3xl font-black text-white tracking-tight">Access Control</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-8 space-y-10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Recovery Email</label>
                      <div className="flex gap-4">
                        <Input value={user.email} disabled className="h-14 bg-white/5 border-white/10 opacity-40 rounded-2xl flex-1 text-white font-bold" />
                        <Button variant="outline" className="h-14 rounded-2xl border-white/10 px-8 font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10">Verified</Button>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                        <Lock className="w-4 h-4 text-blue-400" /> Security Override
                      </h4>
                      <form className="space-y-6">
                        <Input type="password" placeholder="Current Access Key" className="h-14 bg-white/5 border-white/10 rounded-2xl text-white outline-none" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input type="password" placeholder="New Secret Key" className="h-14 bg-white/5 border-white/10 rounded-2xl text-white outline-none" />
                          <Input type="password" placeholder="Confirm Secret Key" className="h-14 bg-white/5 border-white/10 rounded-2xl text-white outline-none" />
                        </div>
                        <Button type="button" className="w-full bg-white/10 hover:bg-white/20 text-white font-black h-14 rounded-2xl text-xs uppercase tracking-widest transition-all">
                          Rotate Access Credentials
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-500/5 border-red-500/10 rounded-[2.5rem] overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-red-500">Self-Destruct</h4>
                        <p className="text-xs text-gray-500 font-medium mt-1">Permanently erase all traces of your existence from this platform.</p>
                      </div>
                      <Button variant="ghost" className="text-red-500 border border-red-500/20 hover:bg-red-500/10 h-12 rounded-xl px-8 font-black text-xs uppercase tracking-widest">Execute</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div key="notifs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card className="bg-white/[0.02] border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                  <CardHeader className="p-10 pb-2">
                    <CardTitle className="text-3xl font-black text-white tracking-tight">Signal Flow</CardTitle>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Configure your system alerts</p>
                  </CardHeader>
                  <CardContent className="p-10 pt-8 space-y-6">
                    {[
                      { id: 'dailyReminders', label: 'Execution Alerts', desc: 'Neural nudge to initiate your daily mission objectives.', icon: Zap, color: 'text-emerald-400' },
                      { id: 'goalDeadlines', label: 'Timeline Critical', desc: 'Priority signal when strategic horizons are approaching.', icon: Calendar, color: 'text-blue-400' },
                      { id: 'marketing', label: 'System Briefings', desc: 'Updates on platform evolution and protocol enhancements.', icon: MessageSquare, color: 'text-amber-400' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
                        <div className="flex items-center gap-6">
                          <div className={cn('w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center', item.color)}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-lg font-black text-white">{item.label}</p>
                            <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const current = settings?.[item.id] ?? true;
                            updateSettingsMutation.mutate({ [item.id]: !current });
                          }}
                          className={cn(
                            'w-14 h-7 rounded-full transition-all relative flex items-center px-1',
                            (settings?.[item.id] ?? true) ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/10'
                          )}
                        >
                          <motion.div
                            animate={{ x: (settings?.[item.id] ?? true) ? 28 : 0 }}
                            className="w-5 h-5 bg-white rounded-full shadow-lg"
                          />
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

