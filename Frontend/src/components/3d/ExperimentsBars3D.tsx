/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'

export default function ExperimentsBars3D({
  bars,
  selectedId,
  onSelect,
}: {
  bars: Array<{ id: string; label: string; height: number }>
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.15
  })

  const maxH = Math.max(...bars.map((b) => b.height), 1)

  return (
    <div className="h-[220px] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a12]">
      <Canvas camera={{ position: [0, 0.5, 7.5], fov: 42 }} dpr={[1, 1.5]}>
        <color attach="background" args={['#0a0a12']} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[3, 5, 2]} intensity={1} />
        <Suspense fallback={null}>
          <group ref={groupRef} position={[0, -0.8, 0]}>
            {bars.map((b, i) => {
              const x = (i - (bars.length - 1) / 2) * 0.85
              const h = (b.height / maxH) * 2.2 + 0.15
              const sel = b.id === selectedId
              return (
                <group key={b.id} position={[x, 0, 0]}>
                  <mesh
                    position={[0, h / 2, 0]}
                    onClick={() => onSelect(b.id)}
                    onPointerOver={(e) => {
                      e.stopPropagation()
                      document.body.style.cursor = 'pointer'
                    }}
                    onPointerOut={() => {
                      document.body.style.cursor = 'default'
                    }}
                  >
                    <boxGeometry args={[0.55, h, 0.55]} />
                    <meshStandardMaterial
                      color={sel ? '#a78bfa' : '#4c1d95'}
                      emissive={sel ? '#7c3aed' : '#1e1b4b'}
                      emissiveIntensity={sel ? 0.5 : 0.2}
                    />
                  </mesh>
                  <Html position={[0, h + 0.35, 0]} center>
                    <button
                      type="button"
                      onClick={() => onSelect(b.id)}
                      className="max-w-[72px] truncate rounded bg-black/70 px-1 py-0.5 text-[9px] text-white/80"
                    >
                      {b.label}
                    </button>
                  </Html>
                </group>
              )
            })}
          </group>
        </Suspense>
      </Canvas>
    </div>
  )
}
