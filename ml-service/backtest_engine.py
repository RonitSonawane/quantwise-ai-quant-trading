# backtest engine for all strategies and benchmarks simulator + metrics
from __future__ import annotations

from typing import Any, Dict, Optional

import numpy as np
import pandas as pd
import statsmodels.api as sm

from config import RISK_FREE_RATE


def simulate_investment(
    initial_capital: float, returns_series: pd.Series, risk_free: float = RISK_FREE_RATE
) -> Dict[str, Any]:
    ret = returns_series.dropna().replace([np.inf, -np.inf], 0)
    if len(ret) == 0:
        return {"error": "Empty returns series"}

    equity_curve = initial_capital * (1 + ret).cumprod()

    final_value = float(equity_curve.iloc[-1])
    total_ret = (final_value - initial_capital) / initial_capital
    n_years = len(ret) / 252
    cagr = (final_value / initial_capital) ** (1 / max(n_years, 0.001)) - 1

    rf_daily = (1 + risk_free) ** (1 / 252) - 1
    ann_vol = ret.std() * np.sqrt(252)
    excess_ret = ret - rf_daily
    sharpe = excess_ret.mean() / (ret.std() + 1e-9) * np.sqrt(252)

    downside_ret = ret[ret < rf_daily]
    downside_vol = downside_ret.std() * np.sqrt(252) if len(downside_ret) > 1 else 1e-9
    sortino = (cagr - risk_free) / (downside_vol + 1e-9)

    roll_max = equity_curve.cummax()
    drawdowns = (equity_curve - roll_max) / roll_max
    max_dd = float(drawdowns.min())
    calmar = cagr / (abs(max_dd) + 1e-9)

    win_rate = float((ret > 0).mean())
    gains = ret[ret > 0].sum()
    losses = abs(ret[ret < 0].sum())
    profit_factor = float(gains / (losses + 1e-9))

    return {
        "equity_curve": equity_curve,
        "initial_capital": round(float(initial_capital), 2),
        "final_value": round(final_value, 2),
        "profit_loss": round(final_value - float(initial_capital), 2),
        "total_return_pct": round(total_ret * 100, 2),
        "cagr_pct": round(cagr * 100, 2),
        "ann_volatility_pct": round(float(ann_vol) * 100, 2),
        "sharpe_ratio": round(float(sharpe), 3),
        "sortino_ratio": round(float(sortino), 3),
        "max_drawdown_pct": round(max_dd * 100, 2),
        "calmar_ratio": round(float(calmar), 3),
        "win_rate_pct": round(win_rate * 100, 2),
        "profit_factor": round(profit_factor, 3),
        "best_day_pct": round(float(ret.max()) * 100, 2),
        "worst_day_pct": round(float(ret.min()) * 100, 2),
        "start_date": str(ret.index[0].date()),
        "end_date": str(ret.index[-1].date()),
        "trading_days": int(len(ret)),
    }


def compute_metrics(
    returns: pd.Series, benchmark: Optional[pd.Series] = None, risk_free: float = RISK_FREE_RATE
) -> Dict[str, Any]:
    sim = simulate_investment(1.0, returns, risk_free)
    if "error" in sim:
        return {}

    alpha, beta = np.nan, np.nan
    if benchmark is not None:
        bench = benchmark.reindex(returns.index).fillna(0)
        ret = returns.reindex(bench.index).fillna(0)
        if len(ret) > 30:
            X = sm.add_constant(bench.values)
            ols = sm.OLS(ret.values, X).fit()
            alpha, beta = ols.params[0] * 252, ols.params[1]

    return {
        "Cumulative Return (%)": sim["total_return_pct"],
        "Ann. Return (%)": sim["cagr_pct"],
        "Ann. Volatility (%)": sim["ann_volatility_pct"],
        "Sharpe Ratio": sim["sharpe_ratio"],
        "Sortino Ratio": sim["sortino_ratio"],
        "Max Drawdown (%)": sim["max_drawdown_pct"],
        "Calmar Ratio": sim["calmar_ratio"],
        "Win Rate (%)": sim["win_rate_pct"],
        "Profit Factor": sim["profit_factor"],
        "Alpha (Ann.)": round(float(alpha), 4) if not np.isnan(alpha) else "N/A",
        "Beta": round(float(beta), 4) if not np.isnan(beta) else "N/A",
    }


def backtest_all(
    strat_returns: pd.DataFrame, label: str = "Asset", initial_capital: float = 100000
) -> pd.DataFrame:
    bench = strat_returns.get("Buy_Hold", None)
    rows = []
    for col in strat_returns.columns:
        m = compute_metrics(strat_returns[col], benchmark=bench)
        m["Strategy"] = col
        sim = simulate_investment(initial_capital, strat_returns[col])
        m[f"Final Value (₹{int(initial_capital)//1000}K start)"] = (
            f"₹{sim['final_value']:,.0f}" if "error" not in sim else "N/A"
        )
        rows.append(m)
    return pd.DataFrame(rows).set_index("Strategy")

