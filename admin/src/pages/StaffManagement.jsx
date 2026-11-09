import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  UserCog, 
  Plus, 
  Search, 
  ShieldCheck, 
  Stethoscope, 
  FlaskConical, 
  Building2, 
  X,
  CheckCircle2
} from 'lucide-react';

export default function StaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'technician',
    department: 'Hematology',
    designation: 'Medical Laboratory Technologist',
    specialization: 'Automated Cytometry',
    qualification: 'BSc MLS',
    licenseNumber: 'TECH-2026-991',
    assignedBranch: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchStaffData = async () => {
    try {
      const [staffRes, branchRes] = await Promise.all([
        api.get('/staff'),
        api.get('/branches'),
      ]);
      setStaffList(staffRes.data.staff || []);
      const bList = branchRes.data.branches || [];
      setBranches(bList);
      if (bList.length > 0 && !formData.assignedBranch) {
        setFormData(prev => ({ ...prev, assignedBranch: bList[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load staff list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/staff', formData);
      setShowModal(false);
      fetchStaffData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create staff member.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/staff/${id}/status`);
      fetchStaffData();
    } catch (err) {
      alert('Failed to update staff status');
    }
  };

  const filtered = staffList.filter(s => 
    s.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Staff Management & Role-Based Access (RBAC)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authorize consultant pathologists, medical laboratory technologists, receptionists, and clinic directors.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Staff Master Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Employee ID & Name</th>
                <th className="py-3 px-4">Role & Department</th>
                <th className="py-3 px-4">Designation & License</th>
                <th className="py-3 px-4">Assigned Branch</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[10px] font-bold text-blue-400 block">{s.employeeId}</span>
                    <span className="font-bold text-white text-sm">{s.userId?.name}</span>
                    <span className="text-[10px] text-slate-500 block">{s.userId?.email}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 block w-max">
                      {s.userId?.role}
                    </span>
                    <span className="text-[11px] text-teal-400 block mt-0.5 font-medium">{s.department}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="font-medium block">{s.designation}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Lic: {s.licenseNumber || 'N/A'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {s.assignedBranch?.name || 'Central Laboratory Pavilion'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${
                      s.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {s.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(s._id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        s.isActive
                          ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/50'
                          : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-900/50'
                      }`}
                    >
                      {s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add New Employee Account</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Arthur Conan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="employee@apexlab.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">System Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                  >
                    <option value="technician">Laboratory Technician</option>
                    <option value="pathologist">Consultant Pathologist</option>
                    <option value="receptionist">Receptionist / Coordinator</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Temporary Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="StaffPass@2026"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Medical License Number</label>
                  <input
                    type="text"
                    placeholder="e.g. NMC-PAT-88124"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Assigned Diagnostic Branch</label>
                  <select
                    value={formData.assignedBranch}
                    onChange={(e) => setFormData({ ...formData, assignedBranch: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
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
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-md"
                >
                  {saving ? 'Creating Employee...' : 'Authorize Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

