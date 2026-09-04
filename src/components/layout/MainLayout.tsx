import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { fetchMe } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function MainLayout() {
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const setUser = useAuthStore((state) => state.setUser)
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return localStorage.getItem('theme') === 'dark'
  })
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    const stored = localStorage.getItem('sidebarOpen')

    return stored ? stored === 'true' : window.innerWidth >= 768
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(sidebarOpen))
  }, [sidebarOpen])

  useEffect(() => {
    if (!token || user) {
      return
    }

    let active = true

    fetchMe()
      .then((profile) => {
        if (active) {
          setUser(profile)
        }
      })
      .catch(() => {
        if (active) {
          clearAuth()
        }
      })

    return () => {
      active = false
    }
  }, [clearAuth, setUser, token, user])

  const toggleSidebar = () => setSidebarOpen((open) => !open)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 transition-colors duration-200 dark:bg-slate-950">
      <Sidebar sidebarOpen={sidebarOpen} />
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          darkMode={darkMode}
          themeSwitcher={() => setDarkMode((enabled) => !enabled)}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 pb-20 md:px-6 md:pb-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
