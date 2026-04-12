export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="mt-4 h-24 w-full" />
    </div>
  )
}
