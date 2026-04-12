const card = 'rounded-xl border border-white/[0.08] bg-[#12121A] p-5'

const downloads = [
  { file: 'backtest_nifty_2026.csv', type: 'CSV', date: '2026-04-10', size: '842 KB' },
  { file: 'equity_combined_v3.json', type: 'JSON', date: '2026-04-09', size: '1.2 MB' },
  { file: 'regime_history_2025.csv', type: 'CSV', date: '2026-04-01', size: '310 KB' },
]

export default function OrganizationExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Export center</h1>
        <p className="mt-1 text-sm text-white/55">Download research outputs for offline analysis and compliance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={card}>
          <h2 className="font-semibold text-white">Backtest results CSV</h2>
          <p className="mt-2 text-sm text-white/55">All strategy metrics for a chosen window.</p>
          <label className="mt-4 block text-xs text-white/50">
            Date range
            <input type="month" className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white" />
          </label>
          <button type="button" className="mt-4 w-full rounded-lg bg-violet-600 py-2 text-sm text-white hover:bg-violet-500">
            Download
          </button>
        </div>
        <div className={card}>
          <h2 className="font-semibold text-white">Equity curve data</h2>
          <p className="mt-2 text-sm text-white/55">Daily portfolio values for any strategy.</p>
          <select className="mt-4 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white">
            <option>Combined_v3</option>
            <option>ML_Signal</option>
            <option>Buy_Hold</option>
          </select>
          <button type="button" className="mt-4 w-full rounded-lg bg-violet-600 py-2 text-sm text-white hover:bg-violet-500">
            Download
          </button>
        </div>
        <div className={card}>
          <h2 className="font-semibold text-white">Regime history</h2>
          <p className="mt-2 text-sm text-white/55">Day-by-day regime labels from HMM pipeline.</p>
          <button type="button" className="mt-4 w-full rounded-lg bg-violet-600 py-2 text-sm text-white hover:bg-violet-500">
            Download
          </button>
        </div>
        <div className={`${card} relative overflow-hidden`}>
          <span className="absolute right-3 top-3 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-200">
            Coming soon
          </span>
          <h2 className="font-semibold text-white">Executive report PDF</h2>
          <p className="mt-2 text-sm text-white/55">Charts + narrative suitable for IC packs.</p>
          <button type="button" disabled className="mt-4 w-full rounded-lg border border-white/10 py-2 text-sm text-white/35">
            Notify me
          </button>
        </div>
      </div>

      <div className={card}>
        <h2 className="text-lg font-semibold text-white">Recent downloads</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-white/45">
                <th className="pb-2">File</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Size</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {downloads.map((d) => (
                <tr key={d.file} className="border-b border-white/[0.06]">
                  <td className="py-2 font-mono text-xs text-violet-200">{d.file}</td>
                  <td className="py-2">{d.type}</td>
                  <td className="py-2 text-white/55">{d.date}</td>
                  <td className="py-2">{d.size}</td>
                  <td className="py-2">
                    <button type="button" className="text-xs text-violet-400 hover:underline">
                      Again
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
