import { useEffect, useMemo, useState } from 'react'
import {
  IconActivity,
  IconChartLine,
  IconClock,
  IconPlayerPlay,
  IconRefresh,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useExampleLiveStore } from '@/stores/exampleLiveStore'
import type { ExampleMarketRange } from '@/types/api'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { cn } from '@/utils/cn'

const fallbackRanges: Array<{ id: ExampleMarketRange; label: string }> = [
  { id: 'live', label: 'Live' },
  { id: '1d', label: '1 Hari' },
  { id: '7d', label: '7 Hari' },
  { id: '30d', label: '30 Hari' },
]

function formatCurrency(value?: number | null) {
  if (!value) {
    return '-'
  }

  return new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

function formatNumber(value?: number | null) {
  if (!value) {
    return '-'
  }

  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)
}

function pointsFor(values: Array<number | null> = []) {
  const cleanValues = values.filter((value): value is number => value !== null)

  if (cleanValues.length === 0) {
    return ''
  }

  const min = Math.min(...cleanValues)
  const max = Math.max(...cleanValues)
  const spread = Math.max(max - min, 1)

  return cleanValues
    .map((value, index) => {
      const x = cleanValues.length === 1 ? 0 : (index / (cleanValues.length - 1)) * 100
      const y = 90 - ((value - min) / spread) * 70

      return `${x},${y}`
    })
    .join(' ')
}

