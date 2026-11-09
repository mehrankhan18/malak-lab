import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Droplet, 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Building2, 
  FlaskConical, 
  FileCheck2, 
  ShieldCheck, 
  FileDown, 
  Plus, 
  X,
  ScanLine
} from 'lucide-react';

const STAGES = [
  'Booking Confirmed',
  'Sample Collection Scheduled',
  'Sample Collected',
  'Sample Received',
  'Testing in Progress',
  'Report Under Review',
  'Report Approved',
  'Report Published',
];

export default function SampleOperations() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState('');

  // Advance stage modal
  const [activeSample, setActiveSample] = useState(null);
  const [newStage, setNewStage] = useState('');
  const [locationRemark, setLocationRemark] = useState('Central Reference Laboratory');
  const [staffRemarks, setStaffRemarks] = useState('');
  const [advancing, setAdvancing] = useState(false);

  const fetchSamples = async () => {
    try {
      const res = await api.get('/samples');
      setSamples(res.data.samples || []);
    } catch (err) {
      console.error('Failed to load samples', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const handleOpenAdvance = (s) => {
    setActiveSample(s);
    const currentIndex = STAGES.indexOf(s.currentStage);
    const nextStage = currentIndex < STAGES.length - 1 ? STAGES[currentIndex + 1] : STAGES[currentIndex];
    setNewStage(nextStage);
    setLocationRemark('MALAK Lab Processing Area');
    setStaffRemarks(`Transitioning to ${nextStage} via LIS protocol.`);
  };

  const handleUpdateStage = async (e) => {
    e.preventDefault();
    if (!activeSample) return;
    setAdvancing(true);
    try {
      await api.put(`/samples/${activeSample._id}/stage`, {
        stage: newStage,
        location: locationRemark,
        remarks: staffRemarks,
      });
      setActiveSample(null);
      fetchSamples();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update sample stage.');
    } finally {
      setAdvancing(false);
    }
  };

  const filtered = samples.filter(s => {
    const matchesSearch = s.sampleId.toLowerCase().includes(search.toLowerCase()) || 
      s.barcode.toLowerCase().includes(search.toLowerCase()) || 
      s.bookingCode.toLowerCase().includes(search.toLowerCase());
    const matchesStage = !selectedStage || s.currentStage === selectedStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Specimen Accessioning & 8-Stage Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Barcode tracking, collection scheduling, physical accessioning, and testing progression.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Sample ID, Barcode, or Booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All 8 Stages</option>
          {STAGES.map((stg) => (
            <option key={stg} value={stg}>{stg}</option>
          ))}
        </select>
      </div>

      {/* Samples Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Sample / Barcode</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Specimen Type & Tube</th>
                <th className="py-3 px-4">Current Stage (8-Step)</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((s) => {
                const stageIndex = STAGES.indexOf(s.currentStage);
                return (
                  <tr key={s._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-black text-blue-400 block">{s.sampleId}</span>
                      <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                        <ScanLine className="w-3 h-3 text-slate-400" /> {s.barcode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                      {s.bookingCode}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="block font-medium">{s.sampleType}</span>
                      <span className="text-[10px] text-teal-400">{s.tubeColor || 'Standard'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${
                          s.currentStage === 'Report Published'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {stageIndex + 1}/8: {s.currentStage}
                        </span>
                        <div className="w-24 bg-slate-800 rounded-full h-1 overflow-hidden">
                          <div 
                            style={{ width: `${((stageIndex + 1) / 8) * 100}%` }} 
                            className="bg-blue-500 h-full rounded-full" 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenAdvance(s)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-bold transition-all"
                      >
                        Advance Stage →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advance Stage Modal */}
      {activeSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Advance Sample Progression
              </h3>
              <button onClick={() => setActiveSample(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Specimen</span>
              <span className="font-mono font-bold text-blue-400 text-sm">{activeSample.sampleId}</span>
              <span className="text-slate-400 block text-[11px] mt-0.5">Booking ID: {activeSample.bookingCode}</span>
            </div>

            <form onSubmit={handleUpdateStage} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Target Stage (Select Step)</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                >
                  {STAGES.map((stg) => (
                    <option key={stg} value={stg}>{stg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Physical Location</label>
                <input
                  type="text"
                  required
                  value={locationRemark}
                  onChange={(e) => setLocationRemark(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Staff Protocol Remarks</label>
                <textarea
                  rows="2"
                  value={staffRemarks}
                  onChange={(e) => setStaffRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSample(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={advancing}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-md"
                >
                  {advancing ? 'Updating...' : 'Confirm Stage Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
