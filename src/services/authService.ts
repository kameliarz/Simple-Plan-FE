import api from '@/lib/axios'
import type {
  AuthMessageResponse,
  ForgotPasswordPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
  SsoConfigResponse,
  SsoExchangePayload,
} from '@/types/api'
import type { AuthUser } from '@/types/auth'

export type LoginPayload = {
  device_name?: string
  email: string
  password: string
}

export async function login(payload: LoginPayload) {
  const response = await api.post<LoginResponse>('/auth/login', {
    device_name: 'simple-plan-fe',
    ...payload,
  })

  return response.data
}

export async function register(payload: RegisterPayload) {
  const response = await api.post<LoginResponse>('/auth/register', {
    device_name: 'simple-plan-fe',
    ...payload,
  })

  return response.data
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const response = await api.post<AuthMessageResponse>(
    '/auth/forgot-password',
    payload,
  )

  return response.data
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const response = await api.post<AuthMessageResponse>(
    '/auth/reset-password',
    payload,
  )

  return response.data
}

export async function resendVerificationEmail() {
  const response = await api.post<AuthMessageResponse>(
    '/auth/email/verification-notification',
  )

  return response.data
}

export async function confirmPassword(password: string) {
  const response = await api.post<AuthMessageResponse>(
    '/auth/confirm-password',
    { password },
  )

  return response.data
}

export async function fetchSsoConfig() {
  const response = await api.get<SsoConfigResponse>('/auth/sso/config')

  return response.data.data
}

export async function exchangeSsoCode(payload: SsoExchangePayload) {
  const response = await api.post<LoginResponse>('/auth/sso/exchange', {
    device_name: 'simple-plan-fe',
    ...payload,
  })

  return response.data
}

export async function logout() {
  await api.post('/auth/logout')
}

export async function fetchMe() {
  const response = await api.get<{ data: AuthUser }>('/auth/me')

  return response.data.data
}
