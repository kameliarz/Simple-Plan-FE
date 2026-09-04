import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
}

export default function TextArea({
  className,
  error,
  id,
  label,
  rows = 4,
  ...props
}: TextAreaProps) {
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
      <textarea
        className={cn(
          'w-full resize-none rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
          error && 'border-danger-500 focus:border-danger-500',
          className,
        )}
        id={inputId}
        rows={rows}
        {...props}
      />
      {error ? <small className="text-xs text-danger-500">{error}</small> : null}
    </div>
  )
}