function MiniLineChart({
  ihsg,
  labels,
  usd,
}: {
  ihsg: Array<number | null>
  labels: string[]
  usd: Array<number | null>
}) {
  const usdPoints = pointsFor(usd)
  const ihsgPoints = pointsFor(ihsg)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <IconChartLine size={18} strokeWidth={1.5} />
          Pergerakan Pasar
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-primary-600" />
            USD/IDR
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-warning-500" />
            IHSG
          </span>
        </div>
      </div>
      <div className="h-72">
        {usdPoints || ihsgPoints ? (
          <svg
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <polyline
              fill="none"
              points={usdPoints}
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              className="text-primary-600"
            />
            <polyline
              fill="none"
              points={ihsgPoints}
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              className="text-warning-500"
            />
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Belum ada data grafik.
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-between gap-3 text-xs text-slate-500">
        <span>{labels[0] ?? '-'}</span>
        <span>{labels.at(-1) ?? '-'}</span>
      </div>
    </div>
  )
}

export default function ExampleLivePage() {
  const [steps, setSteps] = useState(10)
  const loadingMarket = useExampleLiveStore((state) => state.loadingMarket)
  const loadMarket = useExampleLiveStore((state) => state.loadMarket)
  const loadMetadata = useExampleLiveStore((state) => state.loadMetadata)
  const loadTaskStatus = useExampleLiveStore((state) => state.loadTaskStatus)
  const market = useExampleLiveStore((state) => state.market)
  const metadata = useExampleLiveStore((state) => state.metadata)
  const selectedRange = useExampleLiveStore((state) => state.selectedRange)
  const setRange = useExampleLiveStore((state) => state.setRange)
  const startTask = useExampleLiveStore((state) => state.startTask)
  const taskId = useExampleLiveStore((state) => state.taskId)
  const taskStatus = useExampleLiveStore((state) => state.taskStatus)

  const ranges = metadata?.ranges.length ? metadata.ranges : fallbackRanges
  const labels = market?.labels ?? []
  const usdSeries = useMemo(
    () =>
      market?.mode === 'history'
        ? (market.usd_data ?? [])
        : market?.usd_idr
          ? [market.usd_idr]
          : [],
    [market],
  )
  const ihsgSeries = useMemo(
    () =>
      market?.mode === 'history'
        ? (market.ihsg_data ?? [])
        : market?.ihsg
          ? [market.ihsg]
          : [],
    [market],
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadMetadata().catch((error: unknown) => {
        toast.error(getApiErrorMessage(error))
      })
      loadMarket().catch((error: unknown) => {
        toast.error(getApiErrorMessage(error))
      })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadMarket, loadMetadata])

  useEffect(() => {
    const intervalId = window.setInterval(
      () => {
        loadMarket().catch(() => undefined)
      },
      selectedRange === 'live' ? 5000 : 60000,
    )

    return () => window.clearInterval(intervalId)
  }, [loadMarket, selectedRange])

  useEffect(() => {
    if (!taskId || ['completed', 'error'].includes(taskStatus?.status ?? '')) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      loadTaskStatus().catch(() => undefined)
    }, 1500)

    return () => window.clearInterval(intervalId)
  }, [loadTaskStatus, taskId, taskStatus?.status])

  const handleStartTask = async () => {
    try {
      const message = await startTask(steps)
      toast.success(message)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleRefresh = () => {
    loadMarket().catch((error: unknown) => {
      toast.error(getApiErrorMessage(error))
    })
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Example Live
          </h1>
          <p className="text-sm text-slate-500">
            Monitor data live dan progress background task.
          </p>
        </div>
        <Button
          disabled={loadingMarket}
          icon={<IconRefresh size={18} />}
          label={loadingMarket ? 'Memuat...' : 'Refresh'}
          onClick={handleRefresh}
          variant="secondary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-2 font-semibold text-slate-950 dark:text-white">
              <IconActivity size={20} strokeWidth={1.5} />
              Market Proxy
            </div>
            <div className="flex rounded-md bg-slate-100 p-1 dark:bg-slate-800">
              {ranges.map((range) => (
                <button
                  className={cn(
                    'rounded px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
                    selectedRange === range.id &&
                      'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100',
                  )}
                  key={range.id}
                  onClick={() => {
                    setRange(range.id).catch((error: unknown) => {
                      toast.error(getApiErrorMessage(error))
                    })
                  }}
                  type="button"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-primary-100 bg-primary-50 p-4 dark:border-primary-900/60 dark:bg-primary-950/30">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                USD / IDR
              </p>
              <p className="mt-1 text-2xl font-semibold text-primary-700 dark:text-primary-300">
                {formatCurrency(market?.usd_idr ?? market?.current_usd)}
              </p>
            </div>
            <div className="rounded-md border border-warning-100 bg-warning-50 p-4 dark:border-warning-900/60 dark:bg-warning-950/30">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                IHSG
              </p>
              <p className="mt-1 text-2xl font-semibold text-warning-700 dark:text-warning-300">
                {formatNumber(market?.ihsg ?? market?.current_ihsg)}
              </p>
            </div>
          </div>

          <MiniLineChart ihsg={ihsgSeries} labels={labels} usd={usdSeries} />

          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <IconClock size={14} strokeWidth={1.5} />
              {selectedRange === 'live' ? 'Update 5 detik' : 'Update 1 menit'}
            </span>
            <span>Source: {market?.source ?? '-'}</span>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2 font-semibold text-slate-950 dark:text-white">
            <IconPlayerPlay size={20} strokeWidth={1.5} />
            Background Task
          </div>
          <div className="space-y-4">
            <Input
              label="Jumlah Step"
              max={metadata?.job.max_steps ?? 60}
              min={metadata?.job.min_steps ?? 1}
              onChange={(event) => setSteps(Number(event.target.value))}
              type="number"
              value={steps}
            />
            <Button
              className="w-full"
              icon={<IconPlayerPlay size={18} />}
              label="Mulai Task"
              onClick={() => void handleStartTask()}
            />

            <div className="rounded-md bg-slate-50 p-4 dark:bg-slate-950">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {taskStatus?.status ?? 'idle'}
                </span>
                <span className="text-slate-500">
                  {taskStatus?.progress ?? 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-primary-600 transition-all"
                  style={{ width: `${taskStatus?.progress ?? 0}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {taskStatus?.message ?? 'Belum ada task berjalan.'}
              </p>
              {taskId ? (
                <p className="mt-2 break-all text-xs text-slate-400">
                  {taskId}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
