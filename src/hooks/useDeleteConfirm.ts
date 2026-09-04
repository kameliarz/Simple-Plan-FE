import Swal from 'sweetalert2'

interface DeleteConfirmOptions {
  confirmText?: string
  onConfirm: () => Promise<void> | void
  text?: string
  title?: string
}

export function useDeleteConfirm() {
  const confirmDelete = async ({
    confirmText = 'Hapus',
    onConfirm,
    text = 'Data yang dihapus tidak dapat dikembalikan.',
    title = 'Hapus data?',
  }: DeleteConfirmOptions) => {
    const result = await Swal.fire({
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48',
      confirmButtonText: confirmText,
      icon: 'warning',
      showCancelButton: true,
      text,
      title,
    })

    if (result.isConfirmed) {
      await onConfirm()
    }
  }

  return { confirmDelete }
}
