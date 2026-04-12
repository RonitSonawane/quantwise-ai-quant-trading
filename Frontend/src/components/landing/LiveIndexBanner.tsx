const items = [
  { label: 'NIFTY 50', value: '24,832', ch: '+0.43%' },
  { label: 'SENSEX', value: '81,765', ch: '+0.38%' },
  { label: 'S&P 500', value: '5,892', ch: '+0.21%' },
]

function Segment() {
  return (
    <>
      {items.map((it) => (
        <span key={it.label} className="mx-8 inline-flex items-center gap-2 text-sm">
          <span className="font-semibold text-white/90">{it.label}</span>
          <span className="font-mono text-white">{it.value}</span>
          <span className="font-mono text-emerald-400">{it.ch}</span>
          <span className="text-white/30">|</span>
        </span>
      ))}
    </>
  )
}

export default function LiveIndexBanner() {
  return (
    <div className="relative z-[60] overflow-hidden border-b border-white/[0.08] bg-black/50 py-2 backdrop-blur-md">
      <div className="flex animate-marquee whitespace-nowrap">
        <Segment />
        <Segment />
        <Segment />
        <Segment />
      </div>
    </div>
  )
}
