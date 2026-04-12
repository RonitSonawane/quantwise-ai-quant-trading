import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type Ctx = {
  chartModalOpen: boolean
  setChartModalOpen: (open: boolean) => void
}

const IndexChartModalContext = createContext<Ctx | null>(null)

export function IndexChartModalProvider({ children }: { children: ReactNode }) {
  const [chartModalOpen, setChartModalOpen] = useState(false)
  const value = useMemo(
    () => ({
      chartModalOpen,
      setChartModalOpen,
    }),
    [chartModalOpen],
  )
  return <IndexChartModalContext.Provider value={value}>{children}</IndexChartModalContext.Provider>
}

export function useIndexChartModal() {
  const ctx = useContext(IndexChartModalContext)
  if (!ctx) {
    return {
      chartModalOpen: false,
      setChartModalOpen: (_open: boolean) => {},
    }
  }
  return ctx
}
