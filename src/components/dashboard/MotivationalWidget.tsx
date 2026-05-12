'use client';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
];

export function MotivationalWidget() {
  const [quote, setQuote] = useState<{ text: string, author: string } | null>(null);

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  if (!quote) return <div className="p-6 rounded-3xl bg-white/5 border border-white/10 h-full animate-pulse" />;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 backdrop-blur-sm flex flex-col justify-between h-full group"
    >
      <div className="mb-4">
        <Quote className="w-8 h-8 text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
      <div>
        <p className="text-lg font-medium text-white mb-2 leading-tight">
          "{quote.text}"
        </p>
        <p className="text-sm text-gray-400">— {quote.author}</p>
      </div>
    </motion.div>
  );
}
