export default function ApiMockBadge({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-200">
      Using mock data
    </span>
  )
}
