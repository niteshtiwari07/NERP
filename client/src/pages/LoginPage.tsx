import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      showSuccess('Welcome back!', 'Successfully logged in to ERP & CRM Operations Portal');
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Check your credentials.';
      showError('Authentication Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800 relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-xl shadow-brand-500/20 mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">NERP Operations Portal</h2>
          <p className="text-sm text-slate-400 mt-1">Wholesale & Distribution Portal</p>
        </div>

        {/* Quick Test Accounts Switcher */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Select Test Account Role (Demo Password: Password123!)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: 'ADMIN', email: 'admin@example.com' },
              { role: 'SALES', email: 'sales@example.com' },
              { role: 'WAREHOUSE', email: 'warehouse@example.com' },
              { role: 'ACCOUNTS', email: 'accounts@example.com' },
            ].map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleQuickLogin(acc.email)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                  email === acc.email
                    ? 'bg-brand-600 text-white border-brand-400 shadow-md'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="font-semibold">{acc.role}</div>
                <div className="text-[10px] opacity-80 truncate">{acc.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
