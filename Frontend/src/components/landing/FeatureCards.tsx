import { motion } from 'framer-motion'
import { Activity, Cpu, GitBranch, Layers, ShieldCheck, Sparkles } from 'lucide-react'

const features = [
  {
    title: 'HMM regime detection',
    desc: 'Six market regimes with smoothing and finance-theory labeling.',
    Icon: Layers,
    accent: 'from-purple-600 to-blue-600',
  },
  {
    title: 'ML ensemble signal',
    desc: 'Adaptive logistic, random forest, and gradient boosting for directional probability.',
    Icon: Sparkles,
    accent: 'from-emerald-600 to-teal-500',
  },
  {
    title: '15 strategy library',
    desc: 'Trend, mean reversion, volatility breakout, and momentum models.',
    Icon: Cpu,
    accent: 'from-blue-600 to-cyan-500',
  },
  {
    title: 'Backtest + simulation',
    desc: 'Research-grade backtests and capital growth projection.',
    Icon: ShieldCheck,
    accent: 'from-purple-600 to-emerald-600',
  },
  {
    title: 'Risk analytics',
    desc: 'Sharpe, Sortino, drawdown, Calmar, and profit factor in one view.',
    Icon: Activity,
    accent: 'from-violet-600 to-indigo-600',
  },
  {
    title: 'Regime-aware blend',
    desc: 'Combined_v3 adapts weights using live regime and ML confidence.',
    Icon: GitBranch,
    accent: 'from-fuchsia-600 to-purple-600',
  },
]

export default function FeatureCards() {
  return (
    <>
      {features.map((f) => (
        <motion.div
          key={f.title}
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 shadow-glow"
        >
          <div className="flex items-start gap-3">
            <div className={`rounded-xl bg-gradient-to-br ${f.accent} p-2`}>
              <f.Icon className="size-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white/90">{f.title}</div>
              <div className="mt-1 text-sm text-white/55">{f.desc}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  )
}
