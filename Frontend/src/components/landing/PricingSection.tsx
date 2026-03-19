import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'

const tiers = [
  {
    name: 'Individual',
    price: 'Free',
    desc: 'Research-grade backtests for personal trading decisions.',
    perks: ['Regime + ML insights', '15 strategy library', 'Backtest + simulation'],
  },
  {
    name: 'Student/Researcher',
    price: '₹499/mo',
    desc: 'Learn the model and run experiments for evaluation.',
    perks: ['Walk-forward tooling', 'Strategy comparisons', 'Educational mode'],
  },
  {
    name: 'Organization',
    price: '₹2,999/mo',
    desc: 'Team analytics, API access and bulk tools.',
    perks: ['API access keys', 'Bulk backtests', 'Team dashboards'],
    highlight: true,
  },
]

export default function PricingSection() {
  return (
    <section className="mx-auto max-w-7xl px-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Pricing</h2>
          <p className="mt-1 text-sm text-white/60">Start free, upgrade when you need deeper analytics.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {tiers.map((t) => (
          <motion.div
            key={t.name}
            whileHover={{ y: -6 }}
            className={`rounded-3xl border p-5 shadow-glow ${
              t.highlight ? 'border-purple-500/50 bg-gradient-to-b from-purple-500/15 to-white/5' : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white/90">{t.name}</h3>
              {t.highlight ? <Crown className="size-4 text-purple-300" /> : null}
            </div>
            <div className="mt-3 text-3xl font-semibold">{t.price}</div>
            <div className="mt-2 text-sm text-white/60">{t.desc}</div>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {t.perks.map((p) => (
                <li key={p}>• {p}</li>
              ))}
            </ul>
            <button
              type="button"
              className={`mt-5 w-full rounded-xl px-4 py-2 text-sm transition ${
                t.highlight
                  ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white hover:opacity-90 shadow-glow'
                  : 'border border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              Choose {t.name}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

