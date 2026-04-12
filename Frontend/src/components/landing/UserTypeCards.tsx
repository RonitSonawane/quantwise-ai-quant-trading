import { motion } from 'framer-motion'
import { Building2, GraduationCap, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { UserType } from '../../context/AuthContext'
import type { ComponentType } from 'react'

const cards: Array<{
  userType: UserType
  title: string
  desc: string
  icon: ComponentType<{ className?: string }>
  accent: string
}> = [
  {
    userType: 'individual',
    title: 'Individual',
    desc: 'Run backtests and simulations to support personal trading decisions.',
    icon: UserRound,
    accent: 'from-purple-600 to-blue-600',
  },
  {
    userType: 'student',
    title: 'Student',
    desc: 'Learn regime logic, compare strategies, and document experiments.',
    icon: GraduationCap,
    accent: 'from-blue-600 to-emerald-500',
  },
  {
    userType: 'organization',
    title: 'Organization',
    desc: 'Team analytics, collaboration, and API-style workflows.',
    icon: Building2,
    accent: 'from-purple-600 to-emerald-600',
  },
]

export default function UserTypeCards() {
  const navigate = useNavigate()

  return (
    <section className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6">
      <h2 className="text-xl font-semibold text-white">Choose your path</h2>
      <p className="mt-1 text-sm text-white/60">Pick a profile — you can still explore every module after sign-in.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <motion.div
              key={c.userType}
              whileHover={{ y: -4 }}
              className="flex flex-col rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5 transition hover:border-violet-500/30 hover:bg-[rgba(255,255,255,0.04)]"
            >
              <div className={`inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.accent} text-white shadow-glow`}>
                <Icon className="size-6" />
              </div>
              <div className="mt-4 text-lg font-semibold text-white/90">{c.title}</div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">{c.desc}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('quantwise_user_type', c.userType)
                    navigate(`/login?type=${c.userType}`)
                  }}
                  className="rounded-lg bg-violet-600 px-6 py-2 text-sm text-white transition hover:bg-violet-500"
                >
                  Login
                </button>
                <Link
                  to="/register"
                  className="rounded-lg border border-[rgba(255,255,255,0.12)] px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
                >
                  Register
                </Link>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
