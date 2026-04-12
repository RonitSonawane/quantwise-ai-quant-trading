import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import LazyQuantWiseCandlestickChart from './LazyQuantWiseCandlestickChart'
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

  return (
    <AnimatePresence>
      {open && mapped ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0A0A0F] shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
              <div>
                <h2 className="text-lg font-semibold text-white">{mapped.label}</h2>
                <p className="mt-0.5 font-mono text-sm text-violet-200/90">
                  {price != null ? <>Last ~ {price} (proxy pair {mapped.symbol})</> : <>Loading price…</>}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Close chart"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-white/[0.06] px-4 py-2">
              <span className="mr-2 self-center text-xs text-white/45">Interval</span>
              {intervals.map((iv) => (
                <button
                  key={iv}
                  type="button"
                  onClick={() => setInterval(iv)}
                  className={`rounded-lg px-2.5 py-1 text-xs ${
                    interval === iv ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/65 hover:bg-white/10'
                  }`}
                >
                  {iv}
                </button>
              ))}
              <span className="ml-4 mr-2 self-center text-xs text-white/45">Series</span>
              <button
                type="button"
                onClick={() => setSeriesMode('candlestick')}
                className={`rounded-lg px-2.5 py-1 text-xs ${
                  seriesMode === 'candlestick' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/65'
                }`}
              >
                Candlestick
              </button>
              <button
                type="button"
                onClick={() => setSeriesMode('ohlc')}
                className={`rounded-lg px-2.5 py-1 text-xs ${
                  seriesMode === 'ohlc' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/65'
                }`}
              >
                OHLC
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-4">
              <LazyQuantWiseCandlestickChart
                key={`${mapped.symbol}-${interval}-${seriesMode}`}
                symbol={mapped.symbol}
                symbolLabel={mapped.label}
                interval={interval}
                height={500}
                seriesType={seriesMode}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
