'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, AlertTriangle, Flame, Pencil, Trash2, RotateCcw, ShieldOff, TrendingUp } from 'lucide-react';
import { BannedActivityService } from '@/lib/services';
import { ActivityFormModal } from './ActivityFormModal';
import { toast } from 'sonner';

const SEVERITY_CONFIG = {
  LOW:    { label: 'Low',    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  MEDIUM: { label: 'Medium', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'   },
  HIGH:   { label: 'High',   color: 'text-red-400 bg-red-500/10 border-red-500/20'             },
};

export function BannedActivitiesTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['bannedActivities'],
    queryFn: () => BannedActivityService.getAll().then(r => r.data.data),
  });

  const createMut = useMutation({
    mutationFn: BannedActivityService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bannedActivities'] });
      setShowModal(false);
      toast.success('Activity banned!');
    },
    onError: () => toast.error('Failed to add activity'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => BannedActivityService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bannedActivities'] });
      setEditItem(null);
      toast.success('Activity updated');
    },
    onError: () => toast.error('Failed to update activity'),
  });

  const deleteMut = useMutation({
    mutationFn: BannedActivityService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bannedActivities'] });
      toast.success('Activity removed');
    },
    onError: () => toast.error('Failed to delete'),
  });

  const breakMut = useMutation({
    mutationFn: BannedActivityService.markBroken,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bannedActivities'] });
      toast('Logged 💔', { description: 'Noted. Get back on track.' });
    },
    onError: () => toast.error('Failed to log'),
  });

  const filtered = (activities as any[]).filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.category ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = !severityFilter || a.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const totalBroken = (activities as any[]).reduce((s: number, a: any) => s + a.timesBroken, 0);
  const highSeverity = (activities as any[]).filter((a: any) => a.severity === 'HIGH').length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      {(activities as any[]).length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Banned', value: (activities as any[]).length, icon: ShieldOff, color: 'text-red-400' },
            { label: 'Times Broken', value: totalBroken, icon: Flame, color: 'text-orange-400' },
            { label: 'High Severity', value: highSeverity, icon: AlertTriangle, color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
              <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search activities…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all" />
        </div>
        <div className="flex gap-2">
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-white/20 transition-all">
            <option value="">All Severities</option>
            <option value="LOW">🟢 Low</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="HIGH">🔴 High</option>
          </select>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all shadow-lg shadow-red-600/20">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="py-24 text-center border-2 border-dashed border-white/5 rounded-2xl">
          <ShieldOff className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {search || severityFilter ? 'No matches found' : 'No banned activities yet'}
          </h3>
          <p className="text-gray-600 text-sm max-w-xs mx-auto mb-6">
            {search || severityFilter ? 'Try adjusting your filters' : 'Start tracking habits you want to eliminate from your life.'}
          </p>
          {!search && !severityFilter && (
            <button onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all">
              Add First Rule
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <AnimatePresence>
            {filtered.map((a: any, i: number) => {
              const sev = SEVERITY_CONFIG[a.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.LOW;
              return (
                <motion.div key={a.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 group hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-sm truncate">{a.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sev.color}`}>
                          {sev.label}
                        </span>
                        {a.category && (
                          <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                            {a.category}
                          </span>
                        )}
                      </div>
                      {a.reason && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.reason}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-orange-400">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{a.timesBroken}×</span>
                    </div>
                    {a.lastBrokenAt && (
                      <span className="text-[11px] text-gray-600">
                        Last: {new Date(a.lastBrokenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-700 ml-auto">
                      {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => breakMut.mutate(a.id)}
                      disabled={breakMut.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 text-xs font-bold transition-all"
                    >
                      <Flame className="w-3.5 h-3.5" /> I broke this
                    </button>
                    <button onClick={() => setEditItem(a)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteMut.mutate(a.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create modal */}
      <ActivityFormModal
        open={showModal} onClose={() => setShowModal(false)}
        onSubmit={(data) => createMut.mutate(data)}
        isLoading={createMut.isPending} mode="create"
      />

      {/* Edit modal */}
      <ActivityFormModal
        open={!!editItem} onClose={() => setEditItem(null)}
        onSubmit={(data) => updateMut.mutate({ id: editItem?.id, data })}
        isLoading={updateMut.isPending} mode="edit"
        initial={editItem ? {
          title: editItem.title, reason: editItem.reason ?? '',
          category: editItem.category ?? '', severity: editItem.severity, notes: editItem.notes ?? '',
        } : undefined}
      />
    </div>
  );
}
