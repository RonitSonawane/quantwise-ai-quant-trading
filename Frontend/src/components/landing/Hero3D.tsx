/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import FinancialMarket3D from '../3d/FinancialMarket3D'

function ScaledMarket3D() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const update = () => setScale(window.innerWidth < 640 ? 0.7 : window.innerWidth < 1024 ? 0.85 : 1)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return (
    <group scale={scale} position={[0, -1.0, 0]}>
      <FinancialMarket3D />
    </group>
  )
}

export default function Hero3D({ hidden = false }: { hidden?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 8.5], fov: 38 }}
      style={{
        width: '100%',
        maxWidth: '100%',
        height: 'clamp(360px, min(48vw, 48vh), 520px)',
        minHeight: 400,
        display: hidden ? 'none' : 'block',
        visibility: hidden ? 'hidden' : 'visible',
      }}
      className="max-md:!h-[min(400px,55vh)]"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#08080f']} />
      <fog attach="fog" args={['#08080f', 10, 28]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 7, 5]} intensity={1.15} />
      <pointLight position={[-3.5, 2.5, 2]} intensity={0.55} color="#7c3aed" />
      <pointLight position={[3, 1, -2]} intensity={0.35} color="#2563eb" />
      <Suspense fallback={null}>
        <ScaledMarket3D />
      </Suspense>
    </Canvas>
  )
}
