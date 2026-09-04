import type { ReactNode } from 'react'

export interface StatCardProps {
  icon: ReactNode
  label: string
  tone?: 'blue' | 'emerald' | 'rose' | 'slate' | 'violet'
  value: ReactNode
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  emerald:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  violet:
    'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
}

export default function StatCard({
  icon,
  label,
  tone = 'slate',
  value,
}: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {value}
          </div>
        </div>
        <div className={`flex size-11 items-center justify-center rounded-md ${toneClasses[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
