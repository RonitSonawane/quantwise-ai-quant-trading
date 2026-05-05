import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getMetrics } from '../../api/paperTrading';
import { 
  User, Wallet, TrendingUp, Shield, Settings, 
  LogOut, Bell, ChevronRight, Activity 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { data: metrics } = useQuery({ 
    queryKey: ['paper-metrics'], 
    queryFn: getMetrics,
    enabled: !!user
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Profile Header */}
        <div className="flex items-center gap-6 rounded-2xl bg-[#12121A] p-8 border border-white/5">
          <div className="flex size-24 items-center justify-center rounded-full bg-violet-600/20 text-violet-400 border-2 border-violet-500/50">
            <User size={48} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-white/50">{user.email}</p>
            <div className="mt-4 flex gap-3">
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400 border border-green-500/20">
                Verified Account
              </span>
              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400 border border-violet-500/20">
                Premium Member
              </span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Wallet Card */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Available Balance</p>
                <h2 className="mt-2 text-4xl font-bold">₹{user.balance?.toLocaleString()}</h2>
              </div>
              <div className="rounded-xl bg-white/20 p-3">
                <Wallet size={24} />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button className="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-600 hover:bg-white/90 transition">
                Add Funds
              </button>
              <button className="flex-1 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/30 transition">
                Withdraw
              </button>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="rounded-2xl bg-[#12121A] p-8 border border-white/5 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-violet-400" /> Trading Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-white/50 mb-1">Win Rate</p>
                <p className="text-lg font-bold text-green-400">{metrics?.win_rate || 0}%</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-white/50 mb-1">Total Trades</p>
                <p className="text-lg font-bold">{metrics?.total_trades || 0}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-white/50 mb-1">Total P&L</p>
                <p className={`text-lg font-bold ${metrics?.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{metrics?.total_pnl?.toLocaleString() || 0}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-white/50 mb-1">Profit Factor</p>
                <p className="text-lg font-bold text-violet-400">{metrics?.profit_factor || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Watchlist & Notifications */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-[#12121A] p-6 border border-white/5">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity size={20} className="text-blue-400" /> Watchlist
            </h3>
            <div className="space-y-3">
              {['NIFTY 50', 'S&P 500', 'RELIANCE', 'TCS'].map((stock, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                  <span className="font-semibold">{stock}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">+1.24%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#12121A] p-6 border border-white/5">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bell size={20} className="text-yellow-400" /> Recent Alerts
            </h3>
            <div className="space-y-3">
              {[
                { m: 'NIFTY50 reached target price', t: '2h ago' },
                { m: 'New Strong Bull signal detected', t: '5h ago' }
              ].map((alert, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5">
                  <p className="text-sm">{alert.m}</p>
                  <p className="text-xs text-white/40 mt-1">{alert.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account Sections */}

        <div className="space-y-4">
          <h3 className="text-xl font-bold px-2">Account Settings</h3>
          <div className="rounded-2xl bg-[#12121A] border border-white/5 divide-y divide-white/5">
            {[
              { icon: Shield, label: 'Security & Privacy', sub: 'Two-factor auth, Login history' },
              { icon: Bell, label: 'Notifications', sub: 'Price alerts, Signal notifications' },
              { icon: Activity, label: 'Trade Logs', sub: 'Export your trading history' },
              { icon: Settings, label: 'General Settings', sub: 'Theme, Language, Regional settings' }
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition first:rounded-t-2xl last:rounded-b-2xl group">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-violet-600/10 p-3 text-violet-400 group-hover:bg-violet-600/20 transition">
                    <item.icon size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-white/40">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-white/20 group-hover:text-white transition" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
