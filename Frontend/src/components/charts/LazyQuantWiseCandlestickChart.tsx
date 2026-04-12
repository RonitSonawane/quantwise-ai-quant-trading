import React, { Suspense } from 'react'

const QuantWiseCandlestickChart = React.lazy(() => import('./QuantWiseCandlestickChart'))

export default function LazyQuantWiseCandlestickChart(props: any) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: props.height || 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#12121A',
            borderRadius: '12px',
            color: '#7C3AED',
          }}
        >
          Loading chart...
        </div>
      }
    >
      <QuantWiseCandlestickChart {...props} />
    </Suspense>
  )
}
