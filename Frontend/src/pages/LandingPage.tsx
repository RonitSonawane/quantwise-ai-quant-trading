import { motion } from 'framer-motion'
import Hero3D from '../components/landing/Hero3D'
import StockTicker from '../components/landing/StockTicker'
import FeatureCards from '../components/landing/FeatureCards'
import PricingSection from '../components/landing/PricingSection'
import UserTypeCards from '../components/landing/UserTypeCards'

export default function LandingPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.25),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.18),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(13,148,136,0.12),transparent_45%)]" />

      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-semibold leading-tight md:text-5xl"
            >
              AI-Powered Quantitative Trading Intelligence
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="mt-4 max-w-xl text-white/70"
            >
              Regime detection with HMM, an ML ensemble for adaptive signals, and a portfolio layer that blends
              strategies with market confidence.
            </motion.p>

            <div className="mt-6">
              <StockTicker />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <FeatureCards />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-glow">
            <Hero3D />
          </div>
        </div>

        <div className="mt-14">
          <UserTypeCards />
        </div>

        <div className="mt-14">
          <PricingSection />
        </div>
      </section>
    </div>
  )
}

