import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/utils/cn'
import { getNavigation } from './navigation'

export interface SidebarProps {
  sidebarOpen: boolean
}

export default function Sidebar({ sidebarOpen }: SidebarProps) {
  const user = useAuthStore((state) => state.user)
  const menuNavigation = getNavigation(user)
  const brandInitial =
    user?.name?.charAt(0)?.toUpperCase() ??
    user?.email?.charAt(0)?.toUpperCase() ??
    'S'

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex h-screen w-65 flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 md:sticky md:top-0 md:translate-x-0 md:self-stretch',
        sidebarOpen ? 'translate-x-0 md:w-65' : '-translate-x-full md:w-20',
      )}
    >
      <div className="flex h-16 items-center justify-center border-b border-slate-100 dark:border-slate-800">
        {sidebarOpen ? (
          <div className="flex items-center gap-2 px-4">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary-600">
              <span className="text-sm font-bold text-white">{brandInitial}</span>
            </div>
            <span className="truncate text-xl font-bold text-slate-800 dark:text-white">
              Simple Plan
            </span>
          </div>
        ) : (
          <div className="flex size-9 items-center justify-center rounded-md bg-primary-600">
            <span className="text-sm font-bold text-white">{brandInitial}</span>
          </div>
        )}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto py-3">
        {menuNavigation.map((section) => (
          <div className="mb-2" key={section.title}>
            {sidebarOpen ? (
              <div className="px-4 py-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-600">
                  {section.title}
                </span>
              </div>
            ) : null}

            <div className={sidebarOpen ? undefined : 'flex flex-col items-center'}>
              {section.details.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'my-1 flex items-center gap-3 rounded-md transition-colors duration-200',
                      sidebarOpen
                        ? 'mx-3 px-3 py-2 text-sm'
                        : 'mx-2 justify-center px-3 py-2.5',
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-medium dark:bg-primary-500/10 dark:text-primary-400'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200',
                    )
                  }
                  key={item.href}
                  title={sidebarOpen ? undefined : item.title}
                  to={item.href}
                >
                  {item.icon}
                  {sidebarOpen ? <span className="truncate">{item.title}</span> : null}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        <div
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 dark:text-slate-300',
            sidebarOpen ? undefined : 'justify-center',
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-700">
            {user?.avatar ? (
              <img alt={user.name} className="size-full object-cover" src={user.avatar} />
            ) : (
              <span className="text-xs font-bold">{brandInitial}</span>
            )}
          </div>
          {sidebarOpen ? (
            <span className="truncate">{user?.name ?? 'Profil Saya'}</span>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
