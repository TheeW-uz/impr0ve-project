"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Calendar({ mode, selected, onSelect, className }: any) {
  // Simple placeholder for calendar since full implementation depends on date-fns and react-day-picker
  // For the sake of the MVP, we'll use a simple native date input styled to look premium
  return (
    <div className={cn("p-3", className)}>
      <input 
        type="date"
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
        value={selected ? selected.toISOString().split('T')[0] : ''}
        onChange={(e) => onSelect(new Date(e.target.value))}
      />
    </div>
  )
}
