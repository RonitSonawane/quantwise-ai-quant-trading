# data download + 59 features engineering & 21 special features created plus the data cleaninga dn forward-filling and back-filling
from __future__ import annotations

import os
from typing import Optional

import numpy as np
import pandas as pd
import yfinance as yf
from ta.momentum import ROCIndicator, RSIIndicator, StochasticOscillator
from ta.trend import EMAIndicator, MACD, SMAIndicator
from ta.volatility import AverageTrueRange, BollingerBands


def download_data(ticker: str, start: str, end: str, name: str) -> pd.DataFrame:
    """Download OHLCV, flatten MultiIndex, forward-fill gaps."""
    df = yf.download(ticker, start=start, end=end, auto_adjust=True, progress=False)

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [col[0] for col in df.columns]
    df.columns = [c.capitalize() for c in df.columns]

    df.dropna(how="all", inplace=True)
    df.ffill(inplace=True)
    return df


def smart_fill(series: pd.Series, method: str = "ffill", neutral: float = 0.0) -> pd.Series:
    """Fill NaN using specified method then backfill any remaining leading NaN."""
    if method == "ffill":
        return series.ffill().bfill()
    if method == "neutral":
        return series.fillna(neutral).ffill().bfill()
    if method == "expanding":
        return series.fillna(series.expanding().mean()).ffill().bfill()
    return series.ffill().bfill()


def engineer_features(
    df_price: pd.DataFrame,
    df_benchmark: Optional[pd.DataFrame] = None,
    label: str = "Asset",
) -> pd.DataFrame:
    """
    Build 50+ features with smart NaN filling.
    No dropna() — recovers all available rows.
    """
    df = df_price.copy()
    close = df["Close"]
    high = df["High"]
    low = df["Low"]
    vol = df["Volume"]

    df["daily_return"] = close.pct_change().fillna(0)
    df["log_return"] = np.log(close / close.shift(1)).fillna(0)
    df["vol_10"] = smart_fill(df["daily_return"].rolling(10).std() * np.sqrt(252), "expanding")
    df["vol_20"] = smart_fill(df["daily_return"].rolling(20).std() * np.sqrt(252), "expanding")
    df["vol_50"] = smart_fill(df["daily_return"].rolling(50).std() * np.sqrt(252), "expanding")
    df["rolling_skew_20"] = smart_fill(df["daily_return"].rolling(20).skew(), "neutral", 0.0)
    df["rolling_kurt_20"] = smart_fill(df["daily_return"].rolling(20).kurt(), "neutral", 0.0)

    for w in [10, 20, 50, 100, 200]:
        sma = smart_fill(SMAIndicator(close, window=w).sma_indicator(), "ffill")
        df[f"sma_{w}"] = sma
        df[f"price_sma_{w}_ratio"] = (close / sma).replace([np.inf, -np.inf], 1.0).fillna(1.0)

    for w in [20, 50]:
        df[f"ema_{w}"] = smart_fill(EMAIndicator(close, window=w).ema_indicator(), "ffill")

    df["sma_cross_10_50"] = np.where(df["sma_10"] > df["sma_50"], 1, -1)
    df["sma_cross_50_200"] = np.where(df["sma_50"] > df["sma_200"], 1, -1)
    df["ema_cross_20_50"] = np.where(df["ema_20"] > df["ema_50"], 1, -1)

    df["rsi_14"] = smart_fill(RSIIndicator(close, window=14).rsi(), "neutral", 50.0)

    macd_obj = MACD(close)
    df["macd"] = smart_fill(macd_obj.macd(), "neutral", 0.0)
    df["macd_signal"] = smart_fill(macd_obj.macd_signal(), "neutral", 0.0)
    df["macd_diff"] = smart_fill(macd_obj.macd_diff(), "neutral", 0.0)

    stoch = StochasticOscillator(high, low, close)
    df["stoch_k"] = smart_fill(stoch.stoch(), "neutral", 50.0)
    df["stoch_d"] = smart_fill(stoch.stoch_signal(), "neutral", 50.0)

    df["roc_10"] = smart_fill(ROCIndicator(close, window=10).roc(), "neutral", 0.0)
    df["roc_20"] = smart_fill(ROCIndicator(close, window=20).roc(), "neutral", 0.0)
    df["momentum_10"] = (close - close.shift(10)).fillna(0)
    df["momentum_20"] = (close - close.shift(20)).fillna(0)

    df["atr_14"] = smart_fill(
        AverageTrueRange(high, low, close, window=14).average_true_range(), "expanding"
    )

    def rolling_max_dd(returns: pd.Series, window: int = 20) -> pd.Series:
        cum = (1 + returns).cumprod()
        roll_max = cum.rolling(window).max()
        dd = (cum - roll_max) / (roll_max + 1e-9)
        return dd.rolling(window).min()

    df["rolling_mdd_20"] = smart_fill(rolling_max_dd(df["daily_return"]), "neutral", 0.0)

    if df_benchmark is not None:
        bench_ret = df_benchmark["Close"].pct_change().reindex(df.index).fillna(0)
        cov_s = df["daily_return"].rolling(60).cov(bench_ret)
        var_s = bench_ret.rolling(60).var()
        df["rolling_beta_60"] = smart_fill((cov_s / (var_s + 1e-9)), "neutral", 1.0)
    else:
        df["rolling_beta_60"] = 1.0

    bb = BollingerBands(close, window=20, window_dev=2)
    df["bb_upper"] = smart_fill(bb.bollinger_hband(), "ffill")
    df["bb_lower"] = smart_fill(bb.bollinger_lband(), "ffill")
    df["bb_middle"] = smart_fill(bb.bollinger_mavg(), "ffill")
    df["bb_pct"] = smart_fill(bb.bollinger_pband(), "neutral", 0.5)
    df["bb_width"] = smart_fill(
        (df["bb_upper"] - df["bb_lower"]) / (df["bb_middle"] + 1e-9), "expanding"
    )

    df["vol_ratio"] = (df["vol_10"] / (df["vol_50"] + 1e-9)).fillna(1.0)
    df["trend_strength"] = (df["price_sma_20_ratio"] - 1).abs().fillna(0)
    df["vol_cluster"] = (df["vol_10"] > df["vol_10"].rolling(50).mean().bfill()).astype(int)
    df["above_sma200"] = (close > df["sma_200"]).astype(int)

    df["vol_sma_20"] = smart_fill(vol.rolling(20).mean(), "expanding")
    df["vol_ratio_20"] = (vol / (df["vol_sma_20"] + 1e-9)).fillna(1.0)

    df["ret_1m"] = close.pct_change(21).fillna(0)
    df["ret_3m"] = close.pct_change(63).fillna(0)
    df["ret_6m"] = close.pct_change(126).fillna(0)
    df["ret_12m"] = close.pct_change(252).fillna(0)
    df["price_zscore_20"] = (
        (close - close.rolling(20).mean()) / (close.rolling(20).std() + 1e-9)
    ).fillna(0)
    df["price_zscore_60"] = (
        (close - close.rolling(60).mean()) / (close.rolling(60).std() + 1e-9)
    ).fillna(0)
    df["high_low_ratio"] = (high / (low + 1e-9)).fillna(1.0)
    df["close_range_pct"] = ((close - low) / (high - low + 1e-9)).fillna(0.5)

    df.ffill(inplace=True)
    df.bfill(inplace=True)
    df.fillna(0, inplace=True)

    return df


def export_features(df: pd.DataFrame, path: str) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    df.to_csv(path)

