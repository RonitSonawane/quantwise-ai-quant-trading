/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'

function Globe() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.12
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.1, 48, 48]} />
      <meshStandardMaterial color="#1e3a5f" emissive="#312e81" emissiveIntensity={0.25} roughness={0.45} metalness={0.2} />
    </mesh>
  )
}

function Pin({ pos, color }: { pos: [number, number, number]; color: string }) {
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
    </mesh>
  )
}

export default function MarketGlobe3D() {
  const india: [number, number, number] = [0.45, 0.65, 0.95]
  const usa: [number, number, number] = [-0.75, 0.55, 0.85]

  return (
    <div className="h-[200px] w-full max-w-[280px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a12]">
      <Canvas camera={{ position: [0, 0.3, 3.2], fov: 42 }} dpr={[1, 1.5]}>
        <color attach="background" args={['#0a0a12']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 4, 4]} intensity={1.2} color="#a78bfa" />
        <Suspense fallback={null}>
          <Globe />
          <Pin pos={india} color="#22c55e" />
          <Pin pos={usa} color="#3b82f6" />
          <Line points={[india, usa]} color="#c4b5fd" lineWidth={2} transparent opacity={0.85} />
        </Suspense>
      </Canvas>
    </div>
  )
}
