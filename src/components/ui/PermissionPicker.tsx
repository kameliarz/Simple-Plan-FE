import { useMemo } from 'react'
import { IconShieldCheck } from '@tabler/icons-react'
import { groupPermissions } from '@/services/roleService'
import type { Permission } from '@/types/auth'
import { cn } from '@/utils/cn'

export interface PermissionPickerProps {
  error?: string
  onChange: (permissionIds: number[]) => void
  permissions: Permission[]
  selected: number[]
}

export default function PermissionPicker({
  error,
  onChange,
  permissions,
  selected,
}: PermissionPickerProps) {
  const groupedPermissions = useMemo(
    () => groupPermissions(permissions),
    [permissions],
  )

  const togglePermission = (permissionId: number) => {
    onChange(
      selected.includes(permissionId)
        ? selected.filter((id) => id !== permissionId)
        : [...selected, permissionId],
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedPermissions).map(([group, items]) => (
        <div
          className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
          key={group}
        >
          <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:text-slate-100">
            <IconShieldCheck size={18} strokeWidth={1.5} />
            Modul {group}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((permission) => {
              const checked = selected.includes(permission.id)

              return (
                <label
                  className={cn(
                    'flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition',
                    checked
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-200'
                      : 'border-slate-200 text-slate-700 hover:border-primary-300 dark:border-slate-700 dark:text-slate-300',
                  )}
                  key={permission.id}
                >
                  <input
                    checked={checked}
                    className="rounded border-slate-300 text-primary-600 shadow-sm focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900"
                    onChange={() => togglePermission(permission.id)}
                    type="checkbox"
                  />
                  <span className="break-all">{permission.name}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}

      {permissions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          Belum ada permission tersedia.
        </div>
      ) : null}

      {error ? <p className="text-xs text-danger-500">{error}</p> : null}
    </div>
  )
}
