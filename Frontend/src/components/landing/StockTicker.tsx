import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'

type Ticker = { symbol: string; value: number; changePct: number }

const mock: Ticker[] = [
  { symbol: 'NIFTY 50', value: 24832, changePct: 0.43 },
  { symbol: 'SENSEX', value: 81765, changePct: 0.38 },
  { symbol: 'S&P 500', value: 5892, changePct: 0.21 },
]

function ChangeBadge({ changePct }: { changePct: number }) {
  const positive = changePct >= 0
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${positive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
      {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {positive ? '+' : ''}
      {changePct.toFixed(2)}%
    </span>
  )
}

export default function StockTicker() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glow">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-white/60">Live Index Ticker (Mock)</div>
          <div className="mt-1 text-sm text-white/90">NIFTY 50 • SENSEX • S&P 500</div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-xs text-white/50"
        >
          updated just now
        </motion.div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {mock.map((t) => (
          <motion.div
            key={t.symbol}
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-white/10 bg-black/10 p-3 transition"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-white/70">{t.symbol}</div>
              <ChangeBadge changePct={t.changePct} />
            </div>
            <div className="mt-2 text-xl font-semibold text-white">{t.value.toLocaleString('en-IN')}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

