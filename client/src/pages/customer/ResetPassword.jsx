import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Lock } from 'lucide-react';
import api from '../../services/api';
import AuthVisual from '../../components/AuthVisual';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/auth/reset-password/${encodeURIComponent(token)}`, { password });
      navigate('/login', {
        replace: true,
        state: { notice: response.data.message || 'Password updated. Sign in with your new password.' },
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not reset your password. Request a new link and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-black text-slate-900">Set a new password</h1>
            <p className="text-sm text-slate-500">Choose a password with at least 8 characters.</p>
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-700">New Password</span>
              <span className="relative block">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-700">Confirm New Password</span>
              <span className="relative block">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                />
              </span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Updating password…' : 'Update Password'}
            </button>
            <Link to="/login" className="block text-center text-xs font-bold text-blue-700 hover:underline">Back to sign in</Link>
          </form>
        </div>
        <AuthVisual />
      </div>
    </div>
  );
}
