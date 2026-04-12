import { motion } from 'framer-motion'
import { Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Area, ComposedChart } from 'recharts'

const data = Array.from({ length: 36 }).map((_, i) => {
  const t = i / 35
  return {
    date: `M${String((i % 12) + 1).padStart(2, '0')}`,
    Combined_v3: 100000 * (1 + 0.3991 * t),
    Buy_Hold: 100000 * (1 + 0.1039 * t),
  }
})

export default function StrategyPerformanceSection() {
  return (
    <section className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6">
      <h2 className="text-xl font-semibold text-white">Strategy performance preview</h2>
      <p className="mt-1 text-sm text-white/60">
        Combined_v3: 39.91% vs Buy & Hold: 10.39% (illustrative mock equity curves).
      </p>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mt-6"
      >
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                width={52}
                label={{ value: 'Portfolio (Rs)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: '#0b0b12',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                }}
                formatter={(v) => [`Rs ${Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Buy_Hold" fill="rgba(156,163,175,0.12)" stroke="none" />
              <Area type="monotone" dataKey="Combined_v3" fill="rgba(124,58,237,0.15)" stroke="none" />
              <Line type="monotone" dataKey="Buy_Hold" stroke="#9ca3af" strokeWidth={2} dot={false} name="Buy & Hold" />
              <Line type="monotone" dataKey="Combined_v3" stroke="#7c3aed" strokeWidth={2} dot={false} name="Combined_v3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </section>
  )
}
