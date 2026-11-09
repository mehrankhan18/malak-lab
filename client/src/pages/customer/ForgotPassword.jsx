import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import api from '../../services/api';
import AuthVisual from '../../components/AuthVisual';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setNotice(response.data.message || 'If an active account uses that email, reset instructions will be sent.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not request a password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-black text-slate-900">Forgot your password?</h1>
            <p className="text-sm text-slate-500">
              Enter the email on your patient account. We’ll send a one-use reset link if email delivery is configured.
            </p>
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {notice && (
            <div role="status" className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-700">Email Address</span>
              <span className="relative block">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                />
              </span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Sending request…' : 'Send Password Reset Link'}
            </button>
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
            <p className="text-xs leading-relaxed text-slate-500">
              If email is not configured, a reset email cannot be delivered. Contact the laboratory for account help.
            </p>
          </form>
        </div>
        <AuthVisual />
      </div>
    </div>
  );
}
