from __future__ import annotations

from typing import Any, Dict, List

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler

from config import RANDOM_SEED


ML_FEATURES = [
    "rsi_14",
    "macd_diff",
    "bb_pct",
    "vol_ratio",
    "trend_strength",
    "rolling_skew_20",
    "rolling_kurt_20",
    "sma_cross_50_200",
    "ema_cross_20_50",
    "stoch_k",
    "stoch_d",
    "roc_10",
    "roc_20",
    "rolling_mdd_20",
    "rolling_beta_60",
    "above_sma200",
    "ret_1m",
    "ret_3m",
    "ret_6m",
    "ret_12m",
    "price_zscore_20",
    "price_zscore_60",
    "vol_10",
    "vol_20",
    "vol_cluster",
    "vol_ratio_20",
    "bb_width",
    "high_low_ratio",
    "close_range_pct",
]


def train_ml_model(df_feat: pd.DataFrame, label: str = "Asset") -> Dict[str, Any]:
    feats: List[str] = [f for f in ML_FEATURES if f in df_feat.columns]

    y = (df_feat["daily_return"].shift(-1) > 0).astype(int)
    X = df_feat[feats].replace([np.inf, -np.inf], 0).fillna(0)
    X, y = X.iloc[:-1], y.iloc[:-1]

    n_train = int(len(X) * 0.8)
    X_train = X.iloc[:n_train]
    X_test = X.iloc[n_train:]
    y_train = y.iloc[:n_train]
    y_test = y.iloc[n_train:]

    scaler = StandardScaler()
    Xtr_sc = scaler.fit_transform(X_train)
    Xte_sc = scaler.transform(X_test)

    lr = LogisticRegression(C=0.1, max_iter=1000, random_state=RANDOM_SEED)
    rf = RandomForestClassifier(
        n_estimators=100, max_depth=5, random_state=RANDOM_SEED, n_jobs=-1
    )
    gb = GradientBoostingClassifier(
        n_estimators=100, max_depth=3, learning_rate=0.05, random_state=RANDOM_SEED
    )
    lr.fit(Xtr_sc, y_train)
    rf.fit(Xtr_sc, y_train)
    gb.fit(Xtr_sc, y_train)

    p_ens = (
        lr.predict_proba(Xte_sc)[:, 1]
        + rf.predict_proba(Xte_sc)[:, 1]
        + gb.predict_proba(Xte_sc)[:, 1]
    ) / 3.0
    acc = accuracy_score(y_test, (p_ens > 0.5).astype(int))

    X_all_sc = scaler.transform(X)
    p_all = (
        lr.predict_proba(X_all_sc)[:, 1]
        + rf.predict_proba(X_all_sc)[:, 1]
        + gb.predict_proba(X_all_sc)[:, 1]
    ) / 3.0
    prob_series = pd.Series(p_all, index=X.index, name="ml_prob")

    importance = pd.Series(rf.feature_importances_, index=feats).sort_values(ascending=False)

    return {
        "prob_series": prob_series,
        "scaler": scaler,
        "features": feats,
        "test_accuracy": float(acc),
        "n_train": int(n_train),
        "lr": lr,
        "rf": rf,
        "gb": gb,
        "rf_importance": importance,
    }


def build_ml_strategy(strat_returns: pd.DataFrame, ml_result: Dict[str, Any], label: str = "Asset") -> pd.Series:
    prob = ml_result["prob_series"].reindex(strat_returns.index).ffill().fillna(0.5)
    position = ((prob - 0.45) / 0.10).clip(0, 1).shift(1).fillna(0)
    ret = (position * strat_returns["Buy_Hold"]).rename("ML_Signal")
    return ret


def build_combined_v3(strat_returns: pd.DataFrame, ml_result: Dict[str, Any], label: str = "Asset") -> pd.Series:
    prob = ml_result["prob_series"].reindex(strat_returns.index).ffill().fillna(0.5)
    ml_pred = (prob.shift(1) > 0.5).astype(int)
    actual_up = (strat_returns["Buy_Hold"] > 0).astype(int)
    roll_acc = (ml_pred == actual_up).astype(float).rolling(30).mean().bfill()

    alpha = ((roll_acc - 0.50) * 3.5).clip(0.0, 0.7)

    position = ((prob - 0.45) / 0.10).clip(0, 1).shift(1).fillna(0)
    ml_ret = position * strat_returns["Buy_Hold"]

    regime_ret = strat_returns.get(
        "Regime_Aware_v3", strat_returns.get("Defensive_Cash", strat_returns["Buy_Hold"])
    )

    combined = alpha * ml_ret + (1 - alpha) * regime_ret
    return combined.rename("Combined_v3")

