/* eslint-disable @typescript-eslint/ban-ts-comment, react-hooks/immutability -- R3F + Three.js buffer updates */
// @ts-nocheck
import type { MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const GREEN = '#22c55e'
const RED = '#ef4444'
const PURPLE = 0xa855f7
const BLUE = 0x3b82f6

function Candle({
  x,
  z,
  idx,
  tRef,
}: {
  x: number
  z: number
  idx: number
  tRef: MutableRefObject<number>
}) {
  const bodyRef = useRef<THREE.Mesh>(null)
  const wickRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const t = tRef.current
    const bull = Math.sin(t * 0.7 + idx * 0.9) > 0
    const h = 0.35 + Math.abs(Math.sin(t * 0.8 + idx * 0.4)) * 0.85
    const bodyH = Math.max(0.2, h * 0.65)
    const col = bull ? GREEN : RED
    if (bodyRef.current) {
      bodyRef.current.scale.set(0.22, bodyH, 0.22)
      const mat = bodyRef.current.material as THREE.MeshStandardMaterial
      mat.color.set(col)
      mat.emissive.set(col)
      mat.emissiveIntensity = 0.35
      bodyRef.current.position.y = bodyH / 2
    }
    if (wickRef.current) {
      const wickH = Math.max(0.08, h * 0.22)
      wickRef.current.scale.set(1, wickH, 1)
      wickRef.current.position.y = bodyH + wickH / 2 + 0.02
    }
  })

  return (
    <group position={[x, 0, z]}>
      <mesh ref={bodyRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={0.25} />
      </mesh>
      <mesh ref={wickRef}>
        <boxGeometry args={[0.06, 1, 0.06]} />
        <meshStandardMaterial color="#e5e7eb" emissive="#ffffff" emissiveIntensity={0.06} />
      </mesh>
    </group>
  )
}

function GlowingGrid() {
  const lines = useMemo(() => {
    const pts: Array<[number, number, number][]> = []
    const n = 10
    const span = 4.5
    for (let i = 0; i <= n; i++) {
      const t = -span / 2 + (i / n) * span
      pts.push(
        [
          [t, 0.01, -span / 2],
          [t, 0.01, span / 2],
        ],
        [
          [-span / 2, 0.01, t],
          [span / 2, 0.01, t],
        ],
      )
    }
    return pts
  }, [])

  return (
    <group>
      {lines.map((pair, i) => (
        <Line
          key={i}
          points={pair}
          color={i % 2 === 0 ? PURPLE : BLUE}
          lineWidth={1.5}
          transparent
          opacity={0.45}
        />
      ))}
    </group>
  )
}

function PriceLine({ tRef }: { tRef: MutableRefObject<number> }) {
  const count = 42
  const positions = useMemo(() => new Float32Array(count * 3), [count])
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])
  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#ddd6fe'),
      }),
    [],
  )
  const lineObj = useMemo(() => new THREE.Line(geometry, material), [geometry, material])

  useFrame(() => {
    const t = tRef.current
    for (let i = 0; i < count; i++) {
      const x = -2.1 + (i / (count - 1)) * 4.2
      const y = 1.35 + Math.sin(t * 1.05 + i * 0.14) * 0.38 + Math.cos(i * 0.09 + t * 0.35) * 0.1
      const z = -0.75 + Math.sin(i * 0.25 + t * 0.8) * 0.12
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
    }
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute
    attr.needsUpdate = true
  })

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return <primitive object={lineObj} />
}

const floatLabels = [
  { x: -2, y: 2.4, z: 0, text: '+0.43%', sub: 'NIFTY' },
  { x: 2.1, y: 2.1, z: -0.5, text: '+0.38%', sub: 'SENSEX' },
  { x: 0, y: 2.6, z: 1.2, text: '+0.21%', sub: 'S&P 500' },
  { x: -1.5, y: 1.8, z: 1.5, text: '24,832', sub: 'SPOT' },
]

export default function FinancialMarket3D() {
  const tRef = useRef(0)
  useFrame((state) => {
    tRef.current = state.clock.elapsedTime
  })

  const candles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        x: -2.4 + (i / 13) * 4.8,
        z: -0.35 + Math.sin(i * 0.7) * 0.45,
        idx: i,
      })),
    [],
  )

  return (
    <group>
      <GlowingGrid />
      {candles.map((c) => (
        <Candle key={c.idx} x={c.x} z={c.z} idx={c.idx} tRef={tRef} />
      ))}
      <PriceLine tRef={tRef} />
      {floatLabels.map((fl) => (
        <Html key={fl.sub + fl.text} position={[fl.x, fl.y, fl.z]} center transform occlude={false}>
          <div className="pointer-events-none select-none whitespace-nowrap rounded-lg border border-violet-500/40 bg-black/60 px-2 py-1 text-[10px] font-mono text-violet-200 shadow-lg backdrop-blur-sm">
            <div className="text-[8px] uppercase tracking-wider text-white/50">{fl.sub}</div>
            <div className="text-emerald-300">{fl.text}</div>
          </div>
        </Html>
      ))}
    </group>
  )
}
