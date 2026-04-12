import { motion } from 'framer-motion'
import { BarChart3, BrainCircuit, LineChart } from 'lucide-react'

const steps = [
  {
    title: 'Ingest & engineer',
    body: 'Market data is cleaned and expanded into 59+ quantitative features.',
    Icon: BarChart3,
  },
  {
    title: 'Regimes + ML',
    body: 'A 6-state HMM labels regimes; an ML ensemble scores directional probability.',
    Icon: BrainCircuit,
  },
  {
    title: 'Strategies & blend',
    body: 'Fifteen strategies run in parallel; Combined_v3 adapts to the live regime.',
    Icon: LineChart,
  },
]

export default function HowItWorksSection() {
  return (
    <section className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6">
      <h2 className="text-xl font-semibold text-white">How it works</h2>
      <p className="mt-1 text-sm text-white/60">Three steps from raw prices to an adaptive portfolio signal.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5 text-left"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-violet-600/25 text-violet-200">
              <s.Icon className="size-6" />
            </div>
            <div className="mt-4 text-lg font-semibold text-white/90">
              {i + 1}. {s.title}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
