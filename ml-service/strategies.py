from __future__ import annotations

import numpy as np
import pandas as pd

from config import RISK_FREE_RATE


def strategy_sma_crossover(df: pd.DataFrame) -> pd.Series:
    """SMA Crossover (50/200): Buy golden cross, exit death cross. [TREND - BULL]"""
    sig = (df["sma_50"] > df["sma_200"]).astype(int).shift(1).fillna(0)
    return (sig * df["daily_return"]).rename("SMA_Crossover")


def strategy_ema_crossover(df: pd.DataFrame) -> pd.Series:
    """EMA Crossover (20/50): Faster reaction to trend. [TREND - BULL]"""
    sig = (df["ema_20"] > df["ema_50"]).astype(int).shift(1).fillna(0)
    return (sig * df["daily_return"]).rename("EMA_Crossover")


def strategy_rsi_mean_reversion(
    df: pd.DataFrame, oversold: float = 30, overbought: float = 70
) -> pd.Series:
    """RSI Mean Reversion: Buy oversold, sell overbought. [MEAN-REV - SIDEWAYS]"""
    pos = pd.Series(0.0, index=df.index)
    pos[df["rsi_14"] < oversold] = 1
    pos[df["rsi_14"] > overbought] = -1
    return (pos.shift(1).fillna(0) * df["daily_return"]).rename("RSI_Mean_Rev")


def strategy_macd_trend(df: pd.DataFrame) -> pd.Series:
    """MACD Trend: Long when MACD > signal. [TREND - BULL]"""
    sig = (df["macd"] > df["macd_signal"]).astype(int).shift(1).fillna(0)
    return (sig * df["daily_return"]).rename("MACD_Trend")


def strategy_breakout(df: pd.DataFrame, window: int = 50) -> pd.Series:
    """Price Breakout: Long when close > rolling 50-day high. [TREND - BULL]"""
    roll_max = df["Close"].rolling(window).max().shift(1).bfill()
    sig = (df["Close"] > roll_max).astype(int).shift(1).fillna(0)
    return (sig * df["daily_return"]).rename("Breakout")


def strategy_volatility_breakout(df: pd.DataFrame) -> pd.Series:
    """Vol Breakout: Enter when vol ratio spikes. [MIXED]"""
    thresh = (df["vol_ratio"].rolling(60).mean() + 0.5 * df["vol_ratio"].rolling(60).std()).bfill()
    sig = (df["vol_ratio"] > thresh).astype(int).shift(1).fillna(0)
    return (sig * df["daily_return"]).rename("Vol_Breakout")


def strategy_bollinger_bands(df: pd.DataFrame) -> pd.Series:
    """Bollinger Bands: Long near lower band. [MEAN-REV - SIDEWAYS]"""
    pos = pd.Series(0.0, index=df.index)
    pos[df["bb_pct"] < 0.2] = 1
    pos[df["bb_pct"] > 0.8] = 0
    sig = pos.ffill().shift(1).fillna(0)
    return (sig * df["daily_return"]).rename("Bollinger_Bands")


def strategy_momentum(df: pd.DataFrame, window: int = 20) -> pd.Series:
    """Momentum: Long when 20-day return is positive. [TREND - BULL]"""
    sig = (df["Close"].pct_change(window) > 0).astype(int).shift(1).fillna(0)
    return (sig * df["daily_return"]).rename("Momentum")


def strategy_defensive_cash(df: pd.DataFrame) -> pd.Series:
    """Defensive Cash: Long only above SMA200, else 50% cash. [DEFENSIVE - BEAR]"""
    sig = np.where(df["Close"] > df["sma_200"], 1.0, 0.5)
    sig = pd.Series(sig, index=df.index).shift(1).fillna(0.5)
    return (sig * df["daily_return"]).rename("Defensive_Cash")


