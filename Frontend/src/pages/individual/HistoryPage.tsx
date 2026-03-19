import { useMemo, useState } from 'react'

type HistoryRow = {
  date: string
  strategy: string
  index: string
  ret: string
  status: 'Completed' | 'Failed'
}

const mockHistory: HistoryRow[] = [
  { date: '2026-03-10', strategy: 'Combined_v3', index: 'NIFTY 50', ret: '39.91%', status: 'Completed' },
  { date: '2026-03-11', strategy: 'Regime_Aware_v3', index: 'S&P 500', ret: '34.64%', status: 'Completed' },
  { date: '2026-03-14', strategy: 'ML_Signal', index: 'NIFTY 50', ret: '36.33%', status: 'Completed' },
  { date: '2026-03-16', strategy: 'Buy_Hold', index: 'S&P 500', ret: '10.39%', status: 'Completed' },
]

export default function IndividualHistoryPage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return mockHistory
    return mockHistory.filter((r) => `${r.date} ${r.strategy} ${r.index}`.toLowerCase().includes(q))
  }, [query])

  return (
    <div className="mx-auto max-w-7xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
        <h1 className="text-xl font-semibold text-white/90">History</h1>
        <p className="mt-1 text-sm text-white/60">Past backtests and simulations (mock).</p>

        <div className="mt-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by date, strategy, index..."
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90"
          />
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
          <table className="min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-white/70">Date</th>
                <th className="px-4 py-3 text-left text-white/70">Strategy</th>
                <th className="px-4 py-3 text-left text-white/70">Index</th>
                <th className="px-4 py-3 text-left text-white/70">Return</th>
                <th className="px-4 py-3 text-left text-white/70">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={`${r.date}-${r.strategy}`} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white/80">{r.date}</td>
                  <td className="px-4 py-3 text-white/80">{r.strategy}</td>
                  <td className="px-4 py-3 text-white/80">{r.index}</td>
                  <td className={`px-4 py-3 font-semibold ${r.ret.startsWith('-') ? 'text-red-300' : 'text-emerald-200'}`}>
                    {r.ret}
                  </td>
                  <td className="px-4 py-3 text-white/70">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

