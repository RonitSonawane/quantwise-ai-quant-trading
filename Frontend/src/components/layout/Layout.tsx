import { useMemo, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import LiveIndexBanner from '../landing/LiveIndexBanner'

export default function Layout({ children }: { children: ReactNode }) {
  const pageBg = useMemo(() => 'bg-[#0A0A0F]', [])
  const { pathname } = useLocation()
  const isRoleShell = /^\/(student|organization)\//.test(pathname)

  return (
    <div className={`${pageBg} min-h-screen`}>
      {pathname === '/' ? <LiveIndexBanner /> : null}
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className={
            isRoleShell
              ? 'mx-auto flex w-full max-w-[1920px] justify-center px-0 py-0'
              : 'mx-auto max-w-7xl px-6 py-8'
          }
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
