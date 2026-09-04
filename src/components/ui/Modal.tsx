import type { ReactNode } from 'react'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { IconX } from '@tabler/icons-react'
import { Fragment } from 'react'
import { cn } from '@/utils/cn'

export type ModalMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
export type ModalType = 'modal' | 'slide-over'

export interface ModalProps {
  children: ReactNode
  closeable?: boolean
  icon?: ReactNode
  maxWidth?: ModalMaxWidth
  onClose?: () => void
  show?: boolean
  title?: string
  type?: ModalType
}

const maxWidthClasses: Record<ModalMaxWidth, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  full: 'sm:max-w-full',
}

export default function Modal({
  children,
  closeable = true,
  icon,
  maxWidth = '2xl',
  onClose = () => undefined,
  show = false,
  title,
  type = 'modal',
}: ModalProps) {
  const close = () => {
    if (closeable) {
      onClose()
    }
  }

  if (type === 'slide-over') {
    return (
      <Transition as={Fragment} show={show}>
        <Dialog as="div" className="relative z-50" onClose={close}>
          <TransitionChild
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <TransitionChild
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <DialogPanel
                    className={cn(
                      'pointer-events-auto w-screen',
                      maxWidthClasses[maxWidth],
                    )}
                  >
                    <div className="flex h-full flex-col overflow-y-scroll border-l border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                      <div className="border-b border-slate-200 bg-slate-50 px-4 py-6 dark:border-slate-800 dark:bg-slate-950/50 sm:px-6">
                        <div className="flex items-start justify-between">
                          <DialogTitle className="text-lg font-semibold leading-6 text-slate-900 dark:text-slate-100">
                            {title}
                          </DialogTitle>
                          <button
                            className="rounded-md bg-transparent text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                            onClick={close}
                            type="button"
                          >
                            <span className="sr-only">Tutup panel</span>
                            <IconX aria-hidden="true" className="size-6" />
                          </button>
                        </div>
                      </div>
                      <div className="relative flex-1 px-4 py-6 sm:px-6">
                        {children}
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  }

  return (
    <Transition as={Fragment} leave="duration-200" show={show}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex transform items-center overflow-y-auto px-4 py-6 transition-all sm:px-0"
        onClose={close}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-75"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-slate-900/60" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <DialogPanel
            className={cn(
              'mb-6 w-full transform overflow-hidden rounded-lg bg-white shadow-xl transition-all dark:bg-slate-950 sm:mx-auto',
              maxWidthClasses[maxWidth],
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 text-base font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-300">
              <DialogTitle className="flex items-center gap-2">
                {icon ? <span className="text-primary-500">{icon}</span> : null}
                {title}
              </DialogTitle>
              <button
                className="rounded-md bg-transparent text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={close}
                type="button"
              >
                <span className="sr-only">Tutup modal</span>
                <IconX aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="p-4">{children}</div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  )
}
