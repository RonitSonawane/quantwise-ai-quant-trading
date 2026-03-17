from __future__ import annotations

from collections import Counter
from typing import Any, Dict, Tuple

import numpy as np
import pandas as pd
from hmmlearn.hmm import GaussianHMM

from config import RANDOM_SEED


REGIME_COLORS = {
    "Strong Bull": "#1a7a1a",
    "Weak Bull": "#6dbf6d",
    "Strong Sideways": "#e6a817",
    "Weak Sideways": "#f0d080",
    "Weak Bear": "#e07050",
    "Strong Bear": "#c0392b",
}

ALL_6_LABELS = list(REGIME_COLORS.keys())

BULL_REGIMES = ["Strong Bull", "Weak Bull"]
SIDEWAYS_REGIMES = ["Strong Sideways", "Weak Sideways"]
BEAR_REGIMES = ["Weak Bear", "Strong Bear"]

HIGH_ALPHA_POOL = [
    "EMA_Crossover",
    "Momentum",
    "Defensive_Cash",
    "Risk_Parity",
    "Dual_Momentum",
    "MTM",
    "ZScore_MeanRev",
    "VATR",
]


def classify_6state(stats: Dict[str, float], ret_hi: float, ret_lo: float, vol_hi: float, vol_med: float) -> str:
    r = stats["mean_return"]
    v = stats["mean_vol"]

    if r > ret_hi:
        return "Strong Bull" if v < vol_med else "Weak Bull"
    if r < ret_lo:
        return "Strong Bear" if v > vol_hi else "Weak Bear"
    return "Strong Sideways" if v < vol_med else "Weak Sideways"


def smooth_regimes(regime_series: pd.Series, min_days: int = 10) -> pd.Series:
    regimes = regime_series.copy()
    values = regimes.values.tolist()
    n = len(values)
    i = 0
    while i < n:
        j = i
        while j < n and values[j] == values[i]:
            j += 1
        streak_len = j - i
        if streak_len < min_days:
            replacement = values[i - 1] if i > 0 else (values[j] if j < n else values[i])
            for k in range(i, j):
                values[k] = replacement
        i = j
    return pd.Series(values, index=regimes.index, name=regimes.name)