def strategy_risk_parity(df: pd.DataFrame) -> pd.Series:
    """Risk Parity: Weight inversely to volatility. [DEFENSIVE - BEAR]"""
    weight = 1 / (df["vol_20"] + 1e-9)
    weight = (weight / weight.rolling(60).max().bfill()).clip(0.2, 1.0)
    sig = weight.shift(1).fillna(0.5)
    return (sig * df["daily_return"]).rename("Risk_Parity")


def strategy_dual_momentum(df: pd.DataFrame, lookback: int = 252) -> pd.Series:
    close = df["Close"]
    ret_12m = close.pct_change(lookback).fillna(0)
    abs_signal = (ret_12m > RISK_FREE_RATE).astype(int)
    trend_ok = (close > df["sma_200"]).astype(int)
    combined = ((abs_signal == 1) & (trend_ok == 1)).astype(int)
    signal = combined.rolling(21).max().fillna(0).shift(1).fillna(0)
    return (signal * df["daily_return"]).rename("Dual_Momentum")


def strategy_mtm(df: pd.DataFrame) -> pd.Series:
    close = df["Close"]
    r1m = close.pct_change(21).fillna(0)
    r3m = close.pct_change(63).fillna(0)
    r6m = close.pct_change(126).fillna(0)
    r12m = close.pct_change(252).fillna(0)
    composite = 0.20 * r1m + 0.30 * r3m + 0.30 * r6m + 0.20 * r12m
    norm = composite / (composite.rolling(60).std().bfill() + 1e-9)
    norm = norm.clip(-2, 2)
    position = norm.apply(lambda x: max(0.0, min(1.0, x / 2.0)))
    signal = position.shift(1).fillna(0)
    return (signal * df["daily_return"]).rename("MTM")


def strategy_zscore_mean_reversion(
    df: pd.DataFrame, entry: float = -2.0, exit_z: float = 0.0
) -> pd.Series:
    zscore = df["price_zscore_20"]
    z_vals = zscore.values
    pos_vals = np.zeros(len(df))
    in_trade = False
    for i in range(1, len(z_vals)):
        if not in_trade and z_vals[i] < entry:
            in_trade = True
        elif in_trade and z_vals[i] >= exit_z:
            in_trade = False
        pos_vals[i] = 1.0 if in_trade else 0.0
    signal = pd.Series(pos_vals, index=df.index).shift(1).fillna(0)
    return (signal * df["daily_return"]).rename("ZScore_MeanRev")


def strategy_vatr(df: pd.DataFrame) -> pd.Series:
    close = df["Close"]
    trend_ok = (df["ema_20"] > df["ema_50"]).astype(float)
    atr_pct = df["atr_14"] / (close + 1e-9)
    target_risk = 0.01
    raw_size = target_risk / (atr_pct + 1e-9)
    position = (trend_ok * raw_size).clip(0.1, 1.0)
    signal = position.shift(1).fillna(0)
    return (signal * df["daily_return"]).rename("VATR")


def run_all_strategies(df: pd.DataFrame) -> pd.DataFrame:
    r = pd.DataFrame(index=df.index)
    r["Buy_Hold"] = df["daily_return"]
    r["SMA_Crossover"] = strategy_sma_crossover(df)
    r["EMA_Crossover"] = strategy_ema_crossover(df)
    r["RSI_Mean_Rev"] = strategy_rsi_mean_reversion(df)
    r["MACD_Trend"] = strategy_macd_trend(df)
    r["Breakout"] = strategy_breakout(df)
    r["Vol_Breakout"] = strategy_volatility_breakout(df)
    r["Bollinger_Bands"] = strategy_bollinger_bands(df)
    r["Momentum"] = strategy_momentum(df)
    r["Defensive_Cash"] = strategy_defensive_cash(df)
    r["Risk_Parity"] = strategy_risk_parity(df)
    r["Dual_Momentum"] = strategy_dual_momentum(df)
    r["MTM"] = strategy_mtm(df)
    r["ZScore_MeanRev"] = strategy_zscore_mean_reversion(df)
    r["VATR"] = strategy_vatr(df)
    return r.fillna(0)

