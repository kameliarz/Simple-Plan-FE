import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'icon'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  label?: string
  to?: string
  variant?: ButtonVariant
  size?: ButtonSize
  hideLabelOnMobile?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-primary-600 text-white hover:bg-primary-700',
  secondary:
    'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  danger: 'border-transparent bg-danger-500 text-white hover:bg-danger-600',
  ghost:
    'border-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 py-2 text-xs',
  md: 'min-h-11 px-4 py-2 text-sm',
  icon: 'size-10 p-0',
}

export default function Button({
  className,
  disabled,
  hideLabelOnMobile = false,
  icon,
  label,
  size = 'md',
  to,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )

  const content = (
    <>
      {icon}
      {label ? (
        <span className={hideLabelOnMobile ? 'hidden md:inline' : undefined}>
          {label}
        </span>
      ) : null}
    </>
  )

  if (to) {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault()
        return
      }

      props.onClick?.(event as unknown as MouseEvent<HTMLButtonElement>)
    }

    return (
      <Link
        aria-disabled={disabled}
        className={classes}
        onClick={handleClick}
        to={to}
      >
        {content}
      </Link>
    )
  }

  return (
    <button className={classes} disabled={disabled} type="button" {...props}>
      {content}
    </button>
  )
}
