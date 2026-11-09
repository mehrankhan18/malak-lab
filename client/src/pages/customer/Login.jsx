import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthVisual from '../../components/AuthVisual';
import { FlaskConical, Lock, Mail, AlertCircle } from 'lucide-react';

const getAuthErrorMessage = (err, fallback) => {
  if (err.code === 'ERR_NETWORK') {
    return 'Cannot reach MALAK Lab services. Start the API server and MongoDB, then try again.';
  }
  const validationErrors = err.response?.data?.errors;
  return validationErrors?.length
    ? validationErrors.join(' ')
    : err.response?.data?.message || fallback;
};

export default function Login() {
  const { login, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('password'); // 'password' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP flow
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice || '');

  const continueToPortal = (user) => {
    if (user.role === 'customer') {
      navigate('/customer');
      return;
    }
    window.location.assign(import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174');
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const res = await login(email, password);
      continueToPortal(res.user);
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Sign in failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email address');
      return;
    }
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const res = await sendOtp(email);
      setOtpSent(true);
      setOtpCode('');
      setNotice(res.message || 'Check your email inbox and spam folder for the verification code.');
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Could not request a verification code.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await verifyOtp(email, otpCode);
      continueToPortal(res.user);
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Invalid or expired OTP.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="mx-auto w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white flex items-center justify-center shadow-md">
              <FlaskConical className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              MALAK<span className="text-blue-600"> LAB</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">
            Sign in to Your Account
          </h2>
          <p className="text-xs text-slate-500">
            Access your laboratory reports, track collected samples, and view invoices.
          </p>
        </div>

        {/* Mode Toggle: Password vs Email OTP */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('password'); setError(''); }}
            className={`py-2 rounded-xl transition-all ${mode === 'password' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('otp'); setError(''); }}
            className={`py-2 rounded-xl transition-all ${mode === 'otp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Email OTP Login
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div role="status" className="rounded-2xl border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-800">
            {notice}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs space-y-6">
          {mode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all"
              >
                {loading ? 'Authenticating...' : 'Sign In with Password'}
              </button>
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address for OTP</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all"
                  >
                    {loading ? 'Dispatching OTP...' : 'Send Verification OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800">
                    Verification code sent to <strong>{email}</strong>. Check your inbox and spam folder.
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      required
                      maxLength="6"
                      placeholder="Enter the code from your email"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-4 py-2.5 text-center text-lg font-mono font-black tracking-widest rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all"
                  >
                    {loading ? 'Verifying OTP...' : 'Verify & Continue'}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Register here
            </Link>
          </div>
        </div>

        </div>
        <AuthVisual />
      </div>
    </div>
  );
}
