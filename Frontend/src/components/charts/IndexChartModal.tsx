import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import QuantWiseCandlestickChart from './QuantWiseCandlestickChart'
import type { IndexTickerId } from '../../lib/indexBinanceMap'
import { indexToBinance } from '../../lib/indexBinanceMap'

type Props = {
  open: boolean
  indexId: IndexTickerId | null
  onClose: () => void
}

const intervals = ['1m', '5m', '15m', '1h', '1d'] as const

export default function IndexChartModal({ open, indexId, onClose }: Props) {
  const [interval, setInterval] = useState<(typeof intervals)[number]>('5m')
  const [seriesMode, setSeriesMode] = useState<'candlestick' | 'ohlc'>('candlestick')
  const [price, setPrice] = useState<string | null>(null)

  const mapped = indexId ? indexToBinance(indexId) : null

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !indexId) return
    const m = indexToBinance(indexId)
    let cancelled = false
    void (async () => {
      try {
        const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${m.symbol}`)
        const j = (await r.json()) as { price?: string }
        if (!cancelled && j.price) setPrice(Number(j.price).toLocaleString(undefined, { maximumFractionDigits: 2 }))
      } catch {
        if (!cancelled) setPrice(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, indexId])

  if (!mapped) return null

  return (
    <AnimatePresence mode="sync">
      {open ? (
        <motion.div
          key="chart-fs-overlay"
          role="presentation"
          className="fixed inset-0 flex flex-col"
          style={{
            width: '100vw',
            height: '100vh',
            zIndex: 10000,
            background: 'rgba(0,0,0,0.94)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-visible bg-[#0D0D1F]"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] bg-[#0a0a14] px-3 py-2 sm:px-4"
              style={{ flexShrink: 0 }}
            >
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-semibold text-white sm:text-lg">{mapped.label}</h2>
                <p className="mt-0.5 text-xs text-white/50">
                  {price != null ? (
                    <>
                      Last ~ {price} (proxy pair {mapped.symbol})
                    </>
                  ) : (
                    <>Loading price…</>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="hidden text-[11px] text-white/40 sm:inline">Interval</span>
                {intervals.map((iv) => (
                  <button
                    key={iv}
                    type="button"
                    onClick={() => setInterval(iv)}
                    className="rounded-lg px-2.5 py-1 text-[11px] font-medium sm:text-xs"
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      background: interval === iv ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                      color: interval === iv ? '#fff' : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {iv}
                  </button>
                ))}
                <span className="ml-1 hidden text-[11px] text-white/40 sm:inline">Series</span>
                <button
                  type="button"
                  onClick={() => setSeriesMode('candlestick')}
                  className="rounded-lg px-2.5 py-1 text-[11px] sm:text-xs"
                  style={{
                    border: 'none',
                    cursor: 'pointer',
                    background: seriesMode === 'candlestick' ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                    color: seriesMode === 'candlestick' ? '#fff' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  Candlestick
                </button>
                <button
                  type="button"
                  onClick={() => setSeriesMode('ohlc')}
                  className="rounded-lg px-2.5 py-1 text-[11px] sm:text-xs"
                  style={{
                    border: 'none',
                    cursor: 'pointer',
                    background: seriesMode === 'ohlc' ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                    color: seriesMode === 'ohlc' ? '#fff' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  OHLC
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close chart"
                className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-lg leading-none text-white transition hover:bg-white/10"
              >
                ×
              </button>
            </div>

            <div
              className="relative min-h-0 w-full flex-1 overflow-visible"
              style={{ width: '100%', height: '100%', minHeight: 0, flex: '1 1 auto' }}
            >
              <QuantWiseCandlestickChart
                key={`${mapped.symbol}-${interval}-${seriesMode}`}
                symbol={mapped.symbol}
                symbolLabel={mapped.label}
                interval={interval}
                height={400}
                seriesType={seriesMode}
                fillParent
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
