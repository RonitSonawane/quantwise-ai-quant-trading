import { useMemo, type ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }: { children: ReactNode }) {
  const pageBg = useMemo(() => {
    return 'bg-[#0A0A0F]'
  }, [])

  return (
    <div className={`${pageBg} min-h-screen`}>
      <Navbar />
      <div className="px-4 py-6">{children}</div>
      <Footer />
    </div>
  )
}

