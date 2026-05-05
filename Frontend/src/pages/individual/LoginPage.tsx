import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as apiLogin } from '../../api/auth';
import { Mail, Lock, LogIn, ArrowRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiLogin({ email, password });
      login(data.access_token);
      toast.success('Welcome back to QuantWise!');
      navigate('/paper-trading');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-violet-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 mb-4">
            <Activity className="text-white size-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-white/50">Login to access your trading dashboard</p>
        </div>

        <div className="rounded-2xl bg-[#12121A] border border-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 size-5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/20 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 size-5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/20 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-white/50 cursor-pointer">
                <input type="checkbox" className="rounded border-white/10 bg-[#0A0A0F] text-violet-600 focus:ring-violet-500" />
                Remember me
              </label>
              <a href="#" className="text-violet-400 hover:text-violet-300 transition">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-bold text-white hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Login to Dashboard
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-white/50">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 font-semibold hover:text-violet-300 transition">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
