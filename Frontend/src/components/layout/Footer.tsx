export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 py-6 text-sm text-white/50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <span>QuantWise v3 © {new Date().getFullYear()}</span>
          <span>AI-powered regime-aware strategy research</span>
        </div>
      </div>
    </footer>
  )
}

