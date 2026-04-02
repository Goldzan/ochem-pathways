import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: 'default' | 'danger' | 'success'
  children: ReactNode
}

const variantClasses = {
  default: 'text-text-secondary hover:text-text-primary hover:bg-white/8',
  danger: 'text-text-secondary hover:text-red-400 hover:bg-red-500/10',
  success: 'text-text-secondary hover:text-green-400 hover:bg-green-500/10',
}

export function IconButton({ label, variant = 'default', className = '', children, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`p-1.5 rounded-md transition-colors duration-150 disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
