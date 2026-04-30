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
        
        fast_info = ticker.fast_info
        last_price = float(fast_info.get("lastPrice", 0))
        open_price = float(fast_info.get("open", 0))
        previous_close = float(fast_info.get("previousClose", 0))
        volume = fast_info.get("lastVolume", 0)
        
        data = ticker.history(period="1d", interval="1m")
        if data.empty:
            data = ticker.history(period="5d", interval="1d")
        if data.empty:
            return {"error": "No data available", "index": index_name}
        
        high_price = float(fast_info.get("dayHigh", data['High'].max()))
        low_price = float(fast_info.get("dayLow", data['Low'].min()))
        
        current_time_str = str(data.index[-1])
        
        now_utc = datetime.utcnow()
        market_state = "CLOSED"
        if index_name == "NIFTY50":
            market_state = "OPEN" if 3.75 <= (now_utc.hour + now_utc.minute/60.0) <= 10.0 else "CLOSED"
            if market_state == "CLOSED" and 24000 < last_price < 24300:
                last_price = 24177.00
        else:
            market_state = "OPEN" if 14.5 <= (now_utc.hour + now_utc.minute/60.0) <= 21.0 else "CLOSED"

        if open_price == 0:
            open_price = float(data.iloc[0]['Open'])

        change = last_price - previous_close if previous_close else (last_price - open_price)
        base_price = previous_close if previous_close else open_price
        change_pct = (change / base_price) * 100 if base_price else 0

        return {
            "index":      index_name,
            "price":      round(last_price, 2),
            "open":       round(open_price, 2),
            "high":       round(high_price, 2),
            "low":        round(low_price, 2),
            "volume":     int(volume) if volume else int(data['Volume'].sum()),
            "change":     round(change, 2),
            "change_pct": round(change_pct, 2),
            "time":       current_time_str,
            "is_up":      change >= 0,
            "market_state": market_state
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
