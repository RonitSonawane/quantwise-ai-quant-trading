import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, User, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Verify, 2: Reset
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/auth/forgot-password', { email, name });
      toast.success('Identity verified! Please set your new password.');
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/auth/reset-password', { email, new_password: newPassword });
      toast.success('Password updated successfully! Please login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Reset failed');
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
          <h2 className="text-3xl font-extrabold text-white">Reset Password</h2>
          <p className="mt-2 text-sm text-white/50">
            {step === 1 ? 'Verify your identity to continue' : 'Enter your new strong password'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#12121A] border border-white/5 p-8 shadow-2xl backdrop-blur-xl">
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleVerify}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 size-5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/20 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition"
                      placeholder="Your registered name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Email Address</label>
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-bold text-white hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : (
                  <>
                    Verify Identity
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleReset}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 size-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder-white/20 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-bold text-white hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-50"
              >
                {loading ? 'Updating...' : (
                  <>
                    Reset Password
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-white/50">
            Remembered your password?{' '}
            <Link to="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition">Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
