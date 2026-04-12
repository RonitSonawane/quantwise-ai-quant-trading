import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import WebGLGate from '../../components/layout/WebGLGate'
import RegimeSpheresLearn from '../../components/3d/RegimeSpheresLearn'
import { STRATEGIES_CATALOG, typeBadgeClass } from '../../data/strategiesCatalog'

const TOPICS = [
  'What is Quantitative Trading?',
  'Understanding Market Regimes',
  'Hidden Markov Model (HMM) Explained',
  '6 Market States Explained',
  'The 15 Trading Strategies',
  'ML Ensemble Signal',
  'Combined_v3 Final Strategy',
  'Walk-Forward Validation',
  'Reading Backtest Results',
] as const

const card = 'rounded-xl border border-white/[0.08] bg-[#12121A] p-5'

const metricTips: Record<string, string> = {
  'Cumul. Return%': 'Total growth over the full sample, including compounding.',
  'Ann. Return%': 'Annualized geometric return — useful to compare horizons.',
  'Volatility%': 'Annualized standard deviation of returns — higher means bumpier ride.',
  Sharpe: 'Risk-adjusted return vs risk-free rate. Above ~1 is often considered solid.',
  Sortino: 'Like Sharpe but only punishes downside volatility.',
  'Max DD%': 'Worst peak-to-bottom loss ever in the sample.',
  Calmar: 'CAGR divided by max drawdown — reward per unit of worst pain.',
  'Win Rate%': 'Share of positive return days; not sufficient alone for quality.',
  'Profit Factor': 'Gross gains divided by gross losses; >1 means winners outweigh losers.',
  'Final Value': 'Ending portfolio value from the configured starting capital.',
}

