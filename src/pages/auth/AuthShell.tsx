import type { ReactNode } from 'react'
import { IconShieldCheck } from '@tabler/icons-react'
import { Link } from 'react-router-dom'

export interface AuthShellProps {
  children: ReactNode
  description?: ReactNode
  title: ReactNode
}

export default function AuthShell({
  children,
  description,
  title,
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <Link className="mb-8 flex items-center gap-3" to="/">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary-600 text-white">
            <IconShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
            {description ? (
              <p className="text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
        </Link>

        {children}
      </section>
    </main>
  )
}
