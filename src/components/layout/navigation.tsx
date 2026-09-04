import type { ReactNode } from 'react'
import {
  IconActivity,
  IconBuilding,
  IconDatabase,
  IconLayout2,
  IconUserShield,
  IconUsers,
} from '@tabler/icons-react'
import type { AuthUser } from '@/types/auth'
import { canAny } from '@/utils/authorization'

export type NavigationItem = {
  activeMatch: string
  href: string
  icon: ReactNode
  permissions?: string[]
  title: string
}

export type NavigationGroup = {
  details: NavigationItem[]
  title: string
}

const navigation: NavigationGroup[] = [
  {
    title: 'Utama',
    details: [
      {
        activeMatch: '/dashboard',
        href: '/dashboard',
        icon: <IconLayout2 size={20} strokeWidth={1.5} />,
        title: 'Dashboard',
      },
      {
        activeMatch: '/example-live',
        href: '/example-live',
        icon: <IconActivity size={20} strokeWidth={1.5} />,
        permissions: ['dashboard-access'],
        title: 'Example Live',
      },
    ],
  },
  {
    title: 'Manajemen',
    details: [
      {
        activeMatch: '/users',
        href: '/users',
        icon: <IconUsers size={20} strokeWidth={1.5} />,
        permissions: ['users-access'],
        title: 'Pengguna',
      },
      {
        activeMatch: '/roles',
        href: '/roles',
        icon: <IconUserShield size={20} strokeWidth={1.5} />,
        permissions: ['roles-access'],
        title: 'Akses Group',
      },
      {
        activeMatch: '/units',
        href: '/units',
        icon: <IconBuilding size={20} strokeWidth={1.5} />,
        permissions: ['units-access-all', 'units-access-owned'],
        title: 'Departemen',
      },
      {
        activeMatch: '/backups',
        href: '/backups',
        icon: <IconDatabase size={20} strokeWidth={1.5} />,
        permissions: ['backups-access'],
        title: 'Backup Database',
      },
    ],
  },
]

export function getNavigation(user?: AuthUser | null) {
  return navigation
    .map((group) => ({
      ...group,
      details: group.details.filter(
        (item) => !item.permissions || canAny(item.permissions, user),
      ),
    }))
    .filter((group) => group.details.length > 0)
}
