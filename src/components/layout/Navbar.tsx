import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  IconLogout,
  IconMenu2,
  IconMoon,
  IconSun,
  IconUserCheck,
  IconUserCircle,
} from '@tabler/icons-react'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logout as logoutRequest } from '@/services/authService'
import { stopImpersonation as stopImpersonationRequest } from '@/services/impersonationService'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { cn } from '@/utils/cn'
import NotificationDropdown from './NotificationDropdown'
import { getNavigation } from './navigation'

export interface NavbarProps {
  darkMode: boolean
  themeSwitcher: () => void
  toggleSidebar: () => void
}

export default function Navbar({
  darkMode,
  themeSwitcher,
  toggleSidebar,
}: NavbarProps) {
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const impersonatorUser = useAuthStore((state) => state.impersonatorUser)
  const isImpersonating = useAuthStore((state) => state.isImpersonating)
  const stopAuthImpersonation = useAuthStore(
    (state) => state.stopImpersonation,
  )
  const user = useAuthStore((state) => state.user)
  const resetNotifications = useNotificationStore((state) => state.reset)
  const location = useLocation()
  const navigate = useNavigate()

  const title = useMemo(() => {
    const links = getNavigation(user).flatMap((group) => group.details)
    const current = links.find(
      (item) =>
        location.pathname === item.activeMatch ||
        location.pathname.startsWith(`${item.activeMatch}/`),
    )

    return current?.title ?? 'Dashboard'
  }, [location.pathname, user])

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() ??
    user?.email?.charAt(0)?.toUpperCase() ??
    '?'

  const handleLogout = async () => {
    try {
      if (isImpersonating) {
        const response = await stopImpersonationRequest()
        stopAuthImpersonation(response.user)
      }

      await logoutRequest()
    } finally {
      clearAuth()
      resetNotifications()
      navigate('/login', { replace: true })
    }
  }

  const handleStopImpersonation = async () => {
    try {
      const response = await stopImpersonationRequest()
      stopAuthImpersonation(response.user)
      toast.success(response.message)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 md:px-6">
      <div className="flex items-center gap-4">
        <button
          className="flex rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          onClick={toggleSidebar}
          title="Toggle sidebar"
          type="button"
        >
          <IconMenu2 size={20} strokeWidth={1.5} />
        </button>

        <div className="flex items-center md:hidden">
          <span className="text-lg font-bold text-slate-800 dark:text-white">
            Simple Plan
          </span>
        </div>

        <div className="hidden items-center md:flex">
          <div className="mr-4 h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <h1 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isImpersonating ? (
          <div className="hidden items-center gap-2 rounded-md border border-warning-200 bg-warning-50 px-3 py-1.5 text-warning-800 dark:border-warning-900/60 dark:bg-warning-950/40 dark:text-warning-200 sm:flex">
            <IconUserCheck size={18} strokeWidth={1.5} />
            <span className="max-w-52 truncate text-xs font-medium">
              {impersonatorUser?.name ?? 'Admin'} sebagai {user?.name}
            </span>
            <button
              className="rounded px-2 py-1 text-xs font-semibold transition hover:bg-warning-100 dark:hover:bg-warning-900/50"
              onClick={() => void handleStopImpersonation()}
              type="button"
            >
              Stop
            </button>
          </div>
        ) : null}

        <button
          className="rounded-md p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          onClick={themeSwitcher}
          title={darkMode ? 'Light mode' : 'Dark mode'}
          type="button"
        >
          {darkMode ? (
            <IconSun className="text-warning-500" size={20} strokeWidth={1.5} />
          ) : (
            <IconMoon size={20} strokeWidth={1.5} />
          )}
        </button>

        <NotificationDropdown />

        <Menu as="div" className="relative z-10">
          <MenuButton className="flex items-center rounded-full">
            {user?.avatar ? (
              <img
                alt={user.name}
                className="size-10 rounded-full object-cover"
                src={user.avatar}
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                {userInitial}
              </div>
            )}
          </MenuButton>
          <MenuItems className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-100 px-3 pb-2 dark:border-slate-800">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                {user?.name ?? 'User'}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            {isImpersonating ? (
              <MenuItem>
                {({ focus }) => (
                  <button
                    className={cn(
                      'mt-2 flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-warning-700 transition dark:text-warning-300',
                      focus &&
                        'bg-warning-50 text-warning-900 dark:bg-warning-950/40 dark:text-warning-100',
                    )}
                    onClick={() => void handleStopImpersonation()}
                    type="button"
                  >
                    <IconUserCheck size={20} strokeWidth={1.5} />
                    Stop Impersonate
                  </button>
                )}
              </MenuItem>
            ) : null}
            <MenuItem>
              {({ focus }) => (
                <Link
                  className={cn(
                    'mt-2 flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-500 transition dark:text-slate-400',
                    focus &&
                      'bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-slate-200',
                  )}
                  to="/profile"
                >
                  <IconUserCircle size={20} strokeWidth={1.5} />
                  Profil
                </Link>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-500 transition dark:text-slate-400',
                    focus && 'bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-slate-200',
                  )}
                  onClick={handleLogout}
                  type="button"
                >
                  <IconLogout size={20} strokeWidth={1.5} />
                  Logout
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </header>
  )
}
