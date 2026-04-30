/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Canvas, useFrame } from '@react-three/fiber'
import { Line, Text } from '@react-three/drei'
import { Suspense, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const REGIMES = [
  { name: 'Strong Bull', color: '#1a7a1a', pos: [-2.2, 1.2, 0] },
  { name: 'Weak Bull', color: '#6dbf6d', pos: [-1.1, 1.8, 0.8] },
  { name: 'Strong Sideways', color: '#e6a817', pos: [0, 1.2, -0.6] },
  { name: 'Weak Sideways', color: '#f0d080', pos: [1.1, 1.8, 0.8] },
  { name: 'Weak Bear', color: '#e07050', pos: [2.2, 1.2, 0] },
  { name: 'Strong Bear', color: '#c0392b', pos: [0, 0.3, 1.4] },
]

function Sphere({
  color,
  position,
  name,
  pulse,
}: {
  color: string
  position: [number, number, number]
  name: string
  pulse: boolean
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 0.8 + position[0]) * 0.06
      const s = pulse ? 1 + Math.sin(t * 3) * 0.08 : 1
      ref.current.scale.setScalar(s)
    }
  })
  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={pulse ? 0.55 : 0.25} />
      </mesh>
      <Text position={[0, 0.52, 0]} fontSize={0.12} color="#e5e7eb" anchorX="center" anchorY="bottom" maxWidth={2}>
        {name}
      </Text>
    </group>
  )
}

export default function RegimeSpheresLearn() {
  const [current, setCurrent] = useState(0)
  const pairs = useMemo(() => {
    const p: Array<[[number, number, number], [number, number, number]]> = []
    for (let i = 0; i < REGIMES.length; i++) {
      p.push([REGIMES[i].pos as [number, number, number], REGIMES[(i + 1) % REGIMES.length].pos as [number, number, number]])
    }
    return p
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {REGIMES.map((r, i) => (
          <button
            key={r.name}
            type="button"
            onClick={() => setCurrent(i)}
            className={`rounded-lg border px-2 py-1 text-xs transition ${
              current === i ? 'border-violet-500 bg-violet-600/25 text-violet-100' : 'border-white/10 bg-white/5 text-white/70'
            }`}
          >
            Highlight {r.name}
          </button>
        ))}
      </div>
      <div className="h-[280px] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a12]">
        <Canvas camera={{ position: [0, 0.2, 6.5], fov: 42 }} dpr={[1, 1.5]}>
          <color attach="background" args={['#0a0a12']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 4]} intensity={0.9} />
          <Suspense fallback={null}>
            <group position={[0, -1.1, 0]}>
              {REGIMES.map((r, i) => (
                <Sphere key={r.name} color={r.color} position={r.pos as [number, number, number]} name={r.name} pulse={i === current} />
              ))}
              {pairs.map((pts, idx) => (
                <Line key={idx} points={pts} color="#6b7280" lineWidth={1} transparent opacity={0.45} />
              ))}
            </group>
          </Suspense>
        </Canvas>
      </div>
      <p className="text-xs text-white/50">Arrows suggest possible HMM transitions (illustrative). Selected regime pulses.</p>
    </div>
  )
}
