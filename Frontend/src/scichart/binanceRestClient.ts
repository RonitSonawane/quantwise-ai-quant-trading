export type TPriceBar = {
  date: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const parseCandles = (candles: unknown[]): TPriceBar[] => {
  const priceBars: TPriceBar[] = []
  candles.forEach((candle: unknown) => {
    const [timestamp, open, high, low, close, volume] = candle as [
      number,
      string,
      string,
      string,
      string,
      string,
    ]
    priceBars.push({
      date: timestamp / 1000,
      open: parseFloat(open),
      high: parseFloat(high),
      low: parseFloat(low),
      close: parseFloat(close),
      volume: parseFloat(volume),
    })
  })
  return priceBars
}

const getCandles = async (
  symbol: string,
  interval: string,
  startTime?: Date,
  endTime?: Date,
  limit: number = 500,
  binanceDomain = 'us',
): Promise<TPriceBar[]> => {
  let url = `https://api.binance.${binanceDomain}/api/v3/klines?symbol=${symbol}&interval=${interval}`
  if (startTime) url += `&startTime=${startTime.getTime()}`
  if (endTime) url += `&endTime=${endTime.getTime()}`
  if (limit) url += `&limit=${limit}`
  try {
    const response = await fetch(url)
    const data: unknown = await response.json()
    return parseCandles(Array.isArray(data) ? data : [])
  } catch (err) {
    console.error(err)
    return []
  }
}

export const simpleBinanceRestClient = { getCandles }
