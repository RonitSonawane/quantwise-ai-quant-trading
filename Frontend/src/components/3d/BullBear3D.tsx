// @ts-nocheck
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Mesh } from 'three'

export default function BullBear3D() {
  const bullRef = useRef<Mesh | null>(null)
  const bearRef = useRef<Mesh | null>(null)

  const bullColor = useMemo(() => '#2563EB', [])
  const bearColor = useMemo(() => '#EF4444', [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (bullRef.current) {
      bullRef.current.rotation.y = t * 0.6
      bullRef.current.position.y = Math.sin(t) * 0.1
    }
    if (bearRef.current) {
      bearRef.current.rotation.y = -t * 0.6
      bearRef.current.position.y = Math.cos(t) * 0.08
    }
  })

  return (
    <>
      <mesh ref={bullRef as any} position={[-1.2, 0, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color={bullColor} />
      </mesh>
      <mesh ref={bearRef as any} position={[1.2, 0, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color={bearColor} />
      </mesh>
    </>
  )
}

