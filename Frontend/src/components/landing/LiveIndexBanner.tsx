import { useState } from 'react'
import { LineChart } from 'lucide-react'
import type { IndexTickerId } from '../../lib/indexBinanceMap'
import IndexChartModal from '../charts/IndexChartModal'

const items: Array<{ id: IndexTickerId; label: string; value: string; ch: string }> = [
  { id: 'NIFTY50', label: 'NIFTY 50', value: '24,832', ch: '+0.43%' },
  { id: 'SENSEX', label: 'SENSEX', value: '81,765', ch: '+0.38%' },
  { id: 'SP500', label: 'S&P 500', value: '5,892', ch: '+0.21%' },
]

function Segment({ onOpen }: { onOpen: (id: IndexTickerId) => void }) {
  return (
    <>
      {items.map((it) => (
        <button
          key={it.label}
          type="button"
          onClick={() => onOpen(it.id)}
          className="mx-8 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-1 py-0.5 text-sm transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <LineChart className="size-3.5 shrink-0 text-violet-400/90" aria-hidden />
          <span className="font-semibold text-white/90">{it.label}</span>
          <span className="font-mono text-white">{it.value}</span>
          <span className="font-mono text-emerald-400">{it.ch}</span>
          <span className="text-white/30">|</span>
        </button>
      ))}
    </>
  )
}

export default function LiveIndexBanner() {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeId, setActiveId] = useState<IndexTickerId | null>(null)

  const openChart = (id: IndexTickerId) => {
    setActiveId(id)
    setModalOpen(true)
  }

  return (
    <>
      <div className="relative z-[60] overflow-hidden border-b border-white/[0.08] bg-black/50 py-2 backdrop-blur-md">
        <div className="flex animate-marquee whitespace-nowrap">
          <Segment onOpen={openChart} />
          <Segment onOpen={openChart} />
          <Segment onOpen={openChart} />
          <Segment onOpen={openChart} />
        </div>
      </div>
      <IndexChartModal open={modalOpen} indexId={activeId} onClose={() => setModalOpen(false)} />
    </>
  )
}
