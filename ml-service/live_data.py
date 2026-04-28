import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import time

TICKERS = {
    "NIFTY50": "^NSEI",
    "SP500":   "^GSPC",
    "SENSEX":  "^BSESN"
}

def get_live_price(index_name: str) -> dict:
    ticker_symbol = TICKERS.get(index_name, "^NSEI")
    try:
        ticker = yf.Ticker(ticker_symbol)
        data = ticker.history(period="1d", interval="1m")
        if data.empty:
            data = ticker.history(period="5d", interval="1d")
        if data.empty:
            return {"error": "No data available", "index": index_name}
        latest = data.iloc[-1]
        open_price = float(data.iloc[0]['Open'])
        current = float(latest['Close'])
        change = current - open_price
        change_pct = (change / open_price) * 100
        return {
            "index":      index_name,
            "price":      round(current, 2),
            "open":       round(open_price, 2),
            "high":       round(float(data['High'].max()), 2),
            "low":        round(float(data['Low'].min()), 2),
            "change":     round(change, 2),
            "change_pct": round(change_pct, 2),
            "time":       str(data.index[-1]),
            "is_up":      change >= 0
        }
    except Exception as e:
        return {"error": str(e), "index": index_name}

def get_historical_data(index_name: str, period: str = "1y",
                         interval: str = "1d") -> pd.DataFrame:
    ticker_symbol = TICKERS.get(index_name, "^NSEI")
    try:
        ticker = yf.Ticker(ticker_symbol)
        data = ticker.history(period=period, interval=interval)
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = [col[0] for col in data.columns]
        data.columns = [c.capitalize() for c in data.columns]
        data.dropna(how='all', inplace=True)
        data.ffill(inplace=True)
        return data
    except Exception as e:
        print(f"Error fetching data for {index_name}: {e}")
        return pd.DataFrame()

def get_all_live_prices() -> dict:
    prices = {}
    for index_name in TICKERS.keys():
        prices[index_name] = get_live_price(index_name)
        time.sleep(0.5)
    return prices
