import type { LabelHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface InputLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode
  value?: string
}

export default function InputLabel({
  children,
  className,
  value,
  ...props
}: InputLabelProps) {
  return (
    <label
      className={cn('block text-sm font-medium text-slate-700', className)}
      {...props}
    >
      {value ?? children}
    </label>
  )
}
