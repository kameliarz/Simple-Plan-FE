import api from '@/lib/axios'
import type {
  ProfileDestroyPayload,
  ProfilePasswordPayload,
  ProfilePayload,
  ResourceResponse,
} from '@/types/api'
import type { AuthUser } from '@/types/auth'

export async function fetchProfile() {
  const response = await api.get<{ data: AuthUser }>('/profile')

  return response.data.data
}

export async function updateProfile(payload: ProfilePayload) {
  const { avatar, ...profilePayload } = payload

  if (avatar) {
    const formData = new FormData()

    formData.append('_method', 'PATCH')
    formData.append('name', profilePayload.name)
    formData.append('email', profilePayload.email)

    if (profilePayload.nip) {
      formData.append('nip', profilePayload.nip)
    }

    formData.append('avatar', avatar)

    const response = await api.post<ResourceResponse<AuthUser>>(
      '/profile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    return response.data
  }

  const response = await api.patch<ResourceResponse<AuthUser>>(
    '/profile',
    profilePayload,
  )

  return response.data
}

export async function updateProfilePassword(payload: ProfilePasswordPayload) {
  const response = await api.put<{ message: string }>('/profile/password', payload)

  return response.data
}

export async function deleteProfile(payload: ProfileDestroyPayload) {
  const response = await api.delete<{ message: string }>('/profile', {
    data: payload,
  })

  return response.data
}
