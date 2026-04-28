import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  TrendingUp, TrendingDown, Activity, AlertCircle, 
  RefreshCcw, Clock, Target, ShieldAlert, ArrowRight, X
} from 'lucide-react';
import { 
  getAllSignals, getPositions, openTrade, closeTrade 
} from '../../api/paperTrading';
import toast from 'react-hot-toast';

const STRATEGIES = [
  "Buy_Hold", "SMA_Crossover", "EMA_Crossover", "MACD_Signal",
  "RSI_Oversold", "Bollinger_Breakout", "Stochastic_Osc",
  "ATR_Breakout", "ADX_Trend", "Parabolic_SAR", "Ichimoku_Cloud",
  "Volume_Price_Trend", "OBV_Divergence", "ML_Signal", "Combined_v3"
];

function SignalCard({ indexName, data, openModal }: { indexName: string, data: any, openModal: (index: string, type: string) => void }) {
  if (!data) return (
    <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-[#12121A] p-6 border border-[rgba(255,255,255,0.05)]">
      <RefreshCcw className="mb-2 size-6 animate-spin text-white/50" />
      <p className="text-sm text-white/50">Loading {indexName} signal...</p>
    </div>
  );

  const priceColor = data.direction === 'BUY' ? 'text-green-500' : data.direction === 'REDUCE' ? 'text-red-500' : 'text-white';
  
  const getRegimeColor = (regime: string) => {
    if (regime?.includes('Strong Bull')) return 'bg-green-600';
    if (regime?.includes('Weak Bull')) return 'bg-green-400 text-black';
    if (regime?.includes('Sideways')) return 'bg-yellow-500 text-black';
    if (regime?.includes('Bear')) return 'bg-red-600';
    return 'bg-gray-600';
  };

  const getConfColor = (score: number) => {
    if (score > 65) return '#22c55e'; // green-500
    if (score > 50) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  const score = data.combined_score || 0;
  const confColor = getConfColor(score);
  const strokeDashoffset = 126 - (126 * score) / 100;

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-[#12121A] p-6 border border-[rgba(255,255,255,0.05)]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{indexName}</h3>
          <div className={`mt-1 flex items-center gap-2 text-2xl font-bold ${priceColor}`}>
            {data.current_price?.toFixed(2)}
          </div>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-bold ${getRegimeColor(data.regime)}`}>
          {data.regime}
        </div>
      </div>

      <div className="flex items-center gap-6 py-2">
        {/* Circular Progress */}
        <div className="relative flex size-16 items-center justify-center">
          <svg className="size-full -rotate-90 transform" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle cx="22" cy="22" r="20" fill="none" stroke={confColor} strokeWidth="4" 
              strokeDasharray="126" strokeDashoffset={strokeDashoffset} strokeLinecap="round" 
              className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-sm font-bold text-white">{score}%</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-xs text-white/70">
              <span>HMM Conf</span><span>{data.hmm_confidence}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-blue-500" style={{ width: `${data.hmm_confidence}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-white/70">
              <span>ML Conf</span><span>{data.ml_confidence}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-purple-500/20">
              <div className="h-full bg-purple-500" style={{ width: `${data.ml_confidence}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`rounded px-2 py-1 text-xs font-bold ${
          data.risk_level === 'LOW' ? 'bg-green-500/20 text-green-400' :
          data.risk_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
        }`}>Risk: {data.risk_level}</span>
        
        <span className={`rounded px-2 py-1 text-xs font-bold ${
          data.direction === 'BUY' ? 'bg-green-500/20 text-green-400' :
          data.direction === 'HOLD' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
        }`}>Action: {data.direction}</span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-red-400">
          <ShieldAlert className="size-4" /> Stop: {data.stop_loss?.toFixed(2)}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-green-400">
          <Target className="size-4" /> Target: {data.target_price?.toFixed(2)}
        </div>
      </div>

      {!data.should_trade && (
        <div className="mt-2 flex items-center gap-2 text-xs text-yellow-500">
          <AlertCircle className="size-4" />
          Low confidence - trade not recommended
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button
          disabled={!data.should_trade}
          onClick={() => openModal(indexName, 'Intraday')}
          className="flex-1 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 hover:bg-violet-700"
        >
          Intraday Trade
        </button>
        <button
          disabled={!data.should_trade}
          onClick={() => openModal(indexName, 'Delivery')}
          className="flex-1 rounded-lg border border-violet-600 py-2.5 text-sm font-semibold text-violet-400 transition disabled:opacity-50 hover:bg-violet-600/10"
        >
          Delivery Trade
        </button>
      </div>
    </div>
  );
}

export default function PaperTradingPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [tradeForm, setTradeForm] = useState({ index: '', type: '', capital: 100000, strategy: 'Combined_v3' });

  // Queries
  const { data: signals, refetch: refetchSignals, dataUpdatedAt } = useQuery({
    queryKey: ['live-signals'],
    queryFn: getAllSignals,
    refetchInterval: 60000
  });

  const { data: positions = [], refetch: refetchPositions, isLoading: loadingPositions } = useQuery({
    queryKey: ['paper-positions'],
    queryFn: getPositions,
    refetchInterval: 30000
  });

  // Mutations
  const openMut = useMutation({
    mutationFn: openTrade,
    onSuccess: () => {
      toast.success("Trade opened successfully");
      setModalOpen(false);
      refetchPositions();
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to open trade")
  });

  const closeMut = useMutation({
    mutationFn: closeTrade,
    onSuccess: () => {
      toast.success("Trade closed successfully");
      refetchPositions();
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to close trade")
  });

  const handleOpenTrade = () => {
    openMut.mutate({
      index_name: tradeForm.index,
      strategy: tradeForm.strategy,
      trade_type: tradeForm.type,
      capital: tradeForm.capital
    });
  };

  const totalOpen = positions.length;
  const totalPnl = positions.reduce((acc: number, p: any) => acc + (p.unrealised_pnl || 0), 0);
  const sortedByPnl = [...positions].sort((a, b) => (b.unrealised_pnl || 0) - (a.unrealised_pnl || 0));
  const bestTrade = sortedByPnl[0]?.unrealised_pnl || 0;
  const worstTrade = sortedByPnl[sortedByPnl.length - 1]?.unrealised_pnl || 0;

  const activeSignal = signals ? signals[tradeForm.index] : null;
  const estUnits = activeSignal ? (tradeForm.capital / activeSignal.current_price).toFixed(4) : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-6 pb-24">
      <div className="mx-auto max-w-[1920px] space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Paper Trading</h1>
            <p className="text-white/60">Live market signals and virtual portfolio management</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/50">
            {dataUpdatedAt && <span>Last update: {new Date(dataUpdatedAt).toLocaleTimeString()}</span>}
            <button onClick={() => refetchSignals()} className="rounded-lg bg-white/5 p-2 hover:bg-white/10">
              <RefreshCcw className="size-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[#12121A] p-5 border border-[rgba(255,255,255,0.05)]">
            <div className="text-white/50 text-sm mb-1">Open Positions</div>
            <div className="text-2xl font-bold">{totalOpen}</div>
          </div>
          <div className="rounded-xl bg-[#12121A] p-5 border border-[rgba(255,255,255,0.05)]">
            <div className="text-white/50 text-sm mb-1">Total P&L (Today)</div>
            <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{totalPnl.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl bg-[#12121A] p-5 border border-[rgba(255,255,255,0.05)]">
            <div className="text-white/50 text-sm mb-1">Best Position</div>
            <div className="text-2xl font-bold text-green-500">₹{bestTrade.toFixed(2)}</div>
          </div>
          <div className="rounded-xl bg-[#12121A] p-5 border border-[rgba(255,255,255,0.05)]">
            <div className="text-white/50 text-sm mb-1">Worst Position</div>
            <div className="text-2xl font-bold text-red-500">₹{worstTrade.toFixed(2)}</div>
          </div>
        </div>

        {/* Signals */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SignalCard 
            indexName="NIFTY50" 
            data={signals?.NIFTY50} 
            openModal={(idx, type) => { setTradeForm({ ...tradeForm, index: idx, type }); setModalOpen(true); }}
          />
          <SignalCard 
            indexName="SP500" 
            data={signals?.SP500} 
            openModal={(idx, type) => { setTradeForm({ ...tradeForm, index: idx, type }); setModalOpen(true); }}
          />
        </div>

        {/* Positions Table */}
        <div className="rounded-xl bg-[#12121A] border border-[rgba(255,255,255,0.05)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] p-5">
            <h2 className="text-xl font-bold">Open Positions</h2>
            <button onClick={() => refetchPositions()} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">
              <RefreshCcw className="size-4" /> Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="p-4 font-medium">Index</th>
                  <th className="p-4 font-medium">Strategy</th>
                  <th className="p-4 font-medium">Entry Price</th>
                  <th className="p-4 font-medium">Current Price</th>
                  <th className="p-4 font-medium">Units</th>
                  <th className="p-4 font-medium">Unrealised P&L</th>
                  <th className="p-4 font-medium">P&L %</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {loadingPositions ? (
                  <tr><td colSpan={8} className="p-8 text-center text-white/50">Loading positions...</td></tr>
                ) : positions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-white/50">
                      <Activity className="mx-auto mb-3 size-8 opacity-50" />
                      No open positions. Use the signals above to open trades.
                    </td>
                  </tr>
                ) : (
                  positions.map((p: any) => (
                    <tr key={p.trade_id} className="hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="font-semibold">{p.index_name}</div>
                        <div className="text-xs text-white/50">{p.trade_type}</div>
                      </td>
                      <td className="p-4">{p.strategy}</td>
                      <td className="p-4">₹{p.entry_price?.toFixed(2)}</td>
                      <td className="p-4">₹{p.current_price?.toFixed(2)}</td>
                      <td className="p-4">{p.units}</td>
                      <td className={`p-4 font-bold ${p.unrealised_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {p.unrealised_pnl >= 0 ? '+' : ''}₹{p.unrealised_pnl?.toFixed(2)}
                      </td>
                      <td className={`p-4 font-bold ${p.unrealised_pct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {p.unrealised_pct >= 0 ? '+' : ''}{p.unrealised_pct?.toFixed(2)}%
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => closeMut.mutate(p.trade_id)}
                          disabled={closeMut.isPending}
                          className="rounded bg-red-500/20 px-3 py-1 text-red-400 transition hover:bg-red-500/30"
                        >
                          Close Trade
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#12121A] border border-[rgba(255,255,255,0.1)] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">Open {tradeForm.type} Trade</h3>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-white/60">Index</label>
                <div className="rounded-lg bg-white/5 p-3 font-semibold">{tradeForm.index}</div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/60">Strategy</label>
                <select 
                  value={tradeForm.strategy}
                  onChange={e => setTradeForm({...tradeForm, strategy: e.target.value})}
                  className="w-full rounded-lg border border-white/10 bg-[#0A0A0F] p-3 text-white focus:border-violet-500 focus:outline-none"
                >
                  {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/60">Capital to Deploy (₹)</label>
                <input 
                  type="number"
                  value={tradeForm.capital}
                  onChange={e => setTradeForm({...tradeForm, capital: Number(e.target.value)})}
                  className="w-full rounded-lg border border-white/10 bg-[#0A0A0F] p-3 text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-white/5 p-4 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-white/60">Current Price</span>
                  <span className="font-bold">₹{activeSignal?.current_price?.toFixed(2) || '---'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-white/60">Estimated Units</span>
                  <span className="font-bold">{estUnits}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Stop Loss</span>
                  <span className="font-bold">₹{activeSignal?.stop_loss?.toFixed(2) || '---'}</span>
                </div>
                <div className="flex justify-between text-green-400 mt-2">
                  <span>Target</span>
                  <span className="font-bold">₹{activeSignal?.target_price?.toFixed(2) || '---'}</span>
                </div>
              </div>

              {activeSignal && activeSignal.combined_score < 55 && (
                <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-500">
                  <AlertCircle className="size-5 shrink-0" />
                  Model confidence is below recommended threshold. Trade carefully.
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-lg border border-white/10 py-3 text-sm font-semibold hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleOpenTrade}
                  disabled={openMut.isPending}
                  className="flex-1 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {openMut.isPending ? 'Opening...' : 'Confirm Trade'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
