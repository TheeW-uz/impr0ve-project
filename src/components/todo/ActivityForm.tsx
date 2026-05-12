'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ListChecks } from 'lucide-react';

const categories = [
  'Movies', 'Social Activities', 'Physical Activities', 'Productivity', 'Learning', 'Fun', 'Travel'
];

export function ActivityForm() {
  const { addTodo } = useStore();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Productivity');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addTodo({
      id: uuidv4(),
      title,
      category,
      completed: false,
      favorite: false
    });

    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 shadow-xl">
      <div className="flex-1">
        <Input
          placeholder="What's on your mind?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-gray-900/50 border-none h-12"
        />
      </div>
      <div className="w-full md:w-48">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-gray-900/50 border-none h-12">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="h-12 px-8 rounded-2xl">
        <Plus className="w-5 h-5 mr-2" />
        Add Task
      </Button>
    </form>
  );
}
