import { useEffect, useState, type ReactNode } from 'react'

export default function WebGLGate({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  const [ok, setOk] = useState(true)

  useEffect(() => {
    try {
      const c = document.createElement('canvas')
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl')
      if (!gl) setOk(false)
    } catch {
      setOk(false)
    }
  }, [])

  if (!ok) return <>{fallback}</>
  return <>{children}</>
}
