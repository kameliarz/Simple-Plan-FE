import type { Permission, Role, Unit, AuthUser } from './auth'

export type ApiLinks = {
  first?: string | null
  last?: string | null
  next?: string | null
  prev?: string | null
}

export type ApiMeta = {
  current_page: number
  from: number | null
  last_page: number
  path: string
  per_page: number
  to: number | null
  total: number
}

export type PaginatedResponse<TData> = {
  data: TData[]
  links: ApiLinks
  meta: ApiMeta
}

export type ResourceListQuery = {
  page?: number
  perPage?: number | 'all'
  search?: string
  sort?: string
}

export type ResourceResponse<TData> = {
  data: TData
  message?: string
}

export type DashboardVariant =
  | 'default'
  | 'kepala-ruangan'
  | 'perawat'
  | 'super-admin'

export type DashboardSummary = {
  total_permissions: number
  total_roles: number
  total_units: number
  total_users: number
}

export type DashboardRoleDistribution = {
  name: string
  users_count: number
}

export type DashboardOwnedUnit = {
  id: number
  unit_name: string
  users_count: number
}

export type DashboardData = {
  current_user: {
    permissions_count: number
    roles: string[]
    units: string[]
  }
  owned_units: {
    active_shifts: number
    present_today: number
    total_members: number
    total_units: number
    unit_names: string[]
    units: DashboardOwnedUnit[]
  }
  recent_users: AuthUser[]
  role_distribution: DashboardRoleDistribution[]
  summary: DashboardSummary
  today: {
    date: string
    timezone: string
  }
  variant: DashboardVariant
}

export type DashboardLiveStats = {
  logins_today: number
  logouts_today: number
  online_users: number
}

export type ExampleLiveRange = {
  id: ExampleMarketRange
  label: string
}

export type ExampleLiveMetadata = {
  job: {
    default_steps: number
    max_steps: number
    min_steps: number
  }
  ranges: ExampleLiveRange[]
}

export type ExampleMarketRange = 'live' | '1d' | '7d' | '30d'

export type ExampleMarketData = {
  current_ihsg?: number | null
  current_usd?: number | null
  ihsg?: number | null
  ihsg_data?: Array<number | null>
  labels?: string[]
  mode: 'live' | 'history'
  source?: 'yahoo' | 'fallback'
  status: 'success' | 'error'
  usd_data?: Array<number | null>
  usd_idr?: number | null
}

export type ExampleTaskStatus = {
  message: string
  progress: number
  status: 'pending' | 'processing' | 'completed' | 'error'
}

export type ExampleTaskStartResponse = {
  message: string
  taskId: string
}

export type AppNotification = {
  color: 'slate' | 'emerald' | 'rose' | 'blue' | 'amber' | 'violet' | string
  created_at?: string | null
  icon: string
  id: string
  read_at?: string | null
  subtitle: string
  time?: string | null
  title: string
}

export type NotificationIndexResponse = {
  activity: AppNotification[]
  data: AppNotification[]
  unread_count: number
}

export type NotificationMutationResponse = {
  data: AppNotification[]
  message: string
  unread_count: number
}

export type BackupFile = {
  created_at: string
  date: string
  name: string
  path: string
  size: string
  size_bytes: number
}

export type BackupScheduleFrequency = 'none' | 'daily' | 'weekly' | 'monthly'

export type BackupScheduleConfig = {
  frequency: BackupScheduleFrequency
  time: string
}

export type BackupIndexData = {
  backups: BackupFile[]
  schedule_config: BackupScheduleConfig
}

export type BackupIndexResponse = {
  data: BackupIndexData
}

export type BackupMutationResponse<TData = BackupIndexData> = {
  data: TData
  message: string
  output?: string
}

export type LoginResponse = {
  message: string
  token: string
  token_type: 'Bearer'
  user: AuthUser
}

export type ImpersonationMeta = {
  active: boolean
  impersonated_id?: number
  impersonator_id?: number
  started_at?: string | null
}

export type ImpersonationStartResponse = {
  impersonation: ImpersonationMeta
  impersonator: AuthUser
  message: string
  token: string
  token_type: 'Bearer'
  user: AuthUser
}

export type ImpersonationStopResponse = {
  impersonation: Pick<ImpersonationMeta, 'active'>
  message: string
  user: AuthUser
}

export type ImpersonationStatusResponse = {
  data: {
    active: boolean
    impersonated: AuthUser | null
    impersonator: AuthUser | null
    started_at: string | null
  }
}

export type RegisterPayload = {
  device_name?: string
  email: string
  name: string
  nip?: string
  password: string
  password_confirmation: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type ResetPasswordPayload = {
  email: string
  password: string
  password_confirmation: string
  token: string
}

export type AuthMessageResponse = {
  confirmed_at?: number
  message: string
  status?: string
}

export type SsoConfig = {
  enabled: boolean
  local_login_allowed: boolean
  login_url: string | null
  logout_url: string | null
}

export type SsoConfigResponse = {
  data: SsoConfig
}

export type SsoExchangePayload = {
  code: string
  device_name?: string
}

export type UserPayload = {
  email: string
  name: string
  nip?: string
  password?: string
  password_confirmation?: string
  selectedRoles: string[]
  selectedUnits: number[]
  status: 'active' | 'inactive' | 'suspended'
}

export type UnitPayload = {
  description?: string | null
  unit_name: string
}

export type RolePayload = {
  name: string
  permissions: number[]
}

export type ProfilePayload = {
  avatar?: File | null
  email: string
  name: string
  nip?: string | null
}

export type ProfilePasswordPayload = {
  current_password: string
  password: string
  password_confirmation: string
}

export type ProfileDestroyPayload = {
  password: string
}

export type PermissionsResponse = {
  data: Permission[]
}

export type UserOptionsResponse = {
  roles: Pick<Role, 'id' | 'name'>[]
  units: Unit[] | { data: Unit[] }
}
