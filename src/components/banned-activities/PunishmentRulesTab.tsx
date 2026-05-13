'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Pencil, Trash2, CheckCircle2, XCircle, 
  Play, ShieldAlert, History, Settings2, 
  Target, Calendar, CalendarRange, Clock
} from 'lucide-react';
import { PunishmentService } from '@/lib/services';
import { RuleFormModal } from './RuleFormModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function PunishmentRulesTab() {
  const qc = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'rules' | 'history'>('pending');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Queries
  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['punishmentRules'],
    queryFn: () => PunishmentService.getRules().then(r => r.data.data),
  });

  const { data: pendingAssignments = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['punishmentAssignments', 'PENDING'],
    queryFn: () => PunishmentService.getAssignments('PENDING').then(r => r.data.data),
  });

  const { data: historyAssignments = [], isLoading: historyLoading } = useQuery({
    queryKey: ['punishmentAssignments', 'HISTORY'],
    queryFn: () => PunishmentService.getAssignments().then(r => 
      r.data.data.filter((a: any) => a.status !== 'PENDING')
    ),
  });

  // Mutations
  const createMut = useMutation({
    mutationFn: PunishmentService.createRule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['punishmentRules'] });
      setShowModal(false);
      toast.success('Rule created!');
    },
    onError: () => toast.error('Failed to create rule'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => PunishmentService.updateRule(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['punishmentRules'] });
      setEditItem(null);
      toast.success('Rule updated');
    },
    onError: () => toast.error('Failed to update rule'),
  });

  const deleteMut = useMutation({
    mutationFn: PunishmentService.deleteRule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['punishmentRules'] });
      toast.success('Rule deleted');
    },
    onError: () => toast.error('Failed to delete rule'),
  });

  const updateAssignmentMut = useMutation({
    mutationFn: ({ id, data }: any) => PunishmentService.updateAssignment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['punishmentAssignments'] });
      toast.success('Assignment updated');
    },
    onError: () => toast.error('Failed to update assignment'),
  });

  const evaluateMut = useMutation({
    mutationFn: PunishmentService.evaluate,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['punishmentAssignments'] });
      const { created } = res.data.data;
      if (created > 0) {
        toast.success(`Evaluation complete: ${created} new punishment(s) assigned.`);
      } else {
        toast.info('Evaluation complete: No new punishments triggered.');
      }
    },
    onError: () => toast.error('Evaluation failed'),
  });

  const APPLIES_TO_MAP = {
    TODO: { label: 'To-Do List', icon: Target, color: 'text-blue-400' },
    MONTHLY: { label: 'Monthly Goals', icon: Calendar, color: 'text-purple-400' },
    YEARLY: { label: 'Yearly Goals', icon: CalendarRange, color: 'text-orange-400' },
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs & Action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          {[
            { id: 'pending', label: 'Pending', icon: Clock, count: pendingAssignments.length },
            { id: 'rules', label: 'Rules', icon: Settings2, count: rules.length },
            { id: 'history', label: 'History', icon: History },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeSubTab === t.id 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={cn(
                  "ml-1 px-1.5 py-0.5 rounded-md text-[10px]",
                  activeSubTab === t.id ? "bg-white/20 text-white" : "bg-white/10 text-gray-500"
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => evaluateMut.mutate()}
            disabled={evaluateMut.isPending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-xs font-bold transition-all"
          >
            <Play className={cn("w-3.5 h-3.5", evaluateMut.isPending && "animate-spin")} />
            Evaluate Failures
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {activeSubTab === 'rules' && (
          <div className="grid gap-4 md:grid-cols-2">
            {rulesLoading ? (
              [1, 2].map(i => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)
            ) : rules.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <Settings2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No punishment rules yet</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Create rules to automatically assign consequences when you fail to complete your goals on time.</p>
              </div>
            ) : (
              rules.map((rule: any) => {
                const config = APPLIES_TO_MAP[rule.appliesTo as keyof typeof APPLIES_TO_MAP];
                return (
                  <motion.div
                    key={rule.id}
                    layout
                    className={cn(
                      "bg-white/[0.03] border rounded-2xl p-5 group transition-all",
                      rule.active ? "border-white/5 hover:border-white/10" : "border-white/5 opacity-60 grayscale-[0.5]"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white text-sm">{rule.title}</h3>
                          {!rule.active && <span className="text-[10px] bg-white/10 text-gray-500 px-2 py-0.5 rounded-md">Inactive</span>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <config.icon className={cn("w-3.5 h-3.5", config.color)} />
                          <span className="text-[11px] text-gray-500">
                            Threshold: {rule.failedCountThreshold} failed items
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditItem(rule)}
                          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMut.mutate(rule.id)}
                          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3 mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400/60 mb-1">Consequence</p>
                      <p className="text-xs text-purple-200 font-medium">{rule.punishmentAction}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-600">Created {new Date(rule.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => updateMut.mutate({ id: rule.id, data: { active: !rule.active } })}
                        className={cn(
                          "text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full transition-all",
                          rule.active ? "text-purple-400 border border-purple-500/30 hover:bg-purple-500/10" : "text-gray-600 border border-white/10 hover:bg-white/5"
                        )}
                      >
                        {rule.active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {activeSubTab === 'pending' && (
          <div className="space-y-4">
            {pendingLoading ? (
              [1, 2].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)
            ) : pendingAssignments.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Clean slate!</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">No pending punishments. Keep up the good work and finish your goals on time!</p>
              </div>
            ) : (
              pendingAssignments.map((assignment: any) => {
                const config = APPLIES_TO_MAP[assignment.sourceType as keyof typeof APPLIES_TO_MAP];
                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn("p-3 rounded-xl bg-white/5 border border-white/5", config.color)}>
                        <config.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white text-sm">
                            {assignment.rule?.title || 'System Punishment'}
                          </h3>
                          <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
                            {assignment.sourcePeriod}
                          </span>
                        </div>
                        <p className="text-xs text-purple-400 font-bold mb-1">{assignment.punishmentAction}</p>
                        <p className="text-[11px] text-gray-600">{assignment.reason}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateAssignmentMut.mutate({ id: assignment.id, data: { status: 'SKIPPED' } })}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all text-xs font-bold"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Skip
                      </button>
                      <button
                        onClick={() => updateAssignmentMut.mutate({ id: assignment.id, data: { status: 'COMPLETED' } })}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-xs font-bold shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {activeSubTab === 'history' && (
          <div className="space-y-3">
            {historyLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />)
            ) : historyAssignments.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <History className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No history yet</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Your completed or skipped punishments will appear here.</p>
              </div>
            ) : (
              historyAssignments.map((assignment: any) => (
                <div key={assignment.id} className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      assignment.status === 'COMPLETED' ? "bg-emerald-500" : "bg-gray-600"
                    )} />
                    <div>
                      <p className="text-xs text-white font-medium">{assignment.punishmentAction}</p>
                      <p className="text-[10px] text-gray-600">
                        {assignment.status === 'COMPLETED' ? 'Completed' : 'Skipped'} on {new Date(assignment.completedAt || assignment.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-700 group-hover:text-gray-500 transition-colors">
                    {assignment.sourceType}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <RuleFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={(data) => createMut.mutate(data)}
        isLoading={createMut.isPending}
        mode="create"
      />

      <RuleFormModal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={(data) => updateMut.mutate({ id: editItem?.id, data })}
        isLoading={updateMut.isPending}
        mode="edit"
        initial={editItem ? {
          title: editItem.title,
          description: editItem.description,
          appliesTo: editItem.appliesTo,
          failedCountThreshold: editItem.failedCountThreshold,
          punishmentType: editItem.punishmentType,
          punishmentAction: editItem.punishmentAction,
          active: editItem.active,
        } : undefined}
      />
    </div>
  );
}
