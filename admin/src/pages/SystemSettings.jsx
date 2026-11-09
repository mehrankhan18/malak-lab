import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings, ShieldCheck, CheckCircle2, History, Bell, Lock } from 'lucide-react';

export default function SystemSettings() {
  const [settings, setSettings] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fetchSettingsAndAudit = async () => {
    try {
      const [setRes, logRes] = await Promise.all([
        api.get('/content/settings'),
        api.get('/admin/audit-logs?limit=25'),
      ]);
      setSettings(setRes.data.settings || {});
      setAuditLogs(logRes.data.logs || []);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndAudit();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      const res = await api.put('/content/settings', settings);
      setSettings(res.data.settings);
      setSuccess('System configuration parameters updated successfully!');
    } catch (err) {
      alert('Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage(res.data.message);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400 text-xs">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          MALAK Lab Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Update lab contact details and confirmed service settings. Do not enter unverified prices or certifications.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            Laboratory Identity & Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Laboratory Legal Name</label>
              <input
                type="text"
                value={settings.labName || ''}
                onChange={(e) => setSettings({ ...settings, labName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Marketing Tagline</label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail || ''}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Hotline Phone</label>
              <input
                type="text"
                value={settings.contactPhone || ''}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Emergency Phone</label>
              <input
                type="text"
                value={settings.emergencyPhone || ''}
                onChange={(e) => setSettings({ ...settings, emergencyPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Dispatch Policies */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-400" />
            Home Collection Fees & Notification Toggles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Home Collection Fee (PKR)</label>
              <input
                type="number"
                value={settings.homeCollectionFee ?? ''}
                onChange={(e) => setSettings({ ...settings, homeCollectionFee: e.target.value === '' ? null : Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Free Collection Threshold (PKR)</label>
              <input
                type="number"
                value={settings.freeCollectionThreshold ?? ''}
                onChange={(e) => setSettings({ ...settings, freeCollectionThreshold: e.target.value === '' ? null : Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs shadow-lg transition-all"
        >
          {saving ? 'Updating...' : 'Save Configuration Changes'}
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-400" />
          Change Your Password
        </h3>
        <p className="text-xs text-slate-400">
          Enter your current password and choose a new password with at least 8 characters.
        </p>
        {passwordMessage && <p role="status" className="text-xs text-emerald-400">{passwordMessage}</p>}
        {passwordError && <p role="alert" className="text-xs text-rose-400">{passwordError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label htmlFor="current-password" className="font-bold text-slate-300 block mb-1">Current Password</label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="font-bold text-slate-300 block mb-1">New Password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="font-bold text-slate-300 block mb-1">Confirm New Password</label>
            <input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={passwordSaving}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold rounded-2xl text-xs transition-all"
        >
          {passwordSaving ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>

      {/* Security Audit Trail Inspection */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          Master Security Audit Trail ({auditLogs.length} Events)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity Type</th>
                <th className="py-2.5 px-3">Staff Operator</th>
                <th className="py-2.5 px-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {auditLogs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-400">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-semibold">
                    {log.entityType}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">
                    <span className="font-bold">{log.performedByName}</span>
                    <span className="text-[10px] text-slate-500 block uppercase">{log.performedByRole}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
