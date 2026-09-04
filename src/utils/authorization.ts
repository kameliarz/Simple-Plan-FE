import type { AuthUser } from '@/types/auth'

export function can(permission: string, user?: AuthUser | null) {
  return user?.permissions?.[permission] === true
}

export function canAny(permissions: string[], user?: AuthUser | null) {
  return permissions.some((permission) => can(permission, user))
}

export function canAll(permissions: string[], user?: AuthUser | null) {
  return permissions.every((permission) => can(permission, user))
}
