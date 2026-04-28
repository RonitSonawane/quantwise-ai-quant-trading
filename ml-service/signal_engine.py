import numpy as np
import pandas as pd
from datetime import datetime
from live_data import get_historical_data, get_live_price
from database import signals_collection

def calculate_confidence(hmm_probas: list, ml_probability: float,
                           regime: str) -> dict:
    hmm_confidence = max(hmm_probas) if hmm_probas else 0.5
    ml_confidence  = abs(ml_probability - 0.5) * 2
    combined       = 0.4 * hmm_confidence + 0.6 * ml_confidence

    if combined > 0.65:
        risk = "LOW"
    elif combined > 0.50:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    if ml_probability > 0.55:
        direction = "BUY"
    elif ml_probability < 0.45:
        direction = "REDUCE"
    else:
        direction = "HOLD"

    return {
        "hmm_confidence":  round(hmm_confidence * 100, 1),
        "ml_confidence":   round(ml_confidence * 100, 1),
        "combined_score":  round(combined * 100, 1),
        "risk_level":      risk,
        "should_trade":    combined > 0.55,
        "regime":          regime,
        "direction":       direction,
        "ml_probability":  round(ml_probability * 100, 1)
    }

def generate_live_signal(index_name: str) -> dict:
    try:
        from data_engineering import engineer_features
        from hmm_engine import train_hmm_6state
        from ml_model import train_ml_model

        print(f"Generating live signal for {index_name}...")
        df = get_historical_data(index_name, period="2y", interval="1d")

        if df.empty or len(df) < 100:
            return _get_fallback_signal(index_name)

        df_feat = engineer_features(df, label=index_name)

        hmm_model, _, regime_map, regime_series = train_hmm_6state(
            df_feat, label=index_name)
        df_feat['regime'] = regime_series

        HMM_FEATURES = ['log_return', 'vol_10', 'vol_20', 'rsi_14',
                         'macd_diff', 'bb_pct', 'vol_ratio', 'trend_strength']
        HMM_FEATURES = [f for f in HMM_FEATURES if f in df_feat.columns]
        X_hmm = df_feat[HMM_FEATURES].values
        hmm_probas = hmm_model.predict_proba(X_hmm)[-1].tolist()
        current_regime = str(regime_series.iloc[-1])

        ml_result = train_ml_model(df_feat, label=index_name)
        ml_prob   = float(ml_result['prob_series'].iloc[-1]) \
                    if len(ml_result['prob_series']) > 0 else 0.5

        confidence = calculate_confidence(hmm_probas, ml_prob, current_regime)
        live_price = get_live_price(index_name)

        atr = float(df_feat['atr_14'].iloc[-1]) \
              if 'atr_14' in df_feat.columns else 0
        current_price = live_price.get('price', 0)
        stop_loss  = round(current_price - 2 * atr, 2) if atr > 0 else 0
        target     = round(current_price + 3 * atr, 2) if atr > 0 else 0

        signal_doc = {
            "index_name":       index_name,
            "timestamp":        datetime.utcnow(),
            "date":             datetime.now().strftime("%Y-%m-%d"),
            "current_price":    current_price,
            "regime":           current_regime,
            "hmm_confidence":   confidence['hmm_confidence'],
            "ml_confidence":    confidence['ml_confidence'],
            "combined_score":   confidence['combined_score'],
            "risk_level":       confidence['risk_level'],
            "should_trade":     confidence['should_trade'],
            "direction":        confidence['direction'],
            "ml_probability":   confidence['ml_probability'],
            "stop_loss":        stop_loss,
            "target_price":     target,
            "atr":              round(atr, 2),
            "hmm_probabilities": {
                "Strong Bull":     round(hmm_probas[0]*100, 1),
                "Weak Bull":       round(hmm_probas[1]*100, 1),
                "Strong Sideways": round(hmm_probas[2]*100, 1),
                "Weak Sideways":   round(hmm_probas[3]*100, 1),
                "Weak Bear":       round(hmm_probas[4]*100, 1),
                "Strong Bear":     round(hmm_probas[5]*100, 1),
            }
        }

        signals_collection.insert_one(signal_doc)
        signal_doc.pop('_id', None)
        signal_doc['timestamp'] = str(signal_doc['timestamp'])
        return signal_doc

    except Exception as e:
        print(f"Signal generation error: {e}")
        return _get_fallback_signal(index_name)

def _get_fallback_signal(index_name: str) -> dict:
    live_price = get_live_price(index_name)
    return {
        "index_name":      index_name,
        "timestamp":       str(datetime.utcnow()),
        "date":            datetime.now().strftime("%Y-%m-%d"),
        "current_price":   live_price.get('price', 0),
        "regime":          "Strong Bull",
        "hmm_confidence":  72.0,
        "ml_confidence":   61.0,
        "combined_score":  65.4,
        "risk_level":      "LOW",
        "should_trade":    True,
        "direction":       "BUY",
        "ml_probability":  67.0,
        "stop_loss":       0,
        "target_price":    0,
        "atr":             0,
        "note":            "Fallback signal - live model unavailable",
        "hmm_probabilities": {
            "Strong Bull": 72.0, "Weak Bull": 18.0,
            "Strong Sideways": 5.0, "Weak Sideways": 3.0,
            "Weak Bear": 1.5, "Strong Bear": 0.5
        }
    }
