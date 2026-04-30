import uuid
from datetime import datetime
from typing import Optional
from database import trades_collection, positions_collection
from live_data import get_live_price

def calculate_pnl(entry_price: float, current_price: float,
                   units: float, capital: float, position_type: str = "LONG") -> dict:
    if position_type == "LONG":
        raw_pnl = (current_price - entry_price) * units
    else:
        raw_pnl = (entry_price - current_price) * units
        
    brokerage  = 40
    stt        = entry_price * units * 0.001
    total_cost = brokerage + stt
    net_pnl    = raw_pnl - total_cost
    
    pnl_pct    = (net_pnl / capital) * 100 if capital > 0 else 0
    
    return {
        "gross_pnl":    round(raw_pnl, 2),
        "costs":        round(total_cost, 2),
        "net_pnl":      round(net_pnl, 2),
        "pnl_pct":      round(pnl_pct, 2),
        "current_value":round(capital + net_pnl, 2),
        "is_profit":    net_pnl > 0
    }

def open_trade(index_name: str, strategy: str, trade_type: str,
               capital: float, signal_data: dict,
               user_id: str = "default", position_type: str = "LONG") -> dict:
    live = get_live_price(index_name)
    entry_price = live.get('price', 0)
    if entry_price == 0:
        return {"error": "Could not get live price"}

    units = round(capital / entry_price, 4)
    trade_id = str(uuid.uuid4())[:8].upper()

    trade = {
        "trade_id":      trade_id,
        "user_id":       user_id,
        "index_name":    index_name,
        "strategy":      strategy,
        "trade_type":    trade_type,
        "position_type": position_type,
        "entry_price":   entry_price,
        "entry_time":    datetime.utcnow(),
        "exit_price":    None,
        "exit_time":     None,
        "units":         units,
        "capital":       capital,
        "regime":        signal_data.get('regime', 'Unknown'),
        "hmm_conf":      signal_data.get('hmm_confidence', 0),
        "ml_conf":       signal_data.get('ml_confidence', 0),
        "combined_conf": signal_data.get('combined_score', 0),
        "risk_level":    signal_data.get('risk_level', 'MEDIUM'),
        "direction":     signal_data.get('direction', 'BUY'),
        "stop_loss":     signal_data.get('stop_loss', 0),
        "target_price":  signal_data.get('target_price', 0),
        "gross_pnl":     0,
        "net_pnl":       0,
        "pnl_pct":       0,
        "status":        "OPEN",
        "peak_value":    capital,
        "max_drawdown":  0
    }

    trades_collection.insert_one(trade)
    trade.pop('_id', None)
    trade['entry_time'] = str(trade['entry_time'])
    return trade

def close_trade(trade_id: str) -> dict:
    trade = trades_collection.find_one({"trade_id": trade_id})
    if not trade:
        return {"error": "Trade not found"}
    if trade['status'] == 'CLOSED':
        return {"error": "Trade already closed"}

    live = get_live_price(trade['index_name'])
    exit_price = live.get('price', 0)
    if exit_price == 0:
        return {"error": "Could not get live price"}

    pos_type = trade.get('position_type', 'LONG')
    pnl = calculate_pnl(trade['entry_price'], exit_price,
                         trade['units'], trade['capital'], pos_type)

    trades_collection.update_one(
        {"trade_id": trade_id},
        {"$set": {
            "exit_price":  exit_price,
            "exit_time":   datetime.utcnow(),
            "gross_pnl":   pnl['gross_pnl'],
            "net_pnl":     pnl['net_pnl'],
            "pnl_pct":     pnl['pnl_pct'],
            "status":      "CLOSED",
            "is_profit":   pnl['is_profit']
        }}
    )
    return {"message": "Trade closed", "trade_id": trade_id,
            "pnl": pnl, "exit_price": exit_price}

def get_open_positions(user_id: str = "default") -> list:
    trades = list(trades_collection.find(
        {"status": "OPEN", "user_id": user_id}))
    result = []
    for t in trades:
        t.pop('_id', None)
        t['entry_time'] = str(t.get('entry_time', ''))
        live = get_live_price(t['index_name'])
        current_price = live.get('price', t['entry_price'])
        pos_type = t.get('position_type', 'LONG')
        pnl = calculate_pnl(t['entry_price'], current_price,
                             t['units'], t['capital'], pos_type)
        t['current_price']   = current_price
        t['unrealised_pnl']  = pnl['net_pnl']
        t['unrealised_pct']  = pnl['pnl_pct']
        t['current_value']   = pnl['current_value']
        result.append(t)
    if not result:
        # Provide Fake Data for Demonstration
        live_nifty = get_live_price("NIFTY50")
        live_sp500 = get_live_price("SP500")
        result = [
            {
                "trade_id": "MOCK-N50",
                "index_name": "NIFTY50",
                "strategy": "Combined_v3",
                "trade_type": "Delivery",
                "position_type": "LONG",
                "entry_price": 24050.00,
                "current_price": live_nifty.get('price', 24177.00),
                "units": 41.58,
                "capital": 1000000,
                "unrealised_pnl": (live_nifty.get('price', 24177.00) - 24050.00) * 41.58,
                "unrealised_pct": ((live_nifty.get('price', 24177.00) - 24050.00) / 24050.00) * 100,
                "entry_time": "2026-04-25 10:15:00",
                "direction": "BUY"
            },
            {
                "trade_id": "MOCK-SPX",
                "index_name": "SP500",
                "strategy": "ZScore_MeanRev",
                "trade_type": "Intraday",
                "position_type": "LONG",
                "entry_price": 5010.00,
                "current_price": live_sp500.get('price', 5050.00),
                "units": 199.6,
                "capital": 1000000,
                "unrealised_pnl": (live_sp500.get('price', 5050.00) - 5010.00) * 199.6,
                "unrealised_pct": ((live_sp500.get('price', 5050.00) - 5010.00) / 5010.00) * 100,
                "entry_time": "2026-04-28 15:30:00",
                "direction": "BUY"
            }
        ]
    return result

def get_trade_history(user_id: str = "default") -> list:
    trades = list(trades_collection.find(
        {"status": "CLOSED", "user_id": user_id}
    ).sort("exit_time", -1).limit(50))
    result = []
    for t in trades:
        t.pop('_id', None)
        t['entry_time'] = str(t.get('entry_time', ''))
        t['exit_time']  = str(t.get('exit_time', ''))
        result.append(t)
    return result
