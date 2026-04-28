import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTradeHistory, getMetrics } from '../../api/paperTrading';
import { Download, Search, RefreshCcw } from 'lucide-react';

export default function PaperTradingHistory() {
  const [filter, setFilter] = useState({ search: '', index: 'All', strategy: 'All', result: 'All' });
  const [page, setPage] = useState(1);

  const { data: metrics } = useQuery({ queryKey: ['paper-metrics'], queryFn: getMetrics });
  const { data: history = [], isLoading } = useQuery({ queryKey: ['paper-history'], queryFn: getTradeHistory });

  const filteredHistory = history.filter((t: any) => {
    if (filter.search && !t.trade_id.toLowerCase().includes(filter.search.toLowerCase())) return false;
    if (filter.index !== 'All' && t.index_name !== filter.index) return false;
    if (filter.strategy !== 'All' && t.strategy !== filter.strategy) return false;
    if (filter.result === 'Profit' && !t.is_profit) return false;
    if (filter.result === 'Loss' && t.is_profit) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredHistory.length / 10);
  const displayedHistory = filteredHistory.slice((page - 1) * 10, page * 10);

  const exportCsv = () => {
    if (!history.length) return;
    const header = Object.keys(history[0]).join(',') + '\n';
    const rows = history.map((t: any) => Object.values(t).map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trade_history.csv';
    a.click();
  };

  const strats = Array.from(new Set(history.map((t: any) => t.strategy)));

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-6 pb-24">
      <div className="mx-auto max-w-[1920px] space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trade History</h1>
            <p className="text-white/60">Review your past paper trading performance</p>
          </div>
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
            <Download className="size-4" /> Export CSV
          </button>
        </div>

        {/* Metrics Row */}
        {metrics && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div className="rounded-xl bg-[#12121A] p-5 border border-[rgba(255,255,255,0.05)]">
              <div className="text-white/50 text-sm mb-1">Total Trades</div>
              <div className="text-2xl font-bold">{metrics.closed_trades}</div>
            </div>
            <div className="rounded-xl bg-[#12121A] p-5 border border-[rgba(255,255,255,0.05)]">
              <div className="text-white/50 text-sm mb-1">Win Rate</div>
              <div className={`text-2xl font-bold ${metrics.win_rate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                {metrics.win_rate}%
              </div>
            </div>
            <div className="rounded-xl bg-[#12121A] p-5 border border-[rgba(255,255,255,0.05)]">
              <div className="text-white/50 text-sm mb-1">Total P&L</div>
              <div className={`text-2xl font-bold ${metrics.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ₹{metrics.total_pnl?.toFixed(2)}
              </div>
            </div>
            <div className="rounded-xl bg-[#12121A] p-5 border border-[rgba(255,255,255,0.05)]">
              <div className="text-white/50 text-sm mb-1">Best Trade</div>
              <div className="text-2xl font-bold text-green-500">₹{metrics.best_trade?.toFixed(2)}</div>
            </div>
            <div className="rounded-xl bg-[#12121A] p-5 border border-[rgba(255,255,255,0.05)]">
              <div className="text-white/50 text-sm mb-1">Worst Trade</div>
              <div className="text-2xl font-bold text-red-500">₹{metrics.worst_trade?.toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 rounded-xl bg-[#12121A] p-4 border border-[rgba(255,255,255,0.05)]">
          <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <Search className="size-4 text-white/50" />
            <input 
              type="text" 
              placeholder="Search Trade ID..." 
              value={filter.search}
              onChange={e => setFilter({...filter, search: e.target.value})}
              className="bg-transparent outline-none flex-1 text-sm text-white" 
            />
          </div>
          <select 
            value={filter.index} 
            onChange={e => setFilter({...filter, index: e.target.value})}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm outline-none border-none text-white focus:ring-1 focus:ring-violet-500"
          >
            <option value="All">All Indices</option>
            <option value="NIFTY50">NIFTY50</option>
            <option value="SP500">SP500</option>
          </select>
          <select 
            value={filter.strategy} 
            onChange={e => setFilter({...filter, strategy: e.target.value})}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm outline-none border-none text-white focus:ring-1 focus:ring-violet-500"
          >
            <option value="All">All Strategies</option>
            {strats.map((s: any) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            value={filter.result} 
            onChange={e => setFilter({...filter, result: e.target.value})}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm outline-none border-none text-white focus:ring-1 focus:ring-violet-500"
          >
            <option value="All">All Results</option>
            <option value="Profit">Profit</option>
            <option value="Loss">Loss</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-[#12121A] border border-[rgba(255,255,255,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="p-4 font-medium">Trade ID</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Index</th>
                  <th className="p-4 font-medium">Strategy</th>
                  <th className="p-4 font-medium">Entry</th>
                  <th className="p-4 font-medium">Exit</th>
                  <th className="p-4 font-medium">Net P&L</th>
                  <th className="p-4 font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {isLoading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-white/50">Loading history...</td></tr>
                ) : displayedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-white/50">
                      No completed trades match your filters.
                    </td>
                  </tr>
                ) : (
                  displayedHistory.map((t: any) => (
                    <tr key={t.trade_id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-mono text-xs text-white/70">{t.trade_id}</td>
                      <td className="p-4">{new Date(t.entry_time).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold">{t.index_name}</td>
                      <td className="p-4">{t.strategy}</td>
                      <td className="p-4">₹{t.entry_price?.toFixed(2)}</td>
                      <td className="p-4">₹{t.exit_price?.toFixed(2)}</td>
                      <td className={`p-4 font-bold ${t.net_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {t.net_pnl >= 0 ? '+' : ''}₹{t.net_pnl?.toFixed(2)} ({t.pnl_pct >= 0 ? '+' : ''}{t.pnl_pct?.toFixed(2)}%)
                      </td>
                      <td className="p-4">
                        <span className={`rounded px-2 py-1 text-xs font-bold ${t.is_profit ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {t.is_profit ? 'WIN' : 'LOSS'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.05)] p-4">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="rounded-lg bg-white/5 px-4 py-2 hover:bg-white/10 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-white/50">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="rounded-lg bg-white/5 px-4 py-2 hover:bg-white/10 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
