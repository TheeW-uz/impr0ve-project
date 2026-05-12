'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User as UserIcon, Mail, Shield, Bell, Camera, 
  Loader2, Check, Lock, Globe, Smartphone, Trash2,
  Calendar, Zap, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';

type SettingsTab = 'profile' | 'account' | 'notifications';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
  });

  // Account state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Notifications state
  const [notifs, setNotifs] = useState(user?.preferences.notifications || {
    dailyReminders: true,
    goalDeadlines: true,
    marketing: false
  });

  if (!user) return null;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    updateProfile(profileData);
    setIsSaving(false);
    toast({ title: 'Profile updated', description: 'Your public profile has been updated.', variant: 'success' });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Error', description: 'New passwords do not match.', variant: 'error' });
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulated password update
    setPasswords({ current: '', new: '', confirm: '' });
    setIsSaving(false);
    toast({ title: 'Password updated', description: 'Your security credentials have been changed.', variant: 'success' });
  };

  const handleNotifToggle = (key: keyof typeof notifs) => {
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);
    updateProfile({
      preferences: {
        ...user.preferences,
        notifications: updated
      }
    });
    toast({ title: 'Preference updated', description: 'Notification settings saved.', variant: 'success' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Sidebar Tabs - Horizontal on mobile, vertical on desktop */}
        <div className="flex overflow-x-auto no-scrollbar lg:flex-col gap-1 -mx-4 px-4 md:mx-0 md:px-0">
          {[
            { id: 'profile', label: 'Profile', icon: UserIcon },
            { id: 'account', label: 'Account & Security', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] md:text-sm font-medium transition-all group whitespace-nowrap min-w-fit lg:w-full',
                activeTab === tab.id
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              )}
            >
              <tab.icon className={cn('w-4 h-4', activeTab === tab.id ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-400')} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="p-6 pb-2"><CardTitle className="text-xl font-bold">Public Profile</CardTitle></CardHeader>
                  <CardContent className="p-6 pt-4">
                    <form onSubmit={handleProfileSave} className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="relative group">
                          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white uppercase shadow-xl shadow-primary-500/20">
                            {user.username.substring(0, 2)}
                          </div>
                          <button type="button" className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="w-5 h-5 text-white" /></button>
                        </div>
                        <div>
                          <h3 className="font-bold text-white">Profile Photo</h3>
                          <p className="text-xs text-gray-500">Update your avatar displayed on your dashboard.</p>
                          <div className="flex gap-2 mt-2">
                            <Button type="button" variant="outline" size="sm" className="h-8 text-xs border-white/10">Upload</Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Username</label>
                          <Input value={profileData.username} onChange={(e) => setProfileData({ ...profileData, username: e.target.value })} className="bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Bio</label>
                          <textarea
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            placeholder="A short description about you..."
                            className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isSaving} className="bg-primary-500 hover:bg-primary-600 font-bold px-8 h-10 rounded-xl">
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="p-6 pb-2"><CardTitle className="text-xl font-bold">Email & Security</CardTitle></CardHeader>
                  <CardContent className="p-6 pt-4 space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Email Address</label>
                      <div className="flex gap-3">
                        <Input value={user.email} disabled className="bg-white/5 border-white/10 opacity-50 flex-1" />
                        <Button variant="outline" size="sm" className="border-white/10 h-10">Verify</Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-primary-400" /> Change Password</h4>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <Input type="password" placeholder="Current Password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="bg-white/5 border-white/10" required />
                        <div className="grid grid-cols-2 gap-4">
                          <Input type="password" placeholder="New Password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="bg-white/5 border-white/10" required />
                          <Input type="password" placeholder="Confirm New" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="bg-white/5 border-white/10" required />
                        </div>
                        <Button type="submit" disabled={isSaving} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold h-10 rounded-xl">
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-500/5 border-red-500/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-red-400">Delete Account</h4>
                        <p className="text-xs text-gray-500 mt-1">Permanently remove all your data and access.</p>
                      </div>
                      <Button variant="ghost" className="text-red-400 border border-red-500/20 hover:bg-red-500/10 h-10 px-6">Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div key="notifs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="p-6 pb-2"><CardTitle className="text-xl font-bold">Preferences</CardTitle></CardHeader>
                  <CardContent className="p-6 pt-4 space-y-6">
                    {[
                      { id: 'dailyReminders', label: 'Daily Goal Reminders', desc: 'Get notified to start your daily goals every morning.', icon: Zap },
                      { id: 'goalDeadlines', label: 'Deadline Alerts', desc: 'Receive alerts when your monthly or yearly goals are ending.', icon: Calendar },
                      { id: 'marketing', label: 'Product Updates', desc: 'Occasional emails about new features and productivity tips.', icon: MessageSquare },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleNotifToggle(item.id as keyof typeof notifs)}
                          className={cn(
                            'w-12 h-6 rounded-full transition-all relative',
                            notifs[item.id as keyof typeof notifs] ? 'bg-primary-500' : 'bg-white/10'
                          )}
                        >
                          <motion.div
                            animate={{ x: notifs[item.id as keyof typeof notifs] ? 26 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
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
