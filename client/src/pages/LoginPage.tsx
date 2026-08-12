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
      showSuccess('Welcome back', 'Successfully logged in to NERP Operations Portal.');
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-7 rounded-lg border border-slate-200 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-2.5 rounded bg-indigo-600 text-white mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">NERP Operations Portal</h2>
          <p className="text-xs text-slate-500 mt-1">Internal ERP & CRM Operations System</p>
        </div>

        {/* Quick Test Accounts Switcher */}
        <div className="mb-6 p-3.5 rounded bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 mb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Select Test Account (Password: Password123!)</span>
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
                className={`p-2 rounded text-left border text-xs transition-colors ${
                  email === acc.email
                    ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
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
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 px-4 rounded shadow-sm flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