def train_hmm_6state(
    df_feat: pd.DataFrame, label: str = "Asset"
) -> Tuple[GaussianHMM, np.ndarray, Dict[int, str], pd.Series]:
    HMM_FEATURES = [
        "log_return",
        "vol_10",
        "vol_20",
        "rsi_14",
        "macd_diff",
        "bb_pct",
        "vol_ratio",
        "trend_strength",
    ]
    HMM_FEATURES = [f for f in HMM_FEATURES if f in df_feat.columns]
    X = df_feat[HMM_FEATURES].values

    model = GaussianHMM(
        n_components=6,
        covariance_type="diag",
        n_iter=2000,
        random_state=RANDOM_SEED,
        tol=1e-5,
        verbose=False,
    )
    model.fit(X)
    hidden_states = model.predict(X)

    regime_stats: Dict[int, Dict[str, Any]] = {}
    for s in range(6):
        mask = hidden_states == s
        sdata = df_feat.loc[df_feat.index[mask]]
        ret = sdata["daily_return"]
        regime_stats[s] = {
            "mean_return": float(ret.mean()),
            "mean_vol": float(sdata["vol_20"].mean()),
            "sharpe": float(ret.mean() / (ret.std() + 1e-9) * np.sqrt(252)),
            "days": int(mask.sum()),
        }

    all_rets = [s["mean_return"] for s in regime_stats.values()]
    all_vols = [s["mean_vol"] for s in regime_stats.values()]

    ret_hi = np.percentile(all_rets, 67)
    ret_lo = np.percentile(all_rets, 33)
    vol_hi = np.percentile(all_vols, 75)
    vol_med = np.percentile(all_vols, 50)

    regime_map = {s: classify_6state(regime_stats[s], ret_hi, ret_lo, vol_hi, vol_med) for s in range(6)}

    label_counts = Counter(regime_map.values())
    missing = [l for l in ALL_6_LABELS if l not in regime_map.values()]
    for lbl, cnt in label_counts.items():
        if cnt > 1 and missing:
            dup_states = sorted(
                [s for s, l in regime_map.items() if l == lbl],
                key=lambda s: regime_stats[s]["mean_return"],
            )
            regime_map[dup_states[len(dup_states) // 2]] = missing.pop(0)

    raw_regime = pd.Series([regime_map[s] for s in hidden_states], index=df_feat.index, name="regime")
    smoothed_regime = smooth_regimes(raw_regime, min_days=10)
    return model, hidden_states, regime_map, smoothed_regime


def find_best_strategy_per_regime(
    df_feat: pd.DataFrame,
    strat_returns: pd.DataFrame,
    strategy_pool: list[str],
    label: str = "Asset",
) -> tuple[dict[str, str], dict[str, dict[str, Any]]]:
    best_map: dict[str, str] = {}
    detail: dict[str, dict[str, Any]] = {}

    for regime in ALL_6_LABELS:
        mask = df_feat["regime"] == regime
        if not mask.any():
            best_map[regime] = "Defensive_Cash"
            continue

        regime_dates = df_feat.index[mask]
        regime_dates = regime_dates[regime_dates.isin(strat_returns.index)]

        if len(regime_dates) < 20:
            best_map[regime] = "Defensive_Cash"
            continue

        best_sharpe = -np.inf
        best_strategy = "Defensive_Cash"
        best_ann_ret = 0.0

        for strat in strategy_pool:
            if strat not in strat_returns.columns:
                continue
            r = strat_returns.loc[regime_dates, strat]
            if len(r) < 10:
                continue
            sharpe = r.mean() / (r.std() + 1e-9) * np.sqrt(252)
            ann_ret = ((1 + r.mean()) ** 252 - 1) * 100
            if sharpe > best_sharpe:
                best_sharpe = sharpe
                best_strategy = strat
                best_ann_ret = ann_ret

        best_map[regime] = best_strategy
        detail[regime] = {
            "strategy": best_strategy,
            "sharpe": float(best_sharpe),
            "ann_ret": float(best_ann_ret),
            "days": int(mask.sum()),
        }

    return best_map, detail


def compute_regime_aware_v3(
    df_feat: pd.DataFrame,
    strat_returns: pd.DataFrame,
    hmm_model: GaussianHMM,
    best_map: dict[str, str],
    label: str = "Asset",
) -> pd.Series:
    HMM_FEATURES = [
        "log_return",
        "vol_10",
        "vol_20",
        "rsi_14",
        "macd_diff",
        "bb_pct",
        "vol_ratio",
        "trend_strength",
    ]
    HMM_FEATURES = [f for f in HMM_FEATURES if f in df_feat.columns]
    X = df_feat[HMM_FEATURES].values

    state_probas = hmm_model.predict_proba(X)
    raw_states = hmm_model.predict(X)

    state_regime: dict[int, str] = {}
    for s in range(6):
        mask = raw_states == s
        if mask.any():
            lbl_series = df_feat.loc[df_feat.index[mask], "regime"]
            state_regime[s] = str(lbl_series.mode()[0])
        else:
            state_regime[s] = "Weak Sideways"

    result = pd.Series(0.0, index=df_feat.index)
    for i, date in enumerate(df_feat.index):
        if date not in strat_returns.index:
            continue
        day_return = 0.0
        probs = state_probas[i]
        for s in range(6):
            regime = state_regime[s]
            best_strat = best_map.get(regime, "Defensive_Cash")
            if best_strat not in strat_returns.columns:
                best_strat = "Defensive_Cash"
            day_return += probs[s] * float(strat_returns.loc[date, best_strat])
        result[date] = day_return

    return result.rename("Regime_Aware_v3")

