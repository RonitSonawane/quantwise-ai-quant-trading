export type IndexTickerId = 'NIFTY50' | 'SP500' | 'SENSEX'

export function indexToBinance(id: IndexTickerId): { symbol: string; label: string } {
  switch (id) {
    case 'NIFTY50':
      return { symbol: 'NIFTY50', label: 'NIFTY 50' }
    case 'SP500':
      return { symbol: 'SP500', label: 'S&P 500' }
    case 'SENSEX':
      return { symbol: 'SENSEX', label: 'SENSEX' }
    default:
      return { symbol: 'NIFTY50', label: 'NIFTY 50' }
  }
}

export function labelForSymbol(symbol: string): string {
  if (symbol === 'SP500') return 'S&P 500'
  if (symbol === 'SENSEX') return 'SENSEX'
  return 'NIFTY 50'
}
