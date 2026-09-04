import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  icon?: ReactNode
  label?: string
}

export default function Input({
  className,
  error,
  icon,
  id,
  label,
  type = 'text',
  ...props
}: InputProps) {
  const inputId = id ?? props.name

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
          htmlFor={inputId}
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        ) : null}
        <input
          className={cn(
            'h-11 w-full rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
            icon ? 'pl-10 pr-4' : 'px-4',
            error && 'border-danger-500 focus:border-danger-500',
            className,
          )}
          id={inputId}
          type={type}
          {...props}
        />
      </div>
      {error ? (
        <small className="text-xs text-danger-500 dark:text-danger-500">
          {error}
        </small>
      ) : null}
    </div>
  )
}
