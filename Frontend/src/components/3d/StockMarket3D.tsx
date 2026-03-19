// @ts-nocheck
import { useMemo } from 'react'
import { Vector3 } from 'three'

export default function StockMarket3D() {
  const positions = useMemo(() => {
    const pts: Vector3[] = []
    for (let i = 0; i < 18; i++) {
      const x = (i - 9) * 0.18
      const y = Math.sin(i * 0.55) * 0.25
      const z = Math.cos(i * 0.45) * 0.15
      pts.push(new Vector3(x, y, z))
    }
    return pts
  }, [])

  const color = '#7C3AED'

  return (
    <group position={[0, -0.4, 0]}>
      {positions.map((p, idx) => (
        <mesh key={idx} position={[p.x, p.y, p.z]}>
          <boxGeometry args={[0.12, 0.28 + Math.abs(p.y), 0.12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  )
}

