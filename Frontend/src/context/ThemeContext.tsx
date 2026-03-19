import { createContext, useContext, useMemo, type ReactNode } from 'react'

const ThemeContext = createContext<{ theme: 'dark'; setTheme: (t: 'dark') => void } | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // We keep the app permanently on the QuantWise dark theme for now.
  const value = useMemo(() => ({ theme: 'dark' as const, setTheme: (_t: 'dark') => {} }), [])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

