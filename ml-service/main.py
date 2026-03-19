# FastAPI server for QuantWise v3 ML Service & FastAPI with all 5 endpoints + health check

from __future__ import annotations

from typing import Any, Dict, Literal, Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from backtest_engine import backtest_all, simulate_investment
from config import DEFAULT_END_DATE, DEFAULT_START_DATE, INITIAL_CAPITAL
from data_engineering import download_data, engineer_features
from hmm_engine import (
    HIGH_ALPHA_POOL,
    compute_regime_aware_v3,
    find_best_strategy_per_regime,
    train_hmm_6state,
)
from ml_model import build_combined_v3, build_ml_strategy, train_ml_model
from strategies import run_all_strategies


AssetId = Literal["nifty", "sp500"]


class BacktestRequest(BaseModel):
    start_date: str = Field(default=DEFAULT_START_DATE)
    end_date: str = Field(default=DEFAULT_END_DATE)
    initial_capital: float = Field(default=float(INITIAL_CAPITAL), gt=0)
    refresh_data: bool = Field(default=False, description="Force re-download and retrain models.")


class SimulateRequest(BaseModel):
    asset: AssetId
    strategy: str = Field(description="Strategy column name (e.g. Buy_Hold, Combined_v3).")
    initial_capital: float = Field(default=float(INITIAL_CAPITAL), gt=0)
    limit_points: int = Field(default=800, ge=10, le=5000)


class QuantWiseState:
    def __init__(self) -> None:
        self.ready: bool = False
        self.meta: Dict[str, Any] = {}

        self.features: Dict[AssetId, pd.DataFrame] = {}
        self.strat_returns: Dict[AssetId, pd.DataFrame] = {}
        self.backtests: Dict[AssetId, pd.DataFrame] = {}

        self.hmm_models: Dict[AssetId, Any] = {}
        self.best_maps: Dict[AssetId, Dict[str, str]] = {}
        self.ml_models: Dict[AssetId, Dict[str, Any]] = {}

    def build(self, start_date: str, end_date: str, initial_capital: float) -> None:
        df_nifty = download_data("^NSEI", start_date, end_date, "NIFTY 50")
        df_sp500 = download_data("^GSPC", start_date, end_date, "S&P 500")

        df_nifty_feat = engineer_features(df_nifty, df_sp500, label="NIFTY 50")
        df_sp500_feat = engineer_features(df_sp500, df_nifty, label="S&P 500")

        hmm_nifty, states_nifty, regime_map_nifty, regime_series_nifty = train_hmm_6state(
            df_nifty_feat, "NIFTY 50"
        )
        df_nifty_feat["hmm_state"] = states_nifty
        df_nifty_feat["regime"] = regime_series_nifty

        hmm_sp500, states_sp500, regime_map_sp500, regime_series_sp500 = train_hmm_6state(
            df_sp500_feat, "S&P 500"
        )
        df_sp500_feat["hmm_state"] = states_sp500
        df_sp500_feat["regime"] = regime_series_sp500

        nifty_strat = run_all_strategies(df_nifty_feat)
        sp500_strat = run_all_strategies(df_sp500_feat)

        nifty_best_map, nifty_detail = find_best_strategy_per_regime(
            df_nifty_feat, nifty_strat, HIGH_ALPHA_POOL, "NIFTY 50"
        )
        sp500_best_map, sp500_detail = find_best_strategy_per_regime(
            df_sp500_feat, sp500_strat, HIGH_ALPHA_POOL, "S&P 500"
        )

        nifty_regime_v3 = compute_regime_aware_v3(
            df_nifty_feat, nifty_strat, hmm_nifty, nifty_best_map, "NIFTY 50"
        )
        sp500_regime_v3 = compute_regime_aware_v3(
            df_sp500_feat, sp500_strat, hmm_sp500, sp500_best_map, "S&P 500"
        )
        nifty_strat["Regime_Aware_v3"] = nifty_regime_v3
        sp500_strat["Regime_Aware_v3"] = sp500_regime_v3

        nifty_ml = train_ml_model(df_nifty_feat, "NIFTY 50")
        sp500_ml = train_ml_model(df_sp500_feat, "S&P 500")

        nifty_strat["ML_Signal"] = build_ml_strategy(nifty_strat, nifty_ml, "NIFTY 50")
        sp500_strat["ML_Signal"] = build_ml_strategy(sp500_strat, sp500_ml, "S&P 500")

        nifty_strat["Combined_v3"] = build_combined_v3(nifty_strat, nifty_ml, "NIFTY 50")
        sp500_strat["Combined_v3"] = build_combined_v3(sp500_strat, sp500_ml, "S&P 500")

        self.features = {"nifty": df_nifty_feat, "sp500": df_sp500_feat}
        self.strat_returns = {"nifty": nifty_strat, "sp500": sp500_strat}
        self.hmm_models = {"nifty": hmm_nifty, "sp500": hmm_sp500}
        self.best_maps = {"nifty": nifty_best_map, "sp500": sp500_best_map}
        self.ml_models = {"nifty": nifty_ml, "sp500": sp500_ml}

        self.backtests = {
            "nifty": backtest_all(nifty_strat, "NIFTY 50", initial_capital),
            "sp500": backtest_all(sp500_strat, "S&P 500", initial_capital),
        }

        self.meta = {
            "start_date": start_date,
            "end_date": end_date,
            "initial_capital": initial_capital,
            "nifty_best_map": nifty_detail,
            "sp500_best_map": sp500_detail,
            "nifty_ml_test_accuracy": float(nifty_ml["test_accuracy"]),
            "sp500_ml_test_accuracy": float(sp500_ml["test_accuracy"]),
        }
        self.ready = True


