import { motion } from 'framer-motion'
import { Building2, GraduationCap, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { UserType } from '../../context/AuthContext'
import type { ComponentType } from 'react'

const cards: Array<{ userType: UserType; title: string; desc: string; icon: ComponentType<any>; accent: string }> = [
  { userType: 'individual', title: 'Individual Investor', desc: 'Run backtests and simulation to guide decisions.', icon: UserRound, accent: 'from-purple-600 to-blue-600' },
  { userType: 'student', title: 'Student & Researcher', desc: 'Learn, experiment, and validate regime-aware logic.', icon: GraduationCap, accent: 'from-blue-600 to-emerald-500' },
  { userType: 'organization', title: 'Organization', desc: 'Advanced analytics + API keys for teams.', icon: Building2, accent: 'from-purple-600 to-emerald-600' },
]

export default function UserTypeCards() {
  const navigate = useNavigate()

  return (
    <section>
      <h2 className="text-xl font-semibold text-white">Choose your path</h2>
      <p className="mt-1 text-sm text-white/60">Select your role and continue to sign in.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <motion.button
              key={c.userType}
              type="button"
              whileHover={{ y: -6 }}
              className="group text-left rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              onClick={() => {
                localStorage.setItem('quantwise_user_type', c.userType)
                navigate(`/login?type=${c.userType}`)
              }}
            >
              <div className={`rounded-2xl bg-gradient-to-br ${c.accent} p-2 text-white shadow-glow`}>
                <Icon className="size-6" />
              </div>
              <div className="mt-4 text-base font-semibold text-white/90">{c.title}</div>
              <div className="mt-2 text-sm text-white/60">{c.desc}</div>
              <div className="mt-4 text-sm font-medium text-white/80">Continue →</div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

