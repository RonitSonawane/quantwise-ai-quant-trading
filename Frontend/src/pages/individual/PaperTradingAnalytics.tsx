// import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTradeHistory, getMetrics } from '../../api/paperTrading';
import { 
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';

export default function PaperTradingAnalytics() {
  const { data: metrics } = useQuery({ queryKey: ['paper-metrics'], queryFn: getMetrics });
  const { data: history = [] } = useQuery({ queryKey: ['paper-history'], queryFn: getTradeHistory });

  // Cumulative P&L data
  let cumPnl = 0;
  const pnlData = [...history].reverse().map((t: any) => {
    cumPnl += t.net_pnl || 0;
    return {
      date: new Date(t.exit_time).toLocaleDateString(),
      pnl: cumPnl,
      raw: t.net_pnl
    };
  });
  const endingPositive = cumPnl >= 0;

  // Win Rate by Strategy
  const stratData = metrics?.by_strategy ? Object.keys(metrics.by_strategy).map(key => ({
    name: key.replace('_', ' '),
    winRate: metrics.by_strategy[key].win_rate,
    trades: metrics.by_strategy[key].trades
  })) : [];

  // Win Rate by Regime
  const regimeColors: Record<string, string> = {
    'Strong Bull': '#1a7a1a',
    'Weak Bull': '#6dbf6d',
    'Strong Sideways': '#e6a817',
    'Weak Sideways': '#f0d080',
    'Weak Bear': '#e07050',
    'Strong Bear': '#c0392b',
    'Unknown': '#666666'
  };
  const regimeData = metrics?.by_regime ? Object.keys(metrics.by_regime).map(key => ({
    name: key,
    winRate: metrics.by_regime[key].win_rate,
    fill: regimeColors[key] || '#666'
  })) : [];

  // Confidence Calibration Data
  const calibData = history.map((t: any) => ({
    confidence: t.combined_conf || 50,
    win: t.is_profit ? 100 : 0
  }));

  // Insights
  const bestStrat = stratData.length ? [...stratData].sort((a,b) => b.winRate - a.winRate)[0] : null;
  const bestReg = regimeData.length ? [...regimeData].sort((a,b) => b.winRate - a.winRate)[0] : null;
  
  const highConfTrades = history.filter((t:any) => t.combined_conf > 65);
  const highConfWins = highConfTrades.filter((t:any) => t.is_profit).length;
  const highConfWinRate = highConfTrades.length ? Math.round((highConfWins / highConfTrades.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-6 pb-24">
      <div className="mx-auto max-w-[1920px] space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <p className="text-white/60">Deep dive into your trading strategies and model performance</p>
        </div>

        {/* Insights Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-violet-900/20 border border-violet-500/20 p-5">
            <h3 className="text-violet-300 font-semibold mb-2">Best Strategy</h3>
            <p className="text-sm">
              <strong className="text-white">{bestStrat?.name || 'N/A'}</strong> leads with a 
              <span className="text-green-400"> {bestStrat?.winRate}% win rate</span>.
            </p>
          </div>
          <div className="rounded-xl bg-violet-900/20 border border-violet-500/20 p-5">
            <h3 className="text-violet-300 font-semibold mb-2">Best Regime</h3>
            <p className="text-sm">
              <strong className="text-white">{bestReg?.name || 'N/A'}</strong> is highly profitable at 
              <span className="text-green-400"> {bestReg?.winRate}% accuracy</span>.
            </p>
          </div>
          <div className="rounded-xl bg-violet-900/20 border border-violet-500/20 p-5">
            <h3 className="text-violet-300 font-semibold mb-2">High Confidence Signals</h3>
            <p className="text-sm">
              Signals &gt;65% confidence win <strong className="text-white">{highConfWinRate}%</strong> of the time.
            </p>
          </div>
          <div className="rounded-xl bg-violet-900/20 border border-violet-500/20 p-5">
            <h3 className="text-violet-300 font-semibold mb-2">Overall Edge</h3>
            <p className="text-sm">
              Profit factor of <strong className="text-white">{metrics?.profit_factor || 0}</strong> across all closed trades.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Cumulative P&L */}
          <div className="rounded-xl bg-[#12121A] p-6 border border-[rgba(255,255,255,0.05)] lg:col-span-2">
            <h2 className="mb-6 text-xl font-bold">Cumulative P&L</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pnlData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={v => `₹${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#12121A', borderColor: 'rgba(255,255,255,0.1)' }}
                    formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, 'Cum. P&L']}
                  />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
                  <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke={endingPositive ? '#22c55e' : '#ef4444'} 
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Win Rate by Strategy */}
          <div className="rounded-xl bg-[#12121A] p-6 border border-[rgba(255,255,255,0.05)]">
            <h2 className="mb-6 text-xl font-bold">Win Rate by Strategy</h2>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stratData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#12121A', borderColor: 'rgba(255,255,255,0.1)' }} />
                  <ReferenceLine y={50} stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
                  <Bar dataKey="winRate">
                    {stratData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.winRate >= 50 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Win Rate by Regime */}
          <div className="rounded-xl bg-[#12121A] p-6 border border-[rgba(255,255,255,0.05)]">
            <h2 className="mb-6 text-xl font-bold">Win Rate by Regime</h2>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 11}} />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#12121A', borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Bar dataKey="winRate">
                    {regimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
