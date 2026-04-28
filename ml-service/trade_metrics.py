from database import trades_collection
import numpy as np
from datetime import datetime

def calculate_metrics(user_id: str = "default") -> dict:
    all_trades = list(trades_collection.find({"user_id": user_id}))
    closed = [t for t in all_trades if t['status'] == 'CLOSED']
    open_t = [t for t in all_trades if t['status'] == 'OPEN']

    if not closed:
        return {
            "total_trades":      0,
            "open_trades":       len(open_t),
            "closed_trades":     0,
            "win_rate":          0,
            "total_pnl":         0,
            "avg_pnl_per_trade": 0,
            "best_trade":        0,
            "worst_trade":       0,
            "profit_factor":     0,
            "by_strategy":       {},
            "by_regime":         {},
            "by_index":          {}
        }

    pnls       = [t.get('net_pnl', 0) for t in closed]
    wins       = [p for p in pnls if p > 0]
    losses     = [p for p in pnls if p <= 0]
    win_rate   = (len(wins) / len(pnls) * 100) if pnls else 0
    total_pnl  = sum(pnls)
    gross_wins = sum(wins) if wins else 0
    gross_loss = abs(sum(losses)) if losses else 1
    pf         = round(gross_wins / gross_loss, 2) if gross_loss > 0 else 0

    def group_by(key):
        groups = {}
        for t in closed:
            k = t.get(key, 'Unknown')
            if k not in groups:
                groups[k] = {"trades": 0, "wins": 0,
                              "total_pnl": 0, "win_rate": 0}
            groups[k]['trades'] += 1
            p = t.get('net_pnl', 0)
            groups[k]['total_pnl'] += p
            if p > 0:
                groups[k]['wins'] += 1
        for k in groups:
            n = groups[k]['trades']
            w = groups[k]['wins']
            groups[k]['win_rate'] = round(w/n*100, 1) if n > 0 else 0
            groups[k]['total_pnl'] = round(groups[k]['total_pnl'], 2)
        return groups

    return {
        "total_trades":      len(all_trades),
        "open_trades":       len(open_t),
        "closed_trades":     len(closed),
        "win_rate":          round(win_rate, 1),
        "total_pnl":         round(total_pnl, 2),
        "avg_pnl_per_trade": round(total_pnl/len(closed), 2),
        "best_trade":        round(max(pnls), 2) if pnls else 0,
        "worst_trade":       round(min(pnls), 2) if pnls else 0,
        "profit_factor":     pf,
        "by_strategy":       group_by('strategy'),
        "by_regime":         group_by('regime'),
        "by_index":          group_by('index_name')
    }
