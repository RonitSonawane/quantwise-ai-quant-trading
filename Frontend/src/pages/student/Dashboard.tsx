import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical, Microscope, BookOpen, Library } from 'lucide-react'

const card = 'rounded-xl border border-white/[0.08] bg-[#12121A] p-4 shadow-sm'

const checklistKeys = [
  'learn_hmm',
  'learn_15',
  'first_backtest',
  'compare',
  'ml_ensemble',
  'walkforward',
] as const

const checklistLabels: Record<(typeof checklistKeys)[number], string> = {
  learn_hmm: 'Understand HMM Regime Detection',
  learn_15: 'Learn 15 Trading Strategies',
  first_backtest: 'Run First Backtest',
  compare: 'Compare Strategy Performance',
  ml_ensemble: 'Understand ML Ensemble Signal',
  walkforward: 'Complete Walk-Forward Validation',
}

const STORAGE_KEY = 'quantwise_student_progress_v1'

function loadProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function saveProgress(s: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...s]))
}

export default function StudentDashboard() {
  const [done, setDone] = useState<Set<string>>(() => loadProgress())

  const toggle = (k: (typeof checklistKeys)[number]) => {
    setDone((prev) => {
      const n = new Set(prev)
      if (n.has(k)) n.delete(k)
      else n.add(k)
      saveProgress(n)
      return n
    })
  }

  const completed = checklistKeys.filter((k) => done.has(k)).length

  const experiments = useMemo(
    () => [
      { name: 'NIFTY Bull Test', strategy: 'Combined_v3', ret: '+39.91%', sharpe: '0.91', when: 'Today' },
      { name: 'SP500 Analysis', strategy: 'ML_Signal', ret: '+36.33%', sharpe: '0.88', when: 'Yesterday' },
      { name: 'Bear Market Study', strategy: 'Regime_Aware_v3', ret: '+34.64%', sharpe: '0.85', when: '2 days ago' },
      { name: 'Baseline Compare', strategy: 'Buy_Hold', ret: '+10.39%', sharpe: '0.42', when: '3 days ago' },
      { name: 'Vol breakout scan', strategy: 'Vol_Breakout', ret: '+8.20%', sharpe: '0.51', when: 'Last week' },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Student dashboard</h1>
        <p className="mt-1 text-sm text-white/55">Track learning progress and recent research runs.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Experiments run', value: '12' },
          { label: 'Strategies studied', value: '15' },
          { label: 'Best Sharpe found', value: '1.42' },
          { label: 'Hours of research', value: '48' },
        ].map((s) => (
          <div key={s.label} className={card}>
            <div className="text-xs font-medium uppercase tracking-wide text-white/45">{s.label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-white">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={card}>
          <h2 className="text-lg font-semibold text-white">Learning progress</h2>
          <p className="mt-1 text-sm text-white/50">Check off milestones as you complete modules in Learn.</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-violet-600 transition-all"
              style={{ width: `${(completed / checklistKeys.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-white/45">
            {completed}/{checklistKeys.length} completed
          </p>
          <ul className="mt-4 space-y-2">
            {checklistKeys.map((k) => (
              <li key={k}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 text-sm text-white/80 transition hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={done.has(k)}
                    onChange={() => toggle(k)}
                    className="mt-1 size-4 rounded border-white/20 bg-zinc-900 text-violet-600"
                  />
                  <span>{checklistLabels[k]}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className={card}>
          <h2 className="text-lg font-semibold text-white">Recent experiments</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/50">
                  <th className="pb-2 pr-2">Name</th>
                  <th className="pb-2 pr-2">Strategy</th>
                  <th className="pb-2 pr-2">Return%</th>
                  <th className="pb-2 pr-2">Sharpe</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {experiments.map((r) => (
                  <tr key={r.name} className="border-b border-white/[0.06] text-white/80">
                    <td className="py-2 pr-2 font-medium text-white">{r.name}</td>
                    <td className="py-2 pr-2">{r.strategy}</td>
                    <td className="py-2 pr-2 text-emerald-400">{r.ret}</td>
                    <td className="py-2 pr-2 tabular-nums">{r.sharpe}</td>
                    <td className="py-2 text-white/50">{r.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/student/research-lab"
          className={`${card} flex items-center gap-3 transition hover:border-violet-500/40 hover:bg-violet-600/10`}
        >
          <Microscope className="size-8 text-violet-400" />
          <div>
            <div className="font-semibold text-white">Start research lab</div>
            <div className="text-xs text-white/50">Design experiments and run the pipeline</div>
          </div>
        </Link>
        <Link
          to="/student/learn"
          className={`${card} flex items-center gap-3 transition hover:border-violet-500/40 hover:bg-violet-600/10`}
        >
          <BookOpen className="size-8 text-violet-400" />
          <div>
            <div className="font-semibold text-white">Learn HMM</div>
            <div className="text-xs text-white/50">Guided topics and visualizations</div>
          </div>
        </Link>
        <Link
          to="/student/strategies"
          className={`${card} flex items-center gap-3 transition hover:border-violet-500/40 hover:bg-violet-600/10`}
        >
          <Library className="size-8 text-violet-400" />
          <div>
            <div className="font-semibold text-white">View all strategies</div>
            <div className="text-xs text-white/50">15-strategy deep dive library</div>
          </div>
        </Link>
      </div>

      <div className="flex justify-end">
        <Link
          to="/student/experiments"
          className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
        >
          <FlaskConical className="size-4" />
          Open experiments log
        </Link>
      </div>
    </div>
  )
}
