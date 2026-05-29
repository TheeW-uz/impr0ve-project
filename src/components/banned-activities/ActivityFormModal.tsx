'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/language-context';

interface ActivityFormData {
  title: string;
  reason: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ActivityFormData) => void;
  isLoading?: boolean;
  initial?: Partial<ActivityFormData>;
  mode?: 'create' | 'edit';
}

const CATEGORIES = ['Social Media', 'Gaming', 'Food', 'Time Wasting', 'Health', 'Work', 'Sleep', 'Other'];

export function ActivityFormModal({ open, onClose, onSubmit, isLoading, initial, mode = 'create' }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState<ActivityFormData>({
    title: '', reason: '', category: '', severity: 'LOW', notes: '',
  });

  useEffect(() => {
    if (initial) setForm({ title: '', reason: '', category: '', severity: 'LOW', notes: '', ...initial });
  }, [initial, open]);

  const set = (k: keyof ActivityFormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all text-sm';
  const labelCls = 'block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5';

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
                {mode === 'create' ? t('banned.modal_create_title') : t('banned.modal_edit_title')}
              </h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className={labelCls}>{t('banned.field_title')} *</label>
                <input
                  autoFocus value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder={t('banned.field_title_placeholder')}
                  className={inputCls} required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t('banned.field_category')}</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
                    <option value="">{t('banned.field_category_placeholder')}</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {t(`banned.categories.${c.toLowerCase().replace(/\s+/g, '_')}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t('banned.field_severity')}</label>
                  <select value={form.severity} onChange={e => set('severity', e.target.value as any)} className={inputCls}>
                    <option value="LOW">🟢 {t('banned.severity_low')}</option>
                    <option value="MEDIUM">🟡 {t('banned.severity_medium')}</option>
                    <option value="HIGH">🔴 {t('banned.severity_high')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>{t('banned.field_reason')}</label>
                <input value={form.reason} onChange={e => set('reason', e.target.value)}
                  placeholder={t('banned.field_reason_placeholder')}
                  className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>{t('banned.field_notes')}</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                  placeholder={t('banned.field_notes_placeholder')}
                  rows={3} className={`${inputCls} resize-none`} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 h-11 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
                  {t('banned.cancel')}
                </button>
                <button type="submit" disabled={isLoading || !form.title.trim()}
                  className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? t('banned.saving') : mode === 'create' ? t('banned.add_activity') : t('banned.save')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
