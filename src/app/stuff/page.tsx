'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StuffToDoService } from '@/lib/services';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, MoreHorizontal, Heart,
  Trash2, Edit2, Calendar, Clock, Tag, ChevronRight,
  LayoutGrid, List, BarChart3, Star, CheckCircle2,
  Film, Users, Dumbbell, Zap, BookOpen, Ghost, Plane,
  Settings, ArrowLeft, Image as ImageIcon, MessageSquare,
  AlertCircle, Sparkles, PlusCircle, X, Circle, CheckCircle,
  Clock3, CalendarDays, Hash, PencilLine
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';
import { useLanguage } from '@/lib/language-context';

const CATEGORIES = [
  'All', 'Movies', 'Social', 'Physical', 'Productivity', 'Learning', 'Fun', 'Travel', 'Other'
];

const CATEGORY_ICONS: Record<string, any> = {
  'Movies': Film,
  'Social': Users,
  'Physical': Dumbbell,
  'Productivity': Zap,
  'Learning': BookOpen,
  'Fun': Ghost,
  'Travel': Plane,
  'Other': Hash,
};

export default function StuffToDoPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, done, not-done
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Queries
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['stuff-to-do'],
    queryFn: () => StuffToDoService.getAll().then(res => res.data.data),
  });

  // Filtered & Sorted Data
  const processedItems = useMemo(() => {
    let result = [...items];

    // Search
    if (searchQuery) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.note?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'done') return (a.completed === b.completed) ? 0 : a.completed ? -1 : 1;
      if (sortBy === 'not-done') return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, searchQuery, selectedCategory, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter((i: any) => i.completed).length;
    const notDone = total - done;
    
    // Favorite category (most items)
    const catCounts: any = {};
    items.forEach((i: any) => {
      catCounts[i.category] = (catCounts[i.category] || 0) + 1;
    });
    let favorite = 'None';
    let max = 0;
    Object.entries(catCounts).forEach(([cat, count]: [string, any]) => {
      if (count > max) {
        max = count;
        favorite = cat;
      }
    });

    return { total, done, notDone, favorite };
  }, [items]);

  // Mutations
  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string, completed: boolean }) => 
      StuffToDoService.update(id, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stuff-to-do'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => StuffToDoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stuff-to-do'] });
      toast({ title: 'Deleted', description: 'Item removed from your list' });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="text-gray-500 font-medium animate-pulse">Syncing your lifestyle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 md:px-6">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
            {t('stuffToDo.title')} <Sparkles className="w-8 h-8 text-amber-400" />
          </h1>
          <p className="text-gray-500 font-medium max-w-lg">
            {t('stuffToDo.subtitle')}
          </p>
        </div>

        <Button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="h-14 px-8 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-black shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          {t('stuffToDo.add_new')}
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: t('stuffToDo.total_items'), value: stats.total, icon: List, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: t('stuffToDo.completed'), value: stats.done, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: t('stuffToDo.upcoming'), value: stats.notDone, icon: Clock3, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: t('stuffToDo.top_vibe'), value: stats.favorite, icon: Star, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 flex flex-col items-center text-center">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-2xl font-black text-white leading-none truncate w-full px-2">{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder={t('stuffToDo.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 bg-white/[0.03] border-white/5 rounded-xl text-white font-medium placeholder:text-gray-600 focus:ring-primary-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 bg-white/[0.03] border border-white/5 rounded-xl px-4 text-xs font-bold text-gray-400 outline-none focus:ring-2 focus:ring-primary-500 transition-all min-w-[140px]"
            >
              <option value="newest">{t('stuffToDo.sort_latest')}</option>
              <option value="oldest">{t('stuffToDo.sort_oldest')}</option>
              <option value="done">{t('stuffToDo.sort_done')}</option>
              <option value="not-done">{t('stuffToDo.sort_pending')}</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                selectedCategory === cat
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                  : "bg-white/[0.03] text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] border border-white/5"
              )}
            >
              {cat === 'All' ? t('stuffToDo.all') : cat === 'Movies' ? t('stuffToDo.movies') : cat === 'Social' ? t('stuffToDo.social') : cat === 'Physical' ? t('stuffToDo.physical') : cat === 'Productivity' ? t('stuffToDo.productivity') : cat === 'Learning' ? t('stuffToDo.learning') : cat === 'Fun' ? t('stuffToDo.fun') : cat === 'Travel' ? t('stuffToDo.travel') : t('stuffToDo.other')}
            </button>
          ))}
        </div>
      </section>

      {/* Content Grid */}
      <main>
        <AnimatePresence mode="popLayout">
          {processedItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[3rem]"
            >
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center">
                <LayoutGrid className="w-10 h-10 text-gray-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">{t('stuffToDo.empty_title')}</h3>
                <p className="text-gray-500 max-w-sm mx-auto font-medium">
                  {searchQuery ? t('stuffToDo.empty_search') : t('stuffToDo.empty_start')}
                </p>
              </div>
              {!searchQuery && (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="outline"
                  className="h-12 px-8 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 font-bold text-xs uppercase tracking-widest"
                >
                  {t('stuffToDo.create_first')}
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedItems.map((item: any) => (
                <StuffCard 
                  key={item.id} 
                  item={item} 
                  onToggle={(completed: boolean) => toggleMutation.mutate({ id: item.id, completed })}
                  onEdit={() => { setEditingItem(item); setIsModalOpen(true); }}
                  onDelete={() => deleteMutation.mutate(item.id)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <StuffFormModal 
            item={editingItem} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StuffCard({ item, onToggle, onEdit, onDelete }: any) {
  const Icon = CATEGORY_ICONS[item.category] || Hash;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "group relative bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:border-white/10 hover:bg-white/[0.03]",
        item.completed && "opacity-60"
      )}
    >
      <div className="p-7 space-y-4">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
               <Icon className="w-5 h-5" />
             </div>
             <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-500/80">{item.category}</span>
                <h3 className={cn("text-lg font-black text-white leading-tight mt-0.5", item.completed && "line-through text-gray-500")}>
                  {item.title}
                </h3>
             </div>
          </div>
          <button 
            onClick={() => onToggle(!item.completed)}
            className={cn(
              "w-8 h-8 rounded-full border flex items-center justify-center transition-all",
              item.completed 
                ? "bg-emerald-500 border-emerald-400 text-black" 
                : "bg-white/5 border-white/10 text-gray-700 hover:border-primary-500"
            )}
          >
            {item.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </button>
        </div>

        {/* Note */}
        {item.note && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {item.note}
          </p>
        )}

        {/* Footer Info */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5">
           {item.plannedDate && (
             <div className="flex items-center gap-1.5 text-amber-500/70">
               <CalendarDays className="w-3.5 h-3.5" />
               <span className="text-[10px] font-bold uppercase tracking-wider">
                 {new Date(item.plannedDate).toLocaleDateString()}
               </span>
             </div>
           )}
           <div className="flex items-center gap-1.5 text-gray-600">
             <Clock className="w-3.5 h-3.5" />
             <span className="text-[10px] font-bold uppercase tracking-wider">
               {new Date(item.createdAt).toLocaleDateString()}
             </span>
           </div>
        </div>

        {/* Actions Overlay */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-14">
           <button 
             onClick={onEdit}
             className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
           >
             <Edit2 className="w-4 h-4" />
           </button>
           <button 
             onClick={onDelete}
             className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all"
           >
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </div>
    </motion.div>
  );
}

function StuffFormModal({ item, onClose }: any) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState(item?.title || '');
  const [category, setCategory] = useState(item?.category || 'Movies');
  const [note, setNote] = useState(item?.note || '');
  const [plannedDate, setPlannedDate] = useState(item?.plannedDate ? new Date(item.plannedDate).toISOString().split('T')[0] : '');

  const mutation = useMutation({
    mutationFn: (data: any) =>
      item ? StuffToDoService.update(item.id, data) : StuffToDoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stuff-to-do'] });
      toast({ title: item ? t('stuffToDo.updated') : t('stuffToDo.created'), description: t('stuffToDo.item_synced') });
      onClose();
    }
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutation.mutate({ title, category, note, plannedDate: plannedDate || null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-gray-950 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary-500" />
          
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {item ? t('stuffToDo.edit_title') : t('stuffToDo.add_title')}
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('stuffToDo.capture_vibe')}</p>
              </div>
              <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-colors">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">{t('stuffToDo.what_to_do')}</label>
                <div className="relative">
                  <PencilLine className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('stuffToDo.example_todo')}
                    className="h-14 pl-12 bg-white/5 border-white/5 rounded-2xl text-lg font-bold text-white focus:ring-primary-500 outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Category & Date Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">{t('stuffToDo.vibe_type')}</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c} className="bg-gray-950">
                          {c === 'Movies' ? t('stuffToDo.movies') : c === 'Social' ? t('stuffToDo.social') : c === 'Physical' ? t('stuffToDo.physical') : c === 'Productivity' ? t('stuffToDo.productivity') : c === 'Learning' ? t('stuffToDo.learning') : c === 'Fun' ? t('stuffToDo.fun') : c === 'Travel' ? t('stuffToDo.travel') : t('stuffToDo.other')}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rotate-90" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">{t('stuffToDo.when')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="date"
                      value={plannedDate}
                      onChange={(e) => setPlannedDate(e.target.value)}
                      className="h-14 pl-12 bg-white/5 border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-primary-500 outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">{t('stuffToDo.deep_thoughts')}</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('stuffToDo.notes_placeholder')}
                  className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-14 rounded-2xl font-black text-gray-500 hover:text-white">{t('stuffToDo.cancel')}</Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="flex-[2] h-14 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-black shadow-xl shadow-primary-500/20"
              >
                {mutation.isPending ? t('stuffToDo.syncing') : item ? t('stuffToDo.update_entry') : t('stuffToDo.save_entry')}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
