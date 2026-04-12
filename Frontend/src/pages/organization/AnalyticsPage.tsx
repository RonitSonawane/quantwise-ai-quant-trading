import { useMemo, useState } from 'react'
import LazyQuantWiseCandlestickChart from '../../components/charts/LazyQuantWiseCandlestickChart'
import { labelForSymbol } from '../../lib/indexBinanceMap'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend } from 'recharts'
import StrategyTable from '../../components/dashboard/StrategyTable'
import { buildStrategyTableColumns } from '../../lib/backtestColumns'
const card = 'rounded-xl border border-white/[0.08] bg-[#12121A] p-5'

const niftyMock = [
  { Strategy: 'Combined_v3', 'Cumulative Return (%)': 39.91, 'Ann. Return (%)': 18.2, 'Sharpe Ratio': 1.65, 'Max Drawdown (%)': -12 },
  { Strategy: 'Buy_Hold', 'Cumulative Return (%)': 10.39, 'Ann. Return (%)': 6.1, 'Sharpe Ratio': 0.45, 'Max Drawdown (%)': -22 },
  { Strategy: 'ML_Signal', 'Cumulative Return (%)': 36.33, 'Sharpe Ratio': 1.52 },
]

const spMock = [
  { Strategy: 'Combined_v3', 'Cumulative Return (%)': 35.2, 'Ann. Return (%)': 16.4, 'Sharpe Ratio': 1.48 },
  { Strategy: 'Buy_Hold', 'Cumulative Return (%)': 12.1, 'Sharpe Ratio': 0.52 },
]

const regimeWinners = [
  { regime: 'Strong Bull', best: 'Combined_v3', avg: 22.4, days: 412 },
  { regime: 'Weak Bull', best: 'ML_Signal', avg: 14.1, days: 318 },
  { regime: 'Strong Sideways', best: 'Regime_Aware_v3', avg: 9.2, days: 276 },
  { regime: 'Weak Sideways', best: 'Risk_Parity', avg: 5.8, days: 198 },
  { regime: 'Weak Bear', best: 'Defensive_Cash', avg: 3.2, days: 124 },
  { regime: 'Strong Bear', best: 'Defensive_Cash', avg: -1.2, days: 56 },
]

