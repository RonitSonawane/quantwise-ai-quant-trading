/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import FinancialMarket3D from '../3d/FinancialMarket3D'

export default function Hero3D({ hidden = false }: { hidden?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 2.4, 6.2], fov: 42 }}
      style={{
        height: 300,
        width: '100%',
        display: hidden ? 'none' : 'block',
        visibility: hidden ? 'hidden' : 'visible',
      }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#08080f']} />
      <fog attach="fog" args={['#08080f', 8, 22]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 7, 5]} intensity={1.15} />
      <pointLight position={[-3.5, 2.5, 2]} intensity={0.55} color="#7c3aed" />
      <pointLight position={[3, 1, -2]} intensity={0.35} color="#2563eb" />
      <Suspense fallback={null}>
        <FinancialMarket3D />
      </Suspense>
    </Canvas>
  )
}
