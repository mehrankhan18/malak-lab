import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Search, ShieldCheck, Ban, CheckCircle2, Phone, Mail, Clock } from 'lucide-react';

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = async () => {
    try {
      const res = await api.get('/admin/patients');
      setPatients(res.data.customers || []);
    } catch (err) {
      console.error('Failed to load patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'block' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this customer account?`)) return;
    try {
      await api.put(`/admin/patients/${id}/toggle-status`);
      fetchPatients();
    } catch (err) {
      alert('Failed to update patient account status');
    }
  };

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone && p.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Customer & Patient Account Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage registered patient accounts, view demographic profiles, and enforce access controls.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by Patient Name, Email, or Phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Patients Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Primary Address</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Access Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white text-sm block">{p.name}</span>
                    <span className="text-[10px] text-teal-400 font-mono">ID: {p._id.slice(-6)}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-300 block">{p.email}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{p.phone || 'No phone registered'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-xs">
                    {p.addresses && p.addresses[0] ? (
                      <span>{p.addresses[0].street}, {p.addresses[0].city}</span>
                    ) : (
                      <span className="text-slate-600 italic">None on file</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${
                      p.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {p.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(p._id, p.isActive)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        p.isActive
                          ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/50'
                          : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-900/50'
                      }`}
                    >
                      {p.isActive ? 'Block Account' : 'Reactivate'}
                    </button>
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

