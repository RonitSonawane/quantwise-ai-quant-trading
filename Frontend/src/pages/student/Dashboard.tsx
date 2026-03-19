import { useMemo } from 'react'

const learnSections = [
  { title: 'What is HMM?', body: 'Hidden Markov Model detects market regimes by learning probability of latent states.' },
  { title: 'Regime labeling', body: 'States are labeled using finance-theory return × volatility grids (6 regimes).' },
  { title: 'Why ML ensemble?', body: 'An ensemble predicts probability of up-move, then blends with regime-aware returns.' },
]

export default function StudentDashboard() {
  const mockTips = useMemo(() => ['Run walk-forward validation', 'Compare sharpe across regimes', 'Inspect regime distribution'], [])

  return (
    <div className="mx-auto max-w-7xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
        <h1 className="text-xl font-semibold text-white/90">Student Dashboard</h1>
        <p className="mt-1 text-sm text-white/60">Learn the model, run experiments, and compare strategies.</p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 lg:col-span-2">
            <div className="text-sm font-semibold text-white/80">Learn</div>
            <div className="mt-3 space-y-3">
              {learnSections.map((s) => (
                <div key={s.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white/90">{s.title}</div>
                  <div className="mt-1 text-sm text-white/65">{s.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/80">Research Tips</div>
            <ul className="mt-3 space-y-2 text-sm text-white/70 list-disc pl-5">
              {mockTips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="mt-5 text-sm text-white/60">Wire experiments here later.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

