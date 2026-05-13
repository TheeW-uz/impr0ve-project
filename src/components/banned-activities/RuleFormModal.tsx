'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RuleFormData {
  title: string;
  description: string;
  appliesTo: 'TODO' | 'MONTHLY' | 'YEARLY';
  failedCountThreshold: number;
  punishmentType: string;
  punishmentAction: string;
  active: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RuleFormData) => void;
  isLoading?: boolean;
  initial?: Partial<RuleFormData>;
  mode?: 'create' | 'edit';
}

const PUNISHMENT_TYPES = ['Exercise', 'No Privilege', 'Study', 'Cold Shower', 'Reflection', 'Recovery Plan', 'Custom'];

export function RuleFormModal({ open, onClose, onSubmit, isLoading, initial, mode = 'create' }: Props) {
  const [form, setForm] = useState<RuleFormData>({
    title: '', description: '', appliesTo: 'TODO',
    failedCountThreshold: 1, punishmentType: 'Exercise', punishmentAction: '', active: true,
  });

  useEffect(() => {
    if (initial) setForm(f => ({ ...f, ...initial }));
  }, [initial, open]);

  const set = (k: keyof RuleFormData, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.punishmentAction.trim()) return;
    onSubmit(form);
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm';
  const labelCls = 'block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5';

  const appliesToLabels = { TODO: '📋 To-Do List', MONTHLY: '📅 Monthly Goals', YEARLY: '🗓️ Yearly Goals' };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">
                {mode === 'create' ? 'Add Punishment Rule' : 'Edit Punishment Rule'}
              </h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className={labelCls}>Rule Title *</label>
                <input autoFocus value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Too many failed to-dos" className={inputCls} required />
              </div>

              <div>
                <label className={labelCls}>Applies To *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['TODO', 'MONTHLY', 'YEARLY'] as const).map(opt => (
                    <button key={opt} type="button"
                      onClick={() => set('appliesTo', opt)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        form.appliesTo === opt
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {appliesToLabels[opt]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Failed Count Threshold *</label>
                <div className="flex items-center gap-3">
                  <input type="number" min={1} max={100} value={form.failedCountThreshold}
                    onChange={e => set('failedCountThreshold', parseInt(e.target.value) || 1)}
                    className={`${inputCls} w-28 text-center text-lg font-bold`} />
                  <p className="text-sm text-gray-500 flex-1">
                    {form.appliesTo === 'TODO' ? 'failed to-do tasks' : form.appliesTo === 'MONTHLY' ? 'failed monthly goals' : 'failed yearly goals'} trigger this rule
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Punishment Type *</label>
                  <select value={form.punishmentType} onChange={e => set('punishmentType', e.target.value)} className={inputCls}>
                    {PUNISHMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Punishment Action *</label>
                <input value={form.punishmentAction} onChange={e => set('punishmentAction', e.target.value)}
                  placeholder="e.g. Do 20 pushups, No gaming for 1 day…"
                  className={inputCls} required />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Optional: explain why this consequence matters"
                  rows={2} className={`${inputCls} resize-none`} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 h-11 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading || !form.title.trim() || !form.punishmentAction.trim()}
                  className="flex-1 h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all disabled:opacity-50">
                  {isLoading ? 'Saving…' : mode === 'create' ? 'Create Rule' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
