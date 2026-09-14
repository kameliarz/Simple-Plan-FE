import type { FormEvent } from 'react'

import { IconAlertTriangle, IconX } from '@tabler/icons-react'

import Modal from '@/components/ui/Modal'
import TextArea from '@/components/ui/TextArea'

interface RejectTicketModalProps {
  show: boolean
  ticketNumber: string
  onClose: () => void
  onSubmit?: (reason: string) => void
}

export default function RejectTicketModal({
  show,
  ticketNumber,
  onClose,
  onSubmit,
}: RejectTicketModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const reason = String(formData.get('reason') ?? '').trim()

    if (!reason) {
      return
    }

    onSubmit?.(reason)
  }

  return (
    <Modal
      show={show}
      onClose={onClose}
      showHeader={false}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-7 py-7">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500">
              <IconAlertTriangle
                size={28}
                strokeWidth={2}
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold leading-6 text-slate-800">
                Tolak Tiket
              </h2>

              <p className="mt-1 text-base text-slate-700">
                {ticketNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-600"
            aria-label="Tutup modal"
          >
            <IconX
              size={28}
              strokeWidth={1.8}
            />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-8">
          <TextArea
            id="rejection-reason"
            name="reason"
            label="Alasan Penolakan"
            required
            rows={4}
            placeholder={`Tuliskan alasan penolakan tiket secara jelas
(contoh: deskripsi kurang lengkap, salah kategori,
atau duplikasi laporan)...`}
            className="min-h-32.5 rounded-2xl border-[#DCE4EF] px-4 py-4 text-base placeholder:text-[#91A4C3] focus:border-bluersch focus:ring-bluersch/10"
          />
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-[#F8FAFC] px-7 py-5">
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-13 w-53.5 rounded-xl border border-[#C8D5E5] bg-white px-6 text-base font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="submit"
              className="flex h-13 w-53.5 items-center justify-center gap-2 rounded-xl bg-[#ED1746] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[#D91440]"
            >
              <IconX
                size={20}
                strokeWidth={2}
              />
              Tolak Tiket
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}