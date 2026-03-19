// @ts-nocheck
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import BullBear3D from '../3d/BullBear3D'
import StockMarket3D from '../3d/StockMarket3D'
import AlgoVisualization3D from '../3d/AlgoVisualization3D'

export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 1.4, 3.2], fov: 50 }}
      style={{ height: 340, width: '100%' }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 2, 3]} intensity={1.2} />
      <Suspense fallback={null}>
        <BullBear3D />
        <StockMarket3D />
        <AlgoVisualization3D />
      </Suspense>
    </Canvas>
  )
}

