import { useState } from 'react'

const card = 'rounded-xl border border-white/[0.08] bg-[#12121A] p-5'

const members = [
  { name: 'Admin (you)', role: 'Owner', access: 'Full access', active: 'Now', email: 'admin@fund.com' },
  { name: 'Analyst 1', role: 'Analyst', access: 'Read + Backtest', active: '2h ago', email: 'analyst@fund.com' },
  { name: 'Researcher 1', role: 'Researcher', access: 'Read only', active: '1d ago', email: 'research@fund.com' },
]

export default function OrganizationTeamPage() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Analyst')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Team</h1>
          <p className="mt-1 text-sm text-white/55">Roles, access levels, and audit visibility.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500"
        >
          Add member
        </button>
      </div>

      <div className={card}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-white/45">
                <th className="pb-2">Member</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Access</th>
                <th className="pb-2">Last active</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.email} className="border-b border-white/[0.06]">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-full bg-violet-600/30 text-xs font-bold text-violet-100">
                        {m.name[0]}
                      </span>
                      <span className="font-medium text-white">{m.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-white/80">{m.role}</td>
                  <td className="py-3 text-white/65">{m.access}</td>
                  <td className="py-3 text-white/50">{m.active}</td>
                  <td className="py-3">
                    <button type="button" className="text-xs text-violet-400 hover:underline">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={card}>
        <h2 className="text-lg font-semibold text-white">Access levels</h2>
        <ul className="mt-3 space-y-2 text-sm text-white/65">
          <li>
            <strong className="text-white/90">Owner</strong> — full access including API keys and billing.
          </li>
          <li>
            <strong className="text-white/90">Analyst</strong> — run backtests and view all data.
          </li>
          <li>
            <strong className="text-white/90">Researcher</strong> — read-only access to results and charts.
          </li>
        </ul>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#12121A] p-6">
            <h3 className="text-lg font-semibold text-white">Invite teammate</h3>
            <label className="mt-4 block text-sm">
              <span className="text-white/60">Email</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="mt-3 block text-sm">
              <span className="text-white/60">Role</span>
              <select
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Analyst</option>
                <option>Researcher</option>
                <option>Owner</option>
              </select>
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm text-white/70 hover:bg-white/5">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setEmail('')
                }}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white"
              >
                Send invite
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
