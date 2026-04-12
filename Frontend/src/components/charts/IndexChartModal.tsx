import { useEffect, useState } from 'react'
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
  const [chartHeight, setChartHeight] = useState(500)

  const mapped = indexId ? indexToBinance(indexId) : null

  useEffect(() => {
    if (!open) return
    const measure = () => setChartHeight(Math.max(280, Math.round(window.innerHeight * 0.9 - 150)))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [open])

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

  if (!open || !mapped) return null

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.92)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: '95vw',
          height: '90vh',
          background: '#0D0D1F',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
          minHeight: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>{mapped.label}</h2>
            <p style={{ color: '#888', margin: '6px 0 0', fontSize: '12px' }}>
              {price != null ? (
                <>
                  Last ~ {price} (proxy pair {mapped.symbol})
                </>
              ) : (
                <>Loading price…</>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chart"
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
          <span style={{ alignSelf: 'center', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginRight: 4 }}>Interval</span>
          {intervals.map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setInterval(iv)}
              style={{
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 12,
                border: 'none',
                cursor: 'pointer',
                background: interval === iv ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                color: interval === iv ? '#fff' : 'rgba(255,255,255,0.7)',
              }}
            >
              {iv}
            </button>
          ))}
          <span
            style={{
              alignSelf: 'center',
              fontSize: 12,
              color: 'rgba(255,255,255,0.45)',
              marginLeft: 12,
              marginRight: 4,
            }}
          >
            Series
          </span>
          <button
            type="button"
            onClick={() => setSeriesMode('candlestick')}
            style={{
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 12,
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
            style={{
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 12,
              border: 'none',
              cursor: 'pointer',
              background: seriesMode === 'ohlc' ? '#7c3aed' : 'rgba(255,255,255,0.06)',
              color: seriesMode === 'ohlc' ? '#fff' : 'rgba(255,255,255,0.7)',
            }}
          >
            OHLC
          </button>
        </div>

        <div style={{ flex: 1, padding: '0 20px 20px', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          <QuantWiseCandlestickChart
            key={`${mapped.symbol}-${interval}-${seriesMode}`}
            symbol={mapped.symbol}
            symbolLabel={mapped.label}
            interval={interval}
            height={chartHeight}
            seriesType={seriesMode}
          />
        </div>
      </div>
    </div>
  )
}
