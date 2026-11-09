import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Mail, Clock, X, ShieldCheck } from 'lucide-react';

export default function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: { street: 'Main GT Road', area: 'Opposite DHQ Hospital', city: 'Timergara', state: 'Lower Dir', zipCode: '' },
    phone: '0328 5027351',
    email: '',
    managerName: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data.branches || []);
    } catch (err) {
      console.error('Failed to load branches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenAdd = () => {
    setEditingBranchId(null);
    setFormData({
      name: '',
      code: `MALAK-TIM-0${branches.length + 1}`,
      address: { street: '', area: '', city: 'Timergara', state: 'Lower Dir', zipCode: '' },
      phone: '0328 5027351',
      email: '',
      managerName: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBranchId(b._id);
    setFormData({
      name: b.name,
      code: b.code,
      address: b.address,
      phone: b.phone,
      email: b.email,
      managerName: b.managerName || '',
    });
    setShowModal(true);
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBranchId) {
        await api.put(`/branches/${editingBranchId}`, formData);
      } else {
        await api.post('/branches', formData);
      }
      setShowModal(false);
      fetchBranches();
    } catch (err) {
      alert('Failed to save branch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Diagnostic Branch Center Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure laboratory branches, operational working hours, contact info, and patient capacity.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Diagnostic Branch</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((b) => (
          <div key={b._id} className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-blue-400">{b.code}</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
                  Accredited
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{b.name}</h3>
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-blue-400" /> {b.address.street}, {b.address.city}</p>
                <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-teal-400" /> {b.phone}</p>
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-indigo-400" /> {b.email}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(b)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingBranchId ? 'Edit Branch Details' : 'Add New Branch Center'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Branch Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Branch Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Zip Code</label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, zipCode: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  {saving ? 'Saving...' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
