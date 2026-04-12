import { useMemo, useState } from 'react'

type Row = Record<string, unknown> & { Strategy?: string }

function parseSortable(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const cleaned = v.replace(/[^0-9.+-eE]/g, '')
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : Number.NaN
  }
  return Number.NaN
}

function rowHighlightClass(strategyName: string, extra?: Record<string, string>) {
  if (strategyName === 'Combined_v3') return 'bg-purple-500/20'
  if (strategyName === 'Buy_Hold') return 'bg-zinc-600/25'
  return extra?.[strategyName] ?? ''
}

export default function StrategyTable({
  title,
  rows,
  columns,
  rowKey = 'Strategy',
  highlightByStrategy,
}: {
  title?: string
  rows: Row[]
  columns: Array<{ key: string; label: string }>
  rowKey?: string
  highlightByStrategy?: Record<string, string>
}) {
  const [sortKey, setSortKey] = useState<string>(columns[0]?.key ?? rowKey)
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')

  const sorted = useMemo(() => {
    const list = [...rows]
    list.sort((a, b) => {
      if (sortKey === rowKey) {
        const as = String(a[sortKey] ?? '')
        const bs = String(b[sortKey] ?? '')
        return dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
      }
      const av = parseSortable(a[sortKey])
      const bv = parseSortable(b[sortKey])
      if (!Number.isFinite(av) && !Number.isFinite(bv)) return 0
      if (!Number.isFinite(av)) return dir === 'asc' ? -1 : 1
      if (!Number.isFinite(bv)) return dir === 'asc' ? 1 : -1
      return dir === 'asc' ? av - bv : bv - av
    })
    return list
  }, [dir, rows, sortKey, rowKey])

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 shadow-glow">
      {title ? <div className="text-lg font-semibold text-white/90">{title}</div> : null}
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-[1100px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="cursor-pointer select-none border-b border-white/10 px-3 py-2 text-left text-white/70"
                  onClick={() => {
                    if (sortKey === c.key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                    else {
                      setSortKey(c.key)
                      setDir(c.key === rowKey ? 'asc' : 'desc')
                    }
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    {c.label}
                    {sortKey === c.key ? <span className="text-xs text-white/50">{dir === 'asc' ? '↑' : '↓'}</span> : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, idx) => {
              const sName = String((r[rowKey] as unknown) ?? '')
              const hl = rowHighlightClass(sName, highlightByStrategy)
              return (
                <tr key={`${sName}-${idx}`} className={`${hl} hover:bg-white/5`}>
                  {columns.map((c) => (
                    <td key={`${sName}-${c.key}`} className="border-b border-white/5 px-3 py-2 text-white/85">
                      {String(r[c.key] ?? '')}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
