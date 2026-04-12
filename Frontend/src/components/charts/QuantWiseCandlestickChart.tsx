import { useEffect, useRef, useState } from 'react'
import {
  BarSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  createChart,
  type IChartApi,
  type UTCTimestamp,
} from 'lightweight-charts'

type OhlcSeriesApi = {
  setData: (data: Array<{ time: UTCTimestamp; open: number; high: number; low: number; close: number }>) => void
  update: (bar: { time: UTCTimestamp; open: number; high: number; low: number; close: number }) => void
}
import { simpleBinanceRestClient, type TPriceBar } from '../../scichart/binanceRestClient'

type Props = {
  symbol: string
  symbolLabel: string
  interval?: string
  height?: number
  showOverview?: boolean
  /** OHLC bars vs candlesticks (TradingView Bar series uses thin OHLC-style bars). */
  seriesType?: 'candlestick' | 'ohlc'
  /** @deprecated use seriesType — kept for existing call sites */
  seriesMode?: 'candlestick' | 'ohlc'
  onChartReady?: (chart: IChartApi) => void
  /** Optional regime label overlay (educational). */
  regimeBand?: { label: string; color: string }
}

export type QuantWiseCandlestickChartProps = Props

const SYMBOL_MAP: Record<string, string> = {
  NIFTY50: 'BTCUSDT',
  SP500: 'ETHUSDT',
  SENSEX: 'BNBUSDT',
  BTCUSDT: 'BTCUSDT',
  ETHUSDT: 'ETHUSDT',
  BNBUSDT: 'BNBUSDT',
}

export default function QuantWiseCandlestickChart({
  symbol,
  symbolLabel,
  interval = '5m',
  height = 400,
  seriesType,
  seriesMode = 'candlestick',
  onChartReady,
  regimeBand,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<OhlcSeriesApi | null>(null)
  const onChartReadyRef = useRef(onChartReady)
  onChartReadyRef.current = onChartReady
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const disposedRef = useRef(false)

  const [status, setStatus] = useState<'loading' | 'live' | 'delayed' | 'error'>('loading')
  const [lastPrice, setLastPrice] = useState<number | null>(null)

  const binanceSymbol = SYMBOL_MAP[symbol] || symbol
  const mode = seriesType ?? seriesMode
  const showToolbar = height >= 120

  useEffect(() => {
    let isDisposed = false
    disposedRef.current = false
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0D0D1F' },
        textColor: '#C4C4C4',
      },
      grid: {
        vertLines: { color: '#1a1a2e' },
        horzLines: { color: '#1a1a2e' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#2a2a3e' },
      timeScale: {
        borderColor: '#2a2a3e',
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height,
    })

    chartRef.current = chart
    onChartReadyRef.current?.(chart)

    const priceSeries =
      mode === 'ohlc'
        ? chart.addSeries(BarSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            thinBars: true,
            openVisible: true,
          })
        : chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
          })

    seriesRef.current = priceSeries as OhlcSeriesApi

    const handleResize = () => {
      if (isDisposed || disposedRef.current) return
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        })
      }
    }
    window.addEventListener('resize', handleResize)

    const fetchData = async () => {
      try {
        setStatus('loading')
        const endDate = new Date()
        const startDate = new Date()
        startDate.setHours(endDate.getHours() - 24)

        const bars = await simpleBinanceRestClient.getCandles(
          binanceSymbol,
          interval,
          startDate,
          endDate,
          300,
          'com',
        )

        if (isDisposed || disposedRef.current) return

        if (bars.length === 0) {
          setStatus('error')
          return
        }

        const chartData = bars.map((bar: TPriceBar) => ({
          time: bar.date as UTCTimestamp,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        }))

        priceSeries.setData(chartData)
        setLastPrice(bars[bars.length - 1].close)
        chart.timeScale().fitContent()

        connectWebSocket()
        setStatus('live')
      } catch (err) {
        console.error('Failed to fetch chart data:', err)
        if (!isDisposed) setStatus('error')
      }
    }

    const connectWebSocket = () => {
      if (isDisposed || disposedRef.current) return
      try {
        const ws = new WebSocket(
          `wss://stream.binance.com:9443/ws/${binanceSymbol.toLowerCase()}@kline_${interval}`,
        )
        wsRef.current = ws

        ws.onmessage = (event) => {
          if (isDisposed || disposedRef.current || !seriesRef.current) return
          const data = JSON.parse(event.data) as { k?: Record<string, string> }
          const kline = data.k
          if (!kline) return
          const bar = {
            time: Math.floor(Number(kline.t) / 1000) as UTCTimestamp,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
          }
          seriesRef.current.update(bar)
          setLastPrice(parseFloat(kline.c))
          setStatus('live')
        }

        ws.onerror = () => {
          if (!isDisposed && !disposedRef.current) setStatus('delayed')
        }
        ws.onclose = () => {
          if (isDisposed || disposedRef.current) return
          reconnectRef.current = setTimeout(connectWebSocket, 5000)
        }
      } catch {
        if (!isDisposed) setStatus('delayed')
      }
    }

    void fetchData()

    return () => {
      isDisposed = true
      disposedRef.current = true
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current)
        reconnectRef.current = null
      }
      window.removeEventListener('resize', handleResize)
      const ws = wsRef.current
      if (ws) {
        ws.onmessage = null
        ws.onerror = null
        ws.onclose = null
        try {
          ws.close()
        } catch {
          /* ignore */
        }
        wsRef.current = null
      }
      seriesRef.current = null
      const c = chartRef.current
      chartRef.current = null
      if (c) {
        try {
          c.remove()
        } catch {
          /* already disposed */
        }
      }
    }
  }, [binanceSymbol, interval, height, mode])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {showToolbar ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            background: '#12121A',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>{symbolLabel}</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {lastPrice != null ? (
              <span style={{ color: '#26a69a', fontSize: '14px' }}>{lastPrice.toFixed(2)}</span>
            ) : null}
            <span
              style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: status === 'live' ? '#1a3a1a' : '#2a1a1a',
                color: status === 'live' ? '#26a69a' : '#ef5350',
              }}
            >
              {status === 'live' ? 'LIVE' : status === 'loading' ? 'LOADING...' : status === 'delayed' ? 'DELAYED' : 'DEMO DATA'}
            </span>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: '#1a1a3a',
                color: '#7C3AED',
              }}
            >
              BINANCE PROXY
            </span>
          </div>
        </div>
      ) : null}

      {regimeBand && showToolbar ? (
        <div
          className="pointer-events-none absolute left-3 top-14 z-[5] max-w-[min(100%,280px)] rounded-md px-2 py-1 text-[10px] font-semibold shadow-lg"
          style={{
            backgroundColor: `${regimeBand.color}33`,
            color: regimeBand.color,
            border: `1px solid ${regimeBand.color}88`,
          }}
        >
          Regime: {regimeBand.label}
        </div>
      ) : null}

      {status === 'loading' && showToolbar ? (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#7C3AED',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #7C3AED',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: '12px' }}>Loading chart data...</span>
        </div>
      ) : null}

      <div ref={containerRef} style={{ width: '100%', height: `${height}px` }} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
