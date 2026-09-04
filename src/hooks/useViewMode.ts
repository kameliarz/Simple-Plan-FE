import { useEffect, useState } from 'react'

export type ViewMode = 'grid' | 'list'

export function useViewMode(
  key = 'viewMode',
  defaultMode: ViewMode = 'list',
) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') {
      return defaultMode
    }

    const stored = localStorage.getItem(key)

    return stored === 'grid' || stored === 'list' ? stored : defaultMode
  })

  useEffect(() => {
    localStorage.setItem(key, viewMode)
  }, [key, viewMode])

  return [viewMode, setViewMode] as const
}
