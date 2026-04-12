import { useState } from 'react'

const card = 'rounded-xl border border-white/[0.08] bg-[#12121A] p-5'

const ENDPOINTS = [
  { method: 'GET', path: '/health', desc: 'Service readiness', params: [], example: { ready: true } },
  { method: 'GET', path: '/regime', desc: 'Latest HMM regime label', params: ['asset (optional nifty|sp500)'], example: { nifty: { regime: 'Strong Bull' } } },
  {
    method: 'GET',
    path: '/strategies',
    desc: 'Daily strategy returns series',
    params: ['asset', 'start_date?', 'end_date?', 'limit_points?'],
    example: { strategies: ['Buy_Hold', 'Combined_v3'], data: [] },
  },
  {
    method: 'POST',
    path: '/backtest',
    desc: 'Full pipeline metrics table',
    params: ['JSON body: start_date, end_date, initial_capital, refresh_data'],
    example: { meta: {}, backtests: {} },
  },
  {
    method: 'POST',
    path: '/simulate',
    desc: 'Growth simulation for one strategy',
    params: ['JSON body: asset, strategy, initial_capital, limit_points'],
    example: { result: { final_value: 0 } },
  },
]

export default function OrganizationAPIAccessPage() {
  const [revealed, setRevealed] = useState(false)
  const [tab, setTab] = useState<'python' | 'javascript' | 'curl'>('python')
  const key = 'qw_live_sk_7f3a9c2e1b8d4a6e0f9c1d2b3a4e5f6'

  const py = `import requests

API_KEY = "your-api-key"
BASE_URL = "http://127.0.0.1:8000"

# Current regime
regime = requests.get(
    f"{BASE_URL}/regime",
    headers={"X-API-Key": API_KEY},
).json()

# Run backtest
result = requests.post(
    f"{BASE_URL}/backtest",
    headers={"X-API-Key": API_KEY},
    json={
        "start_date": "2000-01-01",
        "end_date": "2026-01-01",
        "initial_capital": 100000,
        "refresh_data": False,
    },
).json()
`

  const js = `const API_KEY = "your-api-key";
const BASE = "http://127.0.0.1:8000";

const regime = await fetch(BASE + "/regime", {
  headers: { "X-API-Key": API_KEY },
}).then((r) => r.json());

const backtest = await fetch(BASE + "/backtest", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
  body: JSON.stringify({
    start_date: "2000-01-01",
    end_date: "2026-01-01",
    initial_capital: 100000,
    refresh_data: false,
  }),
}).then((r) => r.json());
`

  const curl = `curl -H "X-API-Key: your-api-key" http://127.0.0.1:8000/regime

curl -X POST http://127.0.0.1:8000/backtest \\
  -H "Content-Type: application/json" -H "X-API-Key: your-api-key" \\
  -d '{"start_date":"2000-01-01","end_date":"2026-01-01","initial_capital":100000,"refresh_data":false}'
`

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">QuantWise v3 API</h1>
        <p className="mt-1 text-sm text-white/55">Integrate regime, strategies, backtest, and simulation into your systems.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={card}>
          <h2 className="text-lg font-semibold text-white">API key</h2>
          <div className="mt-4 rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-white/80">
            {revealed ? key : 'qw_live_••••••••••••••••'}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500"
            >
              {revealed ? 'Hide key' : 'Reveal key'}
            </button>
            <button type="button" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5">
              Regenerate key
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(key)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
            >
              Copy key
            </button>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs text-white/50">
              <span>Requests today</span>
              <span>142 / 1000</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[14%] rounded-full bg-violet-500" />
            </div>
            <p className="mt-4 text-sm text-white/55">Requests this month: 3,842</p>
          </div>
        </div>

        <div className={card}>
          <h2 className="text-lg font-semibold text-white">Quick start</h2>
          <div className="mt-3 flex gap-2">
            {(['python', 'javascript', 'curl'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-1.5 text-xs capitalize ${tab === t ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/60'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <pre className="mt-4 max-h-64 overflow-auto rounded-lg border border-white/10 bg-[#0a0a12] p-4 text-left text-xs leading-relaxed text-emerald-300/90">
            {tab === 'python' ? py : tab === 'javascript' ? js : curl}
          </pre>
          <p className="mt-2 text-xs text-amber-200/80">
            Note: ML service currently uses open CORS; production should enforce <code className="text-violet-300">X-API-Key</code> server-side.
          </p>
        </div>
      </div>

      <div className={card}>
        <h2 className="text-lg font-semibold text-white">Endpoints</h2>
        <div className="mt-4 space-y-6">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="border-b border-white/[0.06] pb-6 last:border-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    e.method === 'GET' ? 'bg-blue-500/25 text-blue-200' : 'bg-emerald-500/25 text-emerald-200'
                  }`}
                >
                  {e.method}
                </span>
                <code className="text-sm text-violet-300">{e.path}</code>
              </div>
              <p className="mt-2 text-sm text-white/65">{e.desc}</p>
              {e.params.length ? (
                <ul className="mt-2 list-inside list-disc text-xs text-white/45">
                  {e.params.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              ) : null}
              <pre className="mt-3 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-white/70">
                {JSON.stringify(e.example, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
