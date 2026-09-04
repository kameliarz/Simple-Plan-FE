import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  IconAlertTriangle,
  IconBell,
  IconCircle,
  IconCircleCheck,
  IconInfoCircle,
  IconLogin,
  IconLogout,
} from '@tabler/icons-react'
import type { ComponentType } from 'react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNotificationStore } from '@/stores/notificationStore'
import type { AppNotification } from '@/types/api'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { cn } from '@/utils/cn'

const iconRegistry: Record<string, ComponentType<{ size?: number }>> = {
  IconAlertTriangle,
  IconCircle,
  IconInfoCircle,
  IconLogin,
  IconLogout,
}

const toneClasses: Record<string, string> = {
  amber: 'bg-warning-50 text-warning-700 dark:bg-warning-950/40 dark:text-warning-300',
  blue: 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300',
  emerald:
    'bg-success-50 text-success-700 dark:bg-success-950/40 dark:text-success-300',
  rose: 'bg-danger-50 text-danger-700 dark:bg-danger-950/40 dark:text-danger-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  violet:
    'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
}

function NotificationIcon({ item }: { item: AppNotification }) {
  const Icon = iconRegistry[item.icon] ?? IconCircle

  return (
    <span
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full',
        toneClasses[item.color] ?? toneClasses.slate,
      )}
    >
      <Icon size={18} />
    </span>
  )
}

function NotificationItem({
  item,
  onRead,
}: {
  item: AppNotification
  onRead?: (id: string) => void
}) {
  return (
    <div className="flex gap-3 rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      <NotificationIcon item={item} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
          {item.title}
        </p>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          {item.subtitle}
          {item.time ? <span> · {item.time}</span> : null}
        </p>
      </div>
      {onRead ? (
        <button
          className="self-start rounded-md p-1 text-primary-600 transition hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-950/40"
          onClick={() => onRead(item.id)}
          title="Tandai dibaca"
          type="button"
        >
          <IconCircleCheck size={18} />
        </button>
      ) : null}
    </div>
  )
}

export default function NotificationDropdown() {
  const activity = useNotificationStore((state) => state.activity)
  const loadNotifications = useNotificationStore(
    (state) => state.loadNotifications,
  )
  const loading = useNotificationStore((state) => state.loading)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const notifications = useNotificationStore((state) => state.notifications)
  const unreadCount = useNotificationStore((state) => state.unreadCount)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadNotifications().catch(() => undefined)
    }, 0)

    const intervalId = window.setInterval(() => {
      loadNotifications().catch(() => undefined)
    }, 30000)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [loadNotifications])

  const handleMarkRead = (notificationId: string) => {
    markAsRead(notificationId)
      .then((message) => toast.success(message))
      .catch((error: unknown) => toast.error(getApiErrorMessage(error)))
  }

  const handleMarkAllRead = () => {
    markAllAsRead()
      .then((message) => toast.success(message))
      .catch((error: unknown) => toast.error(getApiErrorMessage(error)))
  }

  return (
    <Menu as="div" className="relative z-20">
      <MenuButton className="relative rounded-md p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
        <IconBell size={20} strokeWidth={1.5} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-danger-500 px-1.5 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </MenuButton>
      <MenuItems className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Notifikasi
            </p>
            <p className="text-xs text-slate-500">
              {unreadCount} belum dibaca
            </p>
          </div>
          {unreadCount > 0 ? (
            <MenuItem>
              {({ focus }) => (
                <button
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-semibold text-primary-600 transition dark:text-primary-300',
                    focus && 'bg-primary-50 dark:bg-primary-950/40',
                  )}
                  onClick={handleMarkAllRead}
                  type="button"
                >
                  Tandai semua
                </button>
              )}
            </MenuItem>
          ) : null}
        </div>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
          {loading && notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Memuat notifikasi...
            </p>
          ) : notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Tidak ada notifikasi.
            </p>
          ) : (
            notifications.map((item) => (
              <NotificationItem
                item={item}
                key={item.id}
                onRead={handleMarkRead}
              />
            ))
          )}

          {activity.length > 0 ? (
            <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-400">
                Aktivitas
              </p>
              <div className="space-y-2">
                {activity.map((item) => (
                  <NotificationItem item={item} key={item.id} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </MenuItems>
    </Menu>
  )
}
