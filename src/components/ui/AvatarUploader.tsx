import type { ChangeEvent } from 'react'
import { IconPhoto, IconX } from '@tabler/icons-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export interface AvatarUploaderProps {
  canClear?: boolean
  disabled?: boolean
  error?: string
  name?: string | null
  onChange: (file: File | null) => void
  preview?: string | null
}

export default function AvatarUploader({
  canClear = false,
  disabled = false,
  error,
  name,
  onChange,
  preview,
}: AvatarUploaderProps) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?'

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0] ?? null)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-2xl font-semibold text-primary-700 ring-1 ring-primary-200 dark:bg-slate-800 dark:text-primary-300 dark:ring-slate-700">
        {preview ? (
          <img alt="Avatar" className="size-full object-cover" src={preview} />
        ) : (
          initial
        )}
      </div>
      <div className="flex-1 space-y-3">
        <Input
          accept="image/*"
          disabled={disabled}
          error={error}
          icon={<IconPhoto size={18} />}
          label="Foto Profil"
          name="avatar"
          onChange={handleChange}
          type="file"
        />
        {canClear ? (
          <Button
            disabled={disabled}
            icon={<IconX size={16} />}
            label="Batalkan Pilihan"
            onClick={() => onChange(null)}
            size="sm"
            type="button"
            variant="secondary"
          />
        ) : null}
      </div>
    </div>
  )
}
