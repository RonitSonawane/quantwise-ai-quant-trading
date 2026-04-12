/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import type { MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const GREEN = '#22c55e'
const RED = '#f87171'
const VIOLET = 0xa855f7
const BLUE = 0x3b82f6

function MiniCandle({
  x,
  idx,
  tRef,
}: {
  x: number
  idx: number
  tRef: MutableRefObject<number>
}) {
  const bodyRef = useRef<THREE.Mesh>(null)
  const wickRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const t = tRef.current
    const bull = Math.sin(t * 0.9 + idx * 1.1) > 0
    const h = 0.28 + Math.abs(Math.sin(t * 0.85 + idx * 0.35)) * 0.55
    const bodyH = Math.max(0.12, h * 0.62)
    const col = bull ? GREEN : RED
    if (bodyRef.current) {
      bodyRef.current.scale.set(0.2, bodyH, 0.2)
      const mat = bodyRef.current.material as THREE.MeshStandardMaterial
      mat.color.set(col)
      mat.emissive.set(col)
      mat.emissiveIntensity = 0.4
      bodyRef.current.position.y = bodyH / 2
    }
    if (wickRef.current) {
      const wickH = Math.max(0.06, h * 0.2)
      wickRef.current.scale.set(1, wickH, 1)
      wickRef.current.position.y = bodyH + wickH / 2 + 0.015
    }
  })

  return (
    <group position={[x, 0, 0]}>
      <mesh ref={bodyRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={0.2} />
      </mesh>
      <mesh ref={wickRef}>
        <boxGeometry args={[0.05, 1, 0.05]} />
        <meshStandardMaterial color="#cbd5e1" emissive="#e2e8f0" emissiveIntensity={0.08} />
      </mesh>
    </group>
  )
}

function PulseGrid() {
  const lines = useMemo(() => {
    const pts: Array<[number, number, number][]> = []
    const n = 8
    const span = 3.2
    for (let i = 0; i <= n; i++) {
      const t = -span / 2 + (i / n) * span
      pts.push(
        [
          [t, 0.005, -span / 2],
          [t, 0.005, span / 2],
        ],
        [
          [-span / 2, 0.005, t],
          [span / 2, 0.005, t],
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
          color={i % 2 === 0 ? VIOLET : BLUE}
          lineWidth={1.2}
          transparent
          opacity={0.35}
        />
      ))}
    </group>
  )
}

function SparkLine({ tRef }: { tRef: MutableRefObject<number> }) {
  const count = 28
  const positions = useMemo(() => new Float32Array(count * 3), [])
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])
  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#c4b5fd'),
        transparent: true,
        opacity: 0.95,
      }),
    [],
  )
  const lineObj = useMemo(() => new THREE.Line(geometry, material), [geometry, material])

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame(() => {
    const t = tRef.current
    for (let i = 0; i < count; i++) {
      const x = -1.55 + (i / (count - 1)) * 3.1
      const y = 0.85 + Math.sin(t * 1.1 + i * 0.18) * 0.28 + Math.cos(i * 0.11 + t * 0.4) * 0.08
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = -0.4
    }
    const attr = geometry.getAttribute('position')
    attr.needsUpdate = true
  })

  return <primitive object={lineObj} />
}

function DashboardMarketScene() {
  const tRef = useRef(0)
  useFrame((state) => {
    tRef.current = state.clock.elapsedTime
  })

  const xs = useMemo(() => Array.from({ length: 10 }).map((_, i) => -1.4 + (i / 9) * 2.8), [])

  return (
    <group>
      <PulseGrid />
      {xs.map((x, idx) => (
        <MiniCandle key={idx} x={x} idx={idx} tRef={tRef} />
      ))}
      <SparkLine tRef={tRef} />
    </group>
  )
}

export default function MarketGlobe3D() {
  return (
    <div
      className="w-full max-w-[300px] overflow-visible rounded-xl border border-white/[0.08] bg-[#0a0a12] sm:max-w-[320px]"
      style={{
        minHeight: 200,
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Canvas
        camera={{ position: [0, 1.05, 4.2], fov: 42 }}
        style={{ width: '100%', height: 220, minHeight: 200, display: 'block' }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#0a0a12']} />
        <ambientLight intensity={0.42} />
        <pointLight position={[3, 4, 3]} intensity={1.1} color="#a78bfa" />
        <pointLight position={[-2, 2, 2]} intensity={0.45} color="#3b82f6" />
        <Suspense fallback={null}>
          <DashboardMarketScene />
        </Suspense>
      </Canvas>
    </div>
  )
}
