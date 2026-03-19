// @ts-nocheck
import { useMemo } from 'react'
import { Line } from '@react-three/drei'

export default function AlgoVisualization3D() {
  const lines = useMemo(() => {
    const pts: Array<[number, number, number, number, number, number]> = []
    for (let i = 0; i < 7; i++) {
      const x1 = -1.0 + i * 0.33
      const y1 = Math.sin(i * 0.7) * 0.55
      const z1 = -0.5 + Math.cos(i * 0.5) * 0.3
      const x2 = -1.0 + i * 0.33
      const y2 = y1 + 0.35
      const z2 = z1 + 0.25
      pts.push([x1, y1, z1, x2, y2, z2])
    }
    return pts
  }, [])

  // We render line segments with a simple <line/> approach via R3F primitives.
  return (
    <group position={[0, 0, 0]}>
      {lines.map((l, idx) => (
        <Line
          key={idx}
          points={[
            [l[0], l[1], l[2]],
            [l[3], l[4], l[5]],
          ]}
          color={0x2563eb}
          transparent
          opacity={0.7}
        />
      ))}
    </group>
  )
}