export default function OrganizationAnalyticsPage() {
  const [advSymbol, setAdvSymbol] = useState<'BTCUSDT' | 'ETHUSDT' | 'BNBUSDT'>('BTCUSDT')
  const [advIv, setAdvIv] = useState<'1m' | '5m' | '15m' | '1h' | '1d'>('15m')
  const [advSeries, setAdvSeries] = useState<'candlestick' | 'ohlc'>('candlestick')
  const [tab, setTab] = useState<'nifty' | 'sp500' | 'side'>('nifty')

  const rows = tab === 'nifty' ? niftyMock : tab === 'sp500' ? spMock : [...niftyMock.map((r) => ({ ...r, Index: 'NIFTY' })), ...spMock.map((r) => ({ ...r, Index: 'S&P500' }))]
  const cols = buildStrategyTableColumns(rows[0] as Record<string, unknown>)

  const dd = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        x: i,
        dd: -Math.abs(Math.sin(i / 8) * 14 + (i > 40 ? 4 : 0)),
      })),
    [],
  )

  const wf = [
    { s: 'Combined_v3', inS: 28, outS: 19 },
    { s: 'ML_Signal', inS: 24, outS: 17 },
    { s: 'Regime_Aware_v3', inS: 22, outS: 15 },
    { s: 'Buy_Hold', inS: 12, outS: 9 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-white/55">Performance matrix, risk, regimes, and walk-forward view.</p>
      </div>

      <section className={card}>
        <h2 className="text-lg font-semibold text-white">Advanced live chart</h2>
        <p className="mt-1 text-sm text-white/50">Full-width live chart with symbol, interval, and series type controls.</p>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="text-sm text-white/70">
            Symbol
            <select
              className="mt-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              value={advSymbol}
              onChange={(e) => setAdvSymbol(e.target.value as typeof advSymbol)}
            >
              <option value="BTCUSDT">BTCUSDT (NIFTY proxy)</option>
              <option value="ETHUSDT">ETHUSDT (S&amp;P proxy)</option>
              <option value="BNBUSDT">BNBUSDT (SENSEX proxy)</option>
            </select>
          </label>
          <label className="text-sm text-white/70">
            Interval
            <select
              className="mt-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              value={advIv}
              onChange={(e) => setAdvIv(e.target.value as typeof advIv)}
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="1d">1d</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <span className="text-sm text-white/70">Series</span>
            <button
              type="button"
              onClick={() => setAdvSeries('candlestick')}
              className={`rounded-lg px-3 py-2 text-xs ${advSeries === 'candlestick' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/65'}`}
            >
              Candlestick
            </button>
            <button
              type="button"
              onClick={() => setAdvSeries('ohlc')}
              className={`rounded-lg px-3 py-2 text-xs ${advSeries === 'ohlc' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/65'}`}
            >
              OHLC
            </button>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.08] bg-black/30">
          <LazyQuantWiseCandlestickChart
            key={`${advSymbol}-${advIv}-${advSeries}`}
            symbol={advSymbol}
            symbolLabel={labelForSymbol(advSymbol)}
            interval={advIv}
            height={350}
            seriesType={advSeries}
          />
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-semibold text-white">Strategy performance matrix</h2>
        <div className="mt-4 flex gap-2">
          {(['nifty', 'sp500', 'side'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm ${tab === t ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/65'}`}
            >
              {t === 'nifty' ? 'NIFTY 50' : t === 'sp500' ? 'S&P 500' : 'Side by side'}
            </button>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto">
          <StrategyTable rows={rows as Record<string, unknown>[]} columns={cols} />
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-semibold text-white">Risk analysis</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['VaR 95% (daily)', '-2.3%'],
            ['Expected shortfall', '-3.1%'],
            ['Beta vs Nifty', '0.42'],
            ['Correlation to market', '0.38'],
          ].map(([a, b]) => (
            <div key={a} className="rounded-xl border border-white/[0.08] bg-black/30 p-4">
              <div className="text-xs text-white/45">{a}</div>
              <div className="mt-2 text-xl font-semibold text-white">{b}</div>
            </div>
          ))}
        </div>
        <h3 className="mt-8 text-sm font-semibold text-white/80">Drawdown analysis (mock)</h3>
        <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 0 }} className="mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dd} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="x" tick={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} width={40} />
              <Tooltip contentStyle={{ background: '#0b0b12', border: '1px solid rgba(255,255,255,0.08)' }} />
              <Area type="monotone" dataKey="dd" stroke="#f87171" fill="rgba(248,113,113,0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-semibold text-white">Regime impact (model-aligned mock)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-white/45">
                <th className="pb-2">Regime</th>
                <th className="pb-2">Best strategy</th>
                <th className="pb-2">Avg return in regime</th>
                <th className="pb-2">Days active</th>
              </tr>
            </thead>
            <tbody>
              {regimeWinners.map((r) => (
                <tr key={r.regime} className="border-b border-white/[0.06]">
                  <td className="py-2 text-white">{r.regime}</td>
                  <td className="py-2 text-violet-300">{r.best}</td>
                  <td className="py-2">{r.avg}%</td>
                  <td className="py-2 text-white/55">{r.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-semibold text-white">Walk-forward results (mock)</h2>
        <div style={{ width: '100%', height: 300 }} className="mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wf} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="s" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0b0b12', border: '1px solid rgba(255,255,255,0.08)' }} />
              <Legend />
              <Bar dataKey="inS" fill="#7c3aed" name="In-sample %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outS" fill="#0d9488" name="Out-of-sample %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
