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
      const av = parseSortable(a[sortKey])
      const bv = parseSortable(b[sortKey])
      if (!Number.isFinite(av) && !Number.isFinite(bv)) return 0
      if (!Number.isFinite(av)) return dir === 'asc' ? -1 : 1
      if (!Number.isFinite(bv)) return dir === 'asc' ? 1 : -1
      return dir === 'asc' ? av - bv : bv - av
    })
    return list
  }, [dir, rows, sortKey])

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow">
      {title ? <div className="text-sm font-semibold text-white/80">{title}</div> : null}
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-[900px] border-separate border-spacing-0 text-sm">
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
                      setDir('desc')
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
              const highlight = highlightByStrategy?.[sName]
              return (
                <tr key={`${sName}-${idx}`} className={highlight ? highlight : 'hover:bg-white/5'}>
                  {columns.map((c) => (
                    <td key={`${sName}-${c.key}`} className="border-b border-white/5 px-3 py-2 text-white/80">
                      {r[c.key] as any}
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

