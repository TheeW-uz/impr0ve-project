"use client"

import { useStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { create } from "zustand"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'info'
}

interface ToastStore {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  toast: (t) => {
    const id = Math.random().toString(36).substr(2, 9)
    set((state) => ({ toasts: [...state.toasts, { ...t, id }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
    }, 5000)
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export function Toaster() {
  const { toasts, remove } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="group relative flex w-80 flex-col gap-1 rounded-2xl border border-white/10 bg-gray-900/90 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              {toast.variant === 'success' && <CheckCircle className="h-5 w-5 text-green-400" />}
              {toast.variant === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
              {toast.variant === 'info' && <Info className="h-5 w-5 text-blue-400" />}
              <span className="font-semibold text-white">{toast.title}</span>
              <button 
                onClick={() => remove(toast.id)}
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            {toast.description && (
              <p className="text-sm text-gray-400 pl-8">{toast.description}</p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