app = FastAPI(title="QuantWise v3 ML Service", version="3.0.0")
STATE = QuantWiseState()


@app.get("/")
def read_root() -> Dict[str, Any]:
    """Simple root endpoint to avoid 404 on '/'. Shows basic service info."""
    return {
        "service": "QuantWise v3 ML Service",
        "version": "3.0.0",
        "docs_url": "/docs",
        "endpoints": ["/backtest", "/regime", "/strategies", "/simulate", "/health"],
    }


@app.on_event("startup")
def _startup() -> None:
    if not STATE.ready:
        STATE.build(DEFAULT_START_DATE, DEFAULT_END_DATE, float(INITIAL_CAPITAL))


@app.post("/backtest")
def post_backtest(req: BacktestRequest) -> Dict[str, Any]:
    if (not STATE.ready) or req.refresh_data:
        STATE.build(req.start_date, req.end_date, req.initial_capital)

    return {
        "meta": STATE.meta,
        "backtests": {
            "nifty": STATE.backtests["nifty"].reset_index().to_dict(orient="records"),
            "sp500": STATE.backtests["sp500"].reset_index().to_dict(orient="records"),
        },
        "strategies": {
            "nifty": list(STATE.strat_returns["nifty"].columns),
            "sp500": list(STATE.strat_returns["sp500"].columns),
        },
    }


@app.get("/regime")
def get_regime(asset: Optional[AssetId] = None) -> Dict[str, Any]:
    if not STATE.ready:
        raise HTTPException(status_code=503, detail="Service not ready")

    def last_reg(a: AssetId) -> Dict[str, Any]:
        df = STATE.features[a]
        return {
            "asset": a,
            "asof": str(df.index[-1].date()),
            "regime": str(df["regime"].iloc[-1]),
            "hmm_state": int(df["hmm_state"].iloc[-1]),
        }

    if asset:
        return last_reg(asset)
    return {"nifty": last_reg("nifty"), "sp500": last_reg("sp500")}


@app.get("/strategies")
def get_strategies(
    asset: AssetId,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit_points: int = 800,
) -> Dict[str, Any]:
    if not STATE.ready:
        raise HTTPException(status_code=503, detail="Service not ready")

    df = STATE.strat_returns[asset].copy()
    if start_date:
        df = df.loc[df.index >= pd.to_datetime(start_date)]
    if end_date:
        df = df.loc[df.index <= pd.to_datetime(end_date)]
    if len(df) > limit_points:
        df = df.iloc[-limit_points:]

    return {
        "asset": asset,
        "start_date": str(df.index[0].date()) if len(df) else None,
        "end_date": str(df.index[-1].date()) if len(df) else None,
        "strategies": list(df.columns),
        "data": [
            {"date": idx.date().isoformat(), **{c: float(df.loc[idx, c]) for c in df.columns}}
            for idx in df.index
        ],
    }


@app.post("/simulate")
def post_simulate(req: SimulateRequest) -> Dict[str, Any]:
    if not STATE.ready:
        raise HTTPException(status_code=503, detail="Service not ready")

    df = STATE.strat_returns[req.asset]
    if req.strategy not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown strategy '{req.strategy}'. Available: {list(df.columns)}",
        )

    series = df[req.strategy]
    result = simulate_investment(req.initial_capital, series)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    eq: pd.Series = result["equity_curve"]
    if len(eq) > req.limit_points:
        eq = eq.iloc[-req.limit_points:]

    result_out = dict(result)
    result_out["equity_curve"] = [{"date": i.date().isoformat(), "value": float(v)} for i, v in eq.items()]
    return {"asset": req.asset, "strategy": req.strategy, "result": result_out}


@app.get("/health")
def get_health() -> Dict[str, Any]:
    return {"ready": STATE.ready}

