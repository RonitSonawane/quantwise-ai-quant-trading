import { motion } from 'framer-motion'
import { Cpu, Layers, ShieldCheck, Sparkles } from 'lucide-react'

const features = [
  { title: 'HMM Regime Detection', desc: '6-state market regimes with smoothing and finance-theory labeling.', Icon: Layers, accent: 'from-purple-600 to-blue-600' },
  { title: 'ML Ensemble Signal', desc: 'Adaptive Logistic + RF + Gradient Boosting ensemble for up/down probability.', Icon: Sparkles, accent: 'from-emerald-600 to-teal-500' },
  { title: '15 Strategy Library', desc: 'Trend, mean-reversion, volatility breakout and momentum strategies.', Icon: Cpu, accent: 'from-blue-600 to-cyan-500' },
  { title: 'Backtest + Simulation', desc: 'Run research-grade backtests and investment growth simulation.', Icon: ShieldCheck, accent: 'from-purple-600 to-emerald-600' },
]

export default function FeatureCards() {
  return (
    <>
      {features.map((f) => (
        <motion.div
          key={f.title}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="group rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glow"
        >
          <div className="flex items-start gap-3">
            <div className={`rounded-xl bg-gradient-to-br ${f.accent} p-2`}>
              <f.Icon className="size-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white/90">{f.title}</div>
              <div className="mt-1 text-xs text-white/60">{f.desc}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  )
}

