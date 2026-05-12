import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20',
      outline: 'border border-white/10 bg-transparent hover:bg-white/5 text-white',
      ghost: 'hover:bg-white/5 text-gray-400 hover:text-white',
      secondary: 'bg-white/5 text-white hover:bg-white/10',
    }

    const sizes = {
      default: 'h-11 px-6 py-2',
      sm: 'h-9 px-3 text-xs',
      lg: 'h-12 px-8 text-lg',
      icon: 'h-10 w-10',
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