export default function StudentLearnPage() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>(TOPICS[0])
  const [expanded, setExpanded] = useState<string | null>(null)

  const stateBoxes = useMemo(
    () => [
      { n: 'Strong Bull', c: '#1a7a1a' },
      { n: 'Weak Bull', c: '#6dbf6d' },
      { n: 'Strong Sideways', c: '#e6a817' },
      { n: 'Weak Sideways', c: '#f0d080' },
      { n: 'Weak Bear', c: '#e07050' },
      { n: 'Strong Bear', c: '#c0392b' },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 lg:w-56">
        <div className={`${card} p-3`}>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/45">Topics</div>
          <nav className="space-y-1">
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  topic === t ? 'bg-violet-600/25 text-violet-200' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1 space-y-6">
        {topic === 'What is Quantitative Trading?' && (
          <Article
            title="What is quantitative trading?"
            subtitle="Rules, data, and models instead of gut feel alone."
            body="Quantitative trading uses historical data, statistics, and algorithms to decide when to be in or out of the market. Instead of one-off stories, you test ideas across many years to see if an edge is consistent or just luck."
            chart={
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ x: 'Rules', v: 72 }, { x: 'Data', v: 88 }, { x: 'Risk', v: 64 }]}>
                    <XAxis dataKey="x" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: '#0b0b12', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                      {[0, 1, 2].map((i) => (
                        <Cell key={i} fill={i === 1 ? '#7c3aed' : '#4b5563'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            }
          />
        )}

        {topic === 'Understanding Market Regimes' && (
          <Article
            title="Understanding market regimes"
            subtitle="Markets behave differently in bull, bear, and chop."
            body="A regime is a persistent environment: trends extend in bulls, mean-reversion works in ranges, and defense matters in bears. Recognizing regimes helps you avoid using the wrong tool for the job."
          />
        )}

        {topic === 'Hidden Markov Model (HMM) Explained' && (
          <div className={card}>
            <h2 className="text-xl font-semibold text-white">Hidden Markov Model (HMM)</h2>
            <p className="mt-2 text-sm text-white/60">
              The market&rsquo;s true &ldquo;state&rdquo; is hidden — we only see prices. An HMM assumes the world is in one of a few latent states and learns transition probabilities between them from data.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3 md:grid-cols-6">
              {stateBoxes.map((s) => (
                <div
                  key={s.n}
                  className="rounded-lg border border-white/10 px-2 py-3 text-center text-[10px] font-semibold text-white"
                  style={{ backgroundColor: `${s.c}33`, borderColor: `${s.c}88` }}
                >
                  {s.n}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-white/55">
              Each state implies different risk/return behavior. QuantWise labels states with finance intuition so they are actionable.
            </p>
            <div className="mt-6">
              <WebGLGate
                fallback={
                  <div className="rounded-xl border border-dashed border-white/20 bg-black/30 p-8 text-center text-sm text-white/50">
                    WebGL unavailable — use the 2D state grid above to explore regimes.
                  </div>
                }
              >
                <RegimeSpheresLearn />
              </WebGLGate>
            </div>
          </div>
        )}

        {topic === '6 Market States Explained' && (
          <div className={card}>
            <h2 className="text-xl font-semibold text-white">Six market states</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>
                <strong className="text-emerald-300">Strong Bull</strong> — powerful uptrend, lower drag from volatility.
              </li>
              <li>
                <strong className="text-emerald-200/90">Weak Bull</strong> — upward drift but fragile; risk of shakeouts.
              </li>
              <li>
                <strong className="text-amber-300">Strong Sideways</strong> — range-bound but volatile enough to trade.
              </li>
              <li>
                <strong className="text-amber-200/80">Weak Sideways</strong> — choppy, low edge; capital preservation focus.
              </li>
              <li>
                <strong className="text-orange-300">Weak Bear</strong> — mild downtrend or distribution; reduce risk.
              </li>
              <li>
                <strong className="text-red-300">Strong Bear</strong> — crash-like stress; prioritize survival over returns.
              </li>
            </ul>
          </div>
        )}

        {topic === 'The 15 Trading Strategies' && (
          <div className={card}>
            <h2 className="text-xl font-semibold text-white">The 15 research strategies</h2>
            <p className="mt-1 text-sm text-white/55">
              Core sleeves used inside the engine (excludes Combined_v3 / ML_Signal / Regime_Aware_v3 overlays). Expand a row for
              intuition.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-white/50">
                    <th className="pb-2">Strategy</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Best in regime</th>
                    <th className="pb-2">Avg return (mock)</th>
                    <th className="pb-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {STRATEGIES_CATALOG.filter((s) => !['Combined_v3', 'ML_Signal', 'Regime_Aware_v3'].includes(s.id)).map((s) => (
                    <Fragment key={s.id}>
                      <tr className="border-b border-white/[0.06]">
                        <td className="py-2 font-medium text-white">{s.name}</td>
                        <td className="py-2">
                          <span className={`rounded-full border px-2 py-0.5 text-xs ${typeBadgeClass(s.type)}`}>{s.type}</span>
                        </td>
                        <td className="py-2 text-white/70">{s.bestRegime}</td>
                        <td className="py-2 text-emerald-400/90">{s.avgNiftyReturnMock}</td>
                        <td className="py-2">
                          <button
                            type="button"
                            className="text-violet-400 text-xs hover:underline"
                            onClick={() => setExpanded((e) => (e === s.id ? null : s.id))}
                          >
                            {expanded === s.id ? 'Less' : 'More'}
                          </button>
                        </td>
                      </tr>
                      {expanded === s.id ? (
                        <tr className="bg-black/25">
                          <td colSpan={5} className="px-2 py-3 text-xs text-white/65">
                            {s.detail} — {s.logic}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {topic === 'ML Ensemble Signal' && <MLEnsembleDiagram />}

        {topic === 'Combined_v3 Final Strategy' && (
          <Article
            title="Combined_v3"
            subtitle="Blends regime-aware routing with ML probability and curated high-alpha sleeves."
            body="Combined_v3 is the flagship stack in QuantWise v3: HMM states choose context, the ML ensemble scores directional confidence, and multiple strategies compete so the portfolio layer can overweight what works in the live regime."
          />
        )}

        {topic === 'Walk-Forward Validation' && (
          <Article
            title="Walk-forward validation"
            subtitle="Train on the past, test on unseen future segments."
            body="Instead of fitting once on all history, walk-forward retrains on a rolling window and evaluates on the next chunk. If performance collapses out-of-sample, the edge was likely overfit."
            chart={
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ x: 'In-sample', v: 22 }, { x: 'Out-of-sample', v: 14 }]}>
                    <XAxis dataKey="x" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0b0b12', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Bar dataKey="v" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Return %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            }
          />
        )}

        {topic === 'Reading Backtest Results' && (
          <div className={card}>
            <h2 className="text-xl font-semibold text-white">Reading backtest results</h2>
            <p className="mt-1 text-sm text-white/55">Hover metric headers for plain-language definitions.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="cursor-help pb-2 pr-2 text-left text-xs font-semibold text-white/80" title="Strategy column">
                      Strategy
                    </th>
                    {Object.keys(metricTips).map((h) => (
                      <th key={h} title={metricTips[h]} className="cursor-help pb-2 pr-2 text-left text-xs font-semibold text-violet-300/90">
                        {h} ⓘ
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/[0.06] text-white/80">
                    <td className="py-2 font-medium text-white">Combined_v3</td>
                    <td className="py-2">39.91</td>
                    <td className="py-2">18.2</td>
                    <td className="py-2">14.5</td>
                    <td className="py-2">1.65</td>
                    <td className="py-2">1.42</td>
                    <td className="py-2">-12.0</td>
                    <td className="py-2">1.10</td>
                    <td className="py-2">58</td>
                    <td className="py-2">1.35</td>
                    <td className="py-2">₹39,43,200</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Article({
  title,
  subtitle,
  body,
  chart,
}: {
  title: string
  subtitle: string
  body: string
  chart?: ReactNode
}) {
  return (
    <div className={card}>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-violet-300/80">{subtitle}</p>
      <p className="mt-4 text-sm leading-relaxed text-white/70">{body}</p>
      {chart ? <div className="mt-6">{chart}</div> : null}
    </div>
  )
}

function MLEnsembleDiagram() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setStep((s) => (s + 1) % 4), 1600)
    return () => window.clearInterval(t)
  }, [])

  return (
    <div className={card}>
      <h2 className="text-xl font-semibold text-white">ML ensemble signal</h2>
      <p className="mt-1 text-sm text-white/55">Models vote; outputs feed sizing and the final signal.</p>
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-3">
          {['LogReg', 'RandomForest', 'GradientBoosting'].map((name, i) => (
            <motion.div
              key={name}
              animate={{ opacity: step >= 0 ? 1 : 0.3, scale: step === i ? 1.05 : 1 }}
              className="rounded-lg border border-white/10 bg-violet-600/15 px-4 py-3 text-center text-sm font-medium text-white"
            >
              {name}
              <div className="mt-1 font-mono text-xs text-violet-200">
                {(0.52 + i * 0.07).toFixed(2)} p(up)
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          animate={{ opacity: step >= 1 ? 1 : 0.2 }}
          className="rounded-lg border border-violet-500/40 bg-violet-600/20 px-6 py-2 text-sm text-violet-100"
        >
          Ensemble average → {(0.61).toFixed(2)}
        </motion.div>
        <motion.div
          animate={{ opacity: step >= 2 ? 1 : 0.2 }}
          className="rounded-lg border border-white/10 bg-black/30 px-6 py-2 text-sm text-white/85"
        >
          Position sizing (risk-aware)
        </motion.div>
        <motion.div
          animate={{ opacity: step >= 3 ? 1 : 0.2 }}
          className="rounded-lg border border-emerald-500/40 bg-emerald-600/15 px-6 py-3 text-sm font-semibold text-emerald-200"
        >
          Final signal: Long bias
        </motion.div>
      </div>
    </div>
  )
}
