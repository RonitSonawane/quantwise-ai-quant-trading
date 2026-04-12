import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Hero3D from '../components/landing/Hero3D'
import { useIndexChartModal } from '../context/IndexChartModalContext'
import FeatureCards from '../components/landing/FeatureCards'
import StrategyPerformanceSection from '../components/landing/StrategyPerformanceSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import UserTypeCards from '../components/landing/UserTypeCards'

export default function LandingPage() {
  const { chartModalOpen } = useIndexChartModal()

  return (
    <div className="relative min-h-0 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.22),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.15),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(13,148,136,0.1),transparent_45%)]" />

      <section className="mx-auto flex min-h-[min(88vh,780px)] max-w-7xl flex-col items-center justify-center lg:flex-row lg:items-center lg:gap-8">
        <div className="w-full max-w-xl flex-1 text-center lg:max-w-none lg:flex-[0.95] lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl"
          >
            AI-Powered Quantitative Trading Intelligence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="mx-auto mt-4 max-w-xl text-pretty text-base text-white/70 lg:mx-0"
          >
            Regime detection with HMM, an ML ensemble for adaptive signals, and a portfolio layer that blends strategies
            with market confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <Link
              to="/login?type=individual"
              className="inline-flex rounded-lg bg-violet-600 px-6 py-2 text-white transition hover:bg-violet-500"
            >
              Get started
            </Link>
            <Link
              to="/register"
              className="inline-flex rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-6 py-2 text-white/90 transition hover:bg-white/10"
            >
              Create account
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mt-10 w-full max-w-xl flex-1 lg:mt-0 lg:max-w-none"
        >
          <div className="overflow-visible rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] shadow-glow">
            <div
              className="flex w-full min-h-[400px] items-center justify-center overflow-visible"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Hero3D hidden={chartModalOpen} />
            </div>
          </div>
        </motion.div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-white">Why QuantWise</h2>
          <p className="mt-1 text-sm text-white/60">Institutional-grade research tools, packaged for clarity.</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCards />
          </div>
        </section>

        <StrategyPerformanceSection />

        <HowItWorksSection />

        <UserTypeCards />
      </div>
    </div>
  )
}
