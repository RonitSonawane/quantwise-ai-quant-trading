export type IndexTickerId = 'NIFTY50' | 'SP500' | 'SENSEX'

export function indexToBinance(id: IndexTickerId): { symbol: string; label: string } {
  switch (id) {
    case 'NIFTY50':
      return { symbol: 'BTCUSDT', label: 'NIFTY 50 (Live Demo)' }
    case 'SP500':
      return { symbol: 'ETHUSDT', label: 'S&P 500 (Live Demo)' }
    case 'SENSEX':
      return { symbol: 'BNBUSDT', label: 'SENSEX (Live Demo)' }
    default:
      return { symbol: 'BTCUSDT', label: 'NIFTY 50 (Live Demo)' }
  }
}

export function labelForSymbol(symbol: string): string {
  if (symbol === 'ETHUSDT') return 'S&P 500 (Live Demo)'
  if (symbol === 'BNBUSDT') return 'SENSEX (Live Demo)'
  return 'NIFTY 50 (Live Demo)'
}
