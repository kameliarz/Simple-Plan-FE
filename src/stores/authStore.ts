import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AuthStatus, AuthUser } from '@/types/auth'

type AuthState = {
  impersonatorToken: string | null
  impersonatorUser: AuthUser | null
  isImpersonating: boolean
  token: string | null
  user: AuthUser | null
  authStatus: AuthStatus
  isAuthenticated: boolean
  setAuth: (token: string, user: AuthUser) => void
  setUser: (user: AuthUser | null) => void
  setAuthStatus: (status: AuthStatus) => void
  startImpersonation: (
    token: string,
    user: AuthUser,
    impersonatorUser: AuthUser,
  ) => void
  stopImpersonation: (user?: AuthUser | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      impersonatorToken: null,
      impersonatorUser: null,
      isImpersonating: false,
      token: null,
      user: null,
      authStatus: 'idle',
      isAuthenticated: false,
      setAuth: (token, user) =>
        set({
          token,
          user,
          authStatus: 'authenticated',
          isAuthenticated: true,
          impersonatorToken: null,
          impersonatorUser: null,
          isImpersonating: false,
        }),
      setUser: (user) => set({ user }),
      setAuthStatus: (authStatus) => set({ authStatus }),
      startImpersonation: (token, user, impersonatorUser) => {
        const current = get()

        set({
          authStatus: 'authenticated',
          impersonatorToken: current.impersonatorToken ?? current.token,
          impersonatorUser,
          isAuthenticated: true,
          isImpersonating: true,
          token,
          user,
        })
      },
      stopImpersonation: (user) => {
        const current = get()
        const restoredToken = current.impersonatorToken
        const restoredUser = user ?? current.impersonatorUser

        set({
          authStatus:
            restoredToken && restoredUser ? 'authenticated' : 'unauthenticated',
          impersonatorToken: null,
          impersonatorUser: null,
          isAuthenticated: Boolean(restoredToken && restoredUser),
          isImpersonating: false,
          token: restoredToken,
          user: restoredUser ?? null,
        })
      },
      clearAuth: () =>
        set({
          impersonatorToken: null,
          impersonatorUser: null,
          isImpersonating: false,
          token: null,
          user: null,
          authStatus: 'unauthenticated',
          isAuthenticated: false,
        }),
    }),
    {
      name: 'simple-plan-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        authStatus: state.authStatus,
        impersonatorToken: state.impersonatorToken,
        impersonatorUser: state.impersonatorUser,
        isImpersonating: state.isImpersonating,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
