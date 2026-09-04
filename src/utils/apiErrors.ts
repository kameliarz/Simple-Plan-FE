import axios from 'axios'

type LaravelValidationError = {
  errors?: Record<string, string[]>
  message?: string
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<LaravelValidationError>(error)) {
    const errors = error.response?.data.errors

    if (errors) {
      const firstError = Object.values(errors)[0]?.[0]

      if (firstError) {
        return firstError
      }
    }

    return error.response?.data.message ?? error.message
  }

  return 'Terjadi kesalahan. Silakan coba lagi.'
}

export function getValidationErrors(error: unknown) {
  if (axios.isAxiosError<LaravelValidationError>(error)) {
    return error.response?.data.errors ?? {}
  }

  return {}
}
