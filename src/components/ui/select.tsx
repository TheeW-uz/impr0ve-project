import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = ({ children, value, onValueChange }: any) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <div className="relative">
      {React.Children.map(children, child => 
        React.cloneElement(child, { value, onValueChange, isOpen, setIsOpen })
      )}
    </div>
  )
}

const SelectTrigger = ({ children, className, isOpen, setIsOpen, value }: any) => (
  <button
    type="button"
    onClick={() => setIsOpen(!isOpen)}
    className={cn(
      "flex h-11 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all",
      className
    )}
  >
    {value || children}
    <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
  </button>
)

const SelectValue = ({ placeholder, value }: any) => <span>{value || placeholder}</span>

const SelectContent = ({ children, isOpen, setIsOpen, onValueChange, value: currentValue }: any) => {
  if (!isOpen) return null
  
  return (
    <>
      <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)} />
      <div className="absolute top-full left-0 z-50 mt-2 w-full min-w-[8rem] overflow-hidden rounded-2xl border border-white/10 bg-gray-900 p-1 text-white shadow-2xl animate-in fade-in zoom-in-95">
        {React.Children.map(children, child => 
          React.cloneElement(child, { 
            onClick: () => {
              onValueChange(child.props.value)
              setIsOpen(false)
            },
            isSelected: child.props.value === currentValue
          })
        )}
      </div>
    </>
  )
}

const SelectItem = ({ children, value, onClick, isSelected }: any) => (
  <div
    onClick={onClick}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-xl py-2 pl-8 pr-2 text-sm outline-none hover:bg-white/5 transition-colors",
      isSelected && "text-primary-400"
    )}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {isSelected && <Check className="h-4 w-4" />}
    </span>
    {children}
  </div>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
