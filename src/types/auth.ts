export type PermissionMap = Record<string, boolean>

export type Permission = {
  id: number
  name: string
}

export type Role = {
  id: number
  name: string
  permissions?: Permission[]
}

export type Unit = {
  id: number
  unit_name: string
  slug?: string | null
  description?: string | null
  users?: AuthUser[]
  users_count?: number
}

export type AuthUser = {
  id: number
  name: string
  email: string | null
  nip?: string | null
  avatar?: string | null
  email_verified_at?: string | null
  status?: string | null
  roles?: Role[]
  units?: Unit[]
  permissions?: PermissionMap
}

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
