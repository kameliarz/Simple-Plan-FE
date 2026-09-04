import { useEffect } from 'react'
import {
  IconActivity,
  IconBuilding,
  IconLogin,
  IconLogout,
  IconShieldCheck,
  IconUserShield,
  IconUsers,
  IconWifi,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import StatCard from '@/components/ui/StatCard'
import { useAuthStore } from '@/stores/authStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import type { DashboardRoleDistribution } from '@/types/api'
import { canAny } from '@/utils/authorization'
import { getApiErrorMessage } from '@/utils/apiErrors'

const shortcutCards = [
  {
    description: 'Kelola akun, peran, dan unit pengguna.',
    href: '/users',
    icon: <IconUsers size={24} strokeWidth={1.5} />,
    permissions: ['users-access'],
    title: 'Manajemen User',
  },
  {
    description: 'Kelola role dan permission aplikasi.',
    href: '/roles',
    icon: <IconUserShield size={24} strokeWidth={1.5} />,
    permissions: ['roles-access'],
    title: 'Akses Group',
  },
  {
    description: 'Kelola departemen dan relasi pengguna.',
    href: '/units',
    icon: <IconBuilding size={24} strokeWidth={1.5} />,
    permissions: ['units-access-all', 'units-access-owned'],
    title: 'Manajemen Unit',
  },
  {
    description: 'Pantau market proxy dan background task demo.',
    href: '/example-live',
    icon: <IconActivity size={24} strokeWidth={1.5} />,
    permissions: ['dashboard-access'],
    title: 'Example Live',
  },
]

function roleLabel(variant?: string) {
  if (variant === 'super-admin') {
    return 'Super Admin'
  }

  if (variant === 'kepala-ruangan') {
    return 'Kepala Ruangan'
  }

  if (variant === 'perawat') {
    return 'Perawat'
  }

  return 'Default'
}

function RoleDistributionBar({
  distribution,
}: {
  distribution: DashboardRoleDistribution[]
}) {
  const maxValue = Math.max(
    1,
    ...distribution.map((item) => item.users_count),
  )

  return (
    <div className="space-y-3">
      {distribution.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada data role.</p>
      ) : (
        distribution.map((item) => (
          <div key={item.name}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.name}
              </span>
              <span className="text-slate-500">{item.users_count} user</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-2 rounded-full bg-primary-600"
                style={{
                  width: `${Math.max(8, (item.users_count / maxValue) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const data = useDashboardStore((state) => state.data)
  const liveStats = useDashboardStore((state) => state.liveStats)
  const loadDashboard = useDashboardStore((state) => state.loadDashboard)
  const loadLiveStats = useDashboardStore((state) => state.loadLiveStats)
  const loading = useDashboardStore((state) => state.loading)
  const visibleCards = shortcutCards.filter((card) =>
    canAny(card.permissions, user),
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadDashboard().catch((error: unknown) => {
        toast.error(getApiErrorMessage(error))
      })
      loadLiveStats().catch(() => undefined)
    }, 0)

    const intervalId = window.setInterval(() => {
      loadLiveStats().catch(() => undefined)
    }, 15000)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [loadDashboard, loadLiveStats])

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md bg-primary-50 text-primary-600">
              <IconShieldCheck size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
                Dashboard {data ? roleLabel(data.variant) : ''}
              </h1>
              <p className="text-sm text-slate-500">
                Selamat datang, {user?.name ?? 'User'}.
              </p>
            </div>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-400">
            {data?.today.date ?? '-'} · {data?.today.timezone ?? 'Asia/Jakarta'}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          Memuat data dashboard...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={<IconWifi size={22} strokeWidth={1.5} />}
              label="Online"
              tone="emerald"
              value={liveStats?.online_users ?? 0}
            />
            <StatCard
              icon={<IconLogin size={22} strokeWidth={1.5} />}
              label="Login Hari Ini"
              tone="blue"
              value={liveStats?.logins_today ?? 0}
            />
            <StatCard
              icon={<IconLogout size={22} strokeWidth={1.5} />}
              label="Logout Hari Ini"
              tone="rose"
              value={liveStats?.logouts_today ?? 0}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<IconUsers size={22} strokeWidth={1.5} />}
              label="Total User"
              tone="violet"
              value={data?.summary.total_users ?? 0}
            />
            <StatCard
              icon={<IconUserShield size={22} strokeWidth={1.5} />}
              label="Total Role"
              value={data?.summary.total_roles ?? 0}
            />
            <StatCard
              icon={<IconBuilding size={22} strokeWidth={1.5} />}
              label="Total Unit"
              tone="blue"
              value={data?.summary.total_units ?? 0}
            />
            <StatCard
              icon={<IconShieldCheck size={22} strokeWidth={1.5} />}
              label="Permission Anda"
              tone="emerald"
              value={data?.current_user.permissions_count ?? 0}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <IconActivity size={20} strokeWidth={1.5} />
                <h2 className="font-semibold text-slate-950 dark:text-white">
                  Distribusi Role
                </h2>
              </div>
              <RoleDistributionBar distribution={data?.role_distribution ?? []} />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <IconUsers size={20} strokeWidth={1.5} />
                <h2 className="font-semibold text-slate-950 dark:text-white">
                  User Terbaru
                </h2>
              </div>
              <div className="space-y-3">
                {data?.recent_users.length ? (
                  data.recent_users.map((recentUser) => (
                    <div
                      className="flex items-center gap-3 rounded-md bg-slate-50 p-3 dark:bg-slate-950"
                      key={recentUser.id}
                    >
                      <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                        {recentUser.avatar ? (
                          <img
                            alt={recentUser.name}
                            className="size-full object-cover"
                            src={recentUser.avatar}
                          />
                        ) : (
                          recentUser.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                          {recentUser.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {recentUser.email}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Belum ada user.</p>
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <IconBuilding size={20} strokeWidth={1.5} />
                <h2 className="font-semibold text-slate-950 dark:text-white">
                  Unit Anda
                </h2>
              </div>
              <div className="space-y-2">
                {data?.owned_units.units.length ? (
                  data.owned_units.units.map((unit) => (
                    <div
                      className="flex justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950"
                      key={unit.id}
                    >
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {unit.unit_name}
                      </span>
                      <span className="text-slate-500">
                        {unit.users_count} anggota
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Anda belum ditugaskan ke unit mana pun.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <IconShieldCheck size={20} strokeWidth={1.5} />
                <h2 className="font-semibold text-slate-950 dark:text-white">
                  Akses Cepat
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleCards.map((card) => (
                  <Link
                    className="rounded-md border border-slate-200 p-4 transition hover:border-primary-200 hover:bg-primary-50/50 dark:border-slate-800 dark:hover:bg-slate-950"
                    key={card.href}
                    to={card.href}
                  >
                    <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-primary-50 text-primary-600">
                      {card.icon}
                    </div>
                    <h3 className="font-semibold text-slate-950 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {card.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  )
}
