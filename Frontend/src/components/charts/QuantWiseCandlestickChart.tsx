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
  /** When true, chart fills parent flex area and resizes with container (e.g. fullscreen modal). */
  fillParent?: boolean
  /** Data source to use. Defaults to binance. */
  dataSource?: 'binance' | 'yfinance'
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
  fillParent = false,
  dataSource = 'binance',
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

    const el = containerRef.current
    const initialW = el.clientWidth
    const initialH = fillParent ? Math.max(el.clientHeight, 200) : height

    const chart = createChart(el, {
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
      width: initialW,
      height: initialH,
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
        const w = containerRef.current.clientWidth
        if (fillParent) {
          const h = Math.max(containerRef.current.clientHeight, 120)
          chartRef.current.applyOptions({ width: w, height: h })
        } else {
          chartRef.current.applyOptions({ width: w })
        }
      }
    }
    window.addEventListener('resize', handleResize)

    let ro: ResizeObserver | undefined
    if (fillParent && typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => handleResize())
      ro.observe(containerRef.current)
    }

    queueMicrotask(() => handleResize())

    const fetchData = async () => {
      try {
        setStatus('loading')
        const endDate = new Date()
        const startDate = new Date()
        startDate.setHours(endDate.getHours() - 24)

        let bars: any[] = [];
        if (dataSource === 'binance') {
          bars = await simpleBinanceRestClient.getCandles(
            binanceSymbol,
            interval,
            startDate,
            endDate,
            300,
            'com',
          )
        } else {
          // Fetch from our FastAPI backend
          const res = await fetch(`http://localhost:8000/chart-data/${symbol}?period=5d&interval=${interval}`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
             bars = data.map((d: any) => ({
               date: d.time,
               open: d.open,
               high: d.high,
               low: d.low,
               close: d.close
             }));
          }
        }

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
      
      if (dataSource === 'yfinance') {
        // Poll for live price every 5 seconds since yfinance doesn't have websockets
        const pollInterval = setInterval(async () => {
          if (isDisposed || disposedRef.current) {
            clearInterval(pollInterval);
            return;
          }
          try {
            const res = await fetch(`http://localhost:8000/live-price/${symbol}`);
            const data = await res.json();
            if (data && data.price && seriesRef.current) {
              const ts = Math.floor(new Date(data.time).getTime() / 1000) as UTCTimestamp;
              const bar = {
                time: ts,
                open: data.open || data.price,
                high: data.high || data.price,
                low: data.low || data.price,
                close: data.price
              };
              // lightweight-charts needs strictly increasing time. 
              // We just update the last candle or append if it's a new minute.
              seriesRef.current.update(bar);
              setLastPrice(data.price);
            }
          } catch (e) {
            console.error("Polling error", e);
          }
        }, 5000);
        
        reconnectRef.current = pollInterval as any;
        return;
      }

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
          if (!isDisposed) setStatus('delayed')
        }
        ws.onclose = () => {
          if (isDisposed) return
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
        if (dataSource === 'yfinance') {
          clearInterval(reconnectRef.current as any)
        } else {
          clearTimeout(reconnectRef.current as any)
        }
        reconnectRef.current = null
      }
      window.removeEventListener('resize', handleResize)
      ro?.disconnect()
      const ws = wsRef.current
      if (ws) {
        ws.onmessage = null
        ws.onclose = null
        ws.onerror = null
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
  }, [binanceSymbol, interval, height, mode, fillParent])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: fillParent ? '100%' : undefined,
        minHeight: fillParent ? 0 : undefined,
        display: fillParent ? 'flex' : undefined,
        flexDirection: fillParent ? 'column' : undefined,
        overflow: fillParent ? 'visible' : undefined,
      }}
    >
      {showToolbar ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            background: '#12121A',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
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
            {dataSource === 'binance' && (
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
            )}
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

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: fillParent ? '100%' : `${height}px`,
          minHeight: fillParent ? 120 : undefined,
          flex: fillParent ? 1 : undefined,
          minWidth: 0,
          overflow: 'visible',
        }}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
