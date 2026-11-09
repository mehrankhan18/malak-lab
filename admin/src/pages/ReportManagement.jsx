import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { 
  FileCheck2, 
  Search, 
  Edit, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  Clock, 
  X, 
  Send, 
  Eye,
  AlertTriangle,
  History
} from 'lucide-react';

export default function ReportManagement() {
  const { adminUser, role, canApproveReports, canEnterResults } = useAdminAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Results Editor Modal
  const [editingReport, setEditingReport] = useState(null);
  const [resultRows, setResultRows] = useState([]);
  const [clinicalImpression, setClinicalImpression] = useState('');
  const [overallRemarks, setOverallRemarks] = useState('');
  const [savingResults, setSavingResults] = useState(false);

  // Pathologist Sign-Off / Approval Modal
  const [approvingReport, setApprovingReport] = useState(null);
  const [pathologistNotes, setPathologistNotes] = useState('');
  const [approvingAction, setApprovingAction] = useState('publish'); // 'approve' or 'publish'
  const [signing, setSigning] = useState(false);

  // Audit History Viewer Modal
  const [auditReport, setAuditReport] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Open Results Entry Matrix
  const handleOpenResultsEntry = (rep) => {
    setEditingReport(rep);
    setResultRows(rep.results || []);
    setClinicalImpression(rep.clinicalImpression || '');
    setOverallRemarks(rep.overallRemarks || '');
  };

  const handleSaveResults = async (e) => {
    e.preventDefault();
    setSavingResults(true);
    try {
      await api.put(`/reports/${editingReport._id}/results`, {
        results: resultRows,
        clinicalImpression,
        overallRemarks,
      });
      setEditingReport(null);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save results.');
    } finally {
      setSavingResults(false);
    }
  };

  const handleSubmitForReview = async (reportId) => {
    if (!window.confirm('Submit this report for Pathologist Verification?')) return;
    try {
      await api.put(`/reports/${reportId}/submit-review`);
      fetchReports();
    } catch (err) {
      alert('Failed to submit report for review.');
    }
  };

  // Open Pathologist Electronic Verification Modal
  const handleOpenSignoff = (rep) => {
    setApprovingReport(rep);
    setPathologistNotes(rep.clinicalImpression || 'Parameters correlate with patient clinical presentation. Certified.');
    setApprovingAction('publish');
  };

  const handleConfirmSignoff = async (e) => {
    e.preventDefault();
    setSigning(true);
    try {
      await api.put(`/reports/${approvingReport._id}/approve`, {
        actionType: approvingAction,
        pathologistRemarks: pathologistNotes,
      });
      setApprovingReport(null);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Pathologist approval failed.');
    } finally {
      setSigning(false);
    }
  };

  const filtered = reports.filter(r => {
    const matchesSearch = r.reportId.toLowerCase().includes(search.toLowerCase()) ||
      r.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      r.patientInfo?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      r.testName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Laboratory Report Management & Sign-Off
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter analytical test results, review auto-calculated flags, and authorize electronic pathologist sign-off.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Report ID, Patient Name, Test Name, or Booking Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Report Statuses</option>
          <option value="draft">Draft (Pending Input)</option>
          <option value="submitted_for_review">Submitted for Review</option>
          <option value="approved">Doctor Approved</option>
          <option value="published">Published & Released</option>
        </select>
      </div>

      {/* Reports Master Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Patient Demographics</th>
                <th className="py-3 px-4">Test Name & Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verifying Pathologist</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((rep) => (
                <tr key={rep._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-black text-blue-400 block">{rep.reportId}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Ref: {rep.bookingCode}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{rep.patientInfo?.fullName}</span>
                    <span className="text-[10px] text-slate-400">
                      {rep.patientInfo?.age} Yrs / {rep.patientInfo?.gender}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-200 block">{rep.testName}</span>
                    <span className="text-[10px] text-teal-400 font-mono">{rep.department}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${
                      rep.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : rep.status === 'approved'
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                          : rep.status === 'submitted_for_review'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {rep.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-xs">
                    {rep.pathologistName ? (
                      <span className="text-teal-300 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                        {rep.pathologistName}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Pending Assignment</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Enter / Edit Results (Technologist or Admin) */}
                      {canEnterResults && (
                        <button
                          onClick={() => handleOpenResultsEntry(rep)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold transition-all flex items-center gap-1"
                          title="Enter Analyte Results"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-400" />
                          <span>Results</span>
                        </button>
                      )}

                      {/* Submit for Pathologist Review if draft */}
                      {rep.status === 'draft' && (
                        <button
                          onClick={() => handleSubmitForReview(rep._id)}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[11px] font-bold transition-all flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit</span>
                        </button>
                      )}

                      {/* Pathologist Doctor Sign-off & Publish */}
                      {canApproveReports && rep.status !== 'published' && (
                        <button
                          onClick={() => handleOpenSignoff(rep)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-bold transition-all flex items-center gap-1"
                          title="Pathologist Electronic Sign-off"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verify & Sign</span>
                        </button>
                      )}

                      {/* View PDF Download */}
                      <a
                        href={`/api/reports/${rep.reportId}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-blue-950 text-slate-400 hover:text-blue-300 border border-slate-700 transition-all"
                        title="Download / Preview PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      {/* Audit History */}
                      <button
                        onClick={() => setAuditReport(rep)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                        title="View Report Audit Log"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Entry Matrix Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                  Report ID: {editingReport.reportId}
                </span>
                <h3 className="text-lg font-bold text-white">
                  Test Results Entry Matrix — {editingReport.testName}
                </h3>
              </div>
              <button onClick={() => setEditingReport(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResults} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex justify-between items-center text-slate-300">
                <span>Patient: <strong className="text-white">{editingReport.patientInfo?.fullName}</strong></span>
                <span>Age/Sex: {editingReport.patientInfo?.age} Yrs / {editingReport.patientInfo?.gender}</span>
                <span>Specimen: {editingReport.sampleType}</span>
              </div>

              {/* Matrix Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Parameter Name</th>
                      <th className="py-2.5 px-3">Observed Value *</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Reference Interval</th>
                      <th className="py-2.5 px-3">Flag Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {resultRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-bold text-white">{row.parameterName}</td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            required
                            placeholder="Value"
                            value={row.resultValue}
                            onChange={(e) => {
                              const updated = [...resultRows];
                              updated[idx].resultValue = e.target.value;
                              setResultRows(updated);
                            }}
                            className="w-24 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white font-mono font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono">{row.unit || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-400">{row.referenceRange || 'Standard'}</td>
                        <td className="py-2.5 px-3">
                          <select
                            value={row.flag || 'Normal'}
                            onChange={(e) => {
                              const updated = [...resultRows];
                              updated[idx].flag = e.target.value;
                              setResultRows(updated);
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-bold border border-slate-700 ${
                              row.flag === 'High' || row.flag === 'Critical'
                                ? 'bg-rose-950/60 text-rose-300'
                                : row.flag === 'Low'
                                  ? 'bg-blue-950/60 text-blue-300'
                                  : 'bg-slate-800 text-emerald-400'
                            }`}
                          >
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Low">Low</option>
                            <option value="Critical">Critical</option>
                            <option value="Abnormal">Abnormal</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Clinical Impression & Findings</label>
                <textarea
                  rows="2"
                  value={clinicalImpression}
                  onChange={(e) => setClinicalImpression(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Overall Laboratory Remarks</label>
                <input
                  type="text"
                  value={overallRemarks}
                  onChange={(e) => setOverallRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingResults}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-md"
                >
                  {savingResults ? 'Recording...' : 'Save Analytes Matrix'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pathologist Doctor Electronic Sign-Off Modal */}
      {approvingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Pathologist Electronic Sign-Off</h3>
                <span className="text-[10px] text-teal-400 font-mono">Report ID: {approvingReport.reportId}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Confirm that the analytical parameters have been reviewed according to laboratory procedures before approving this report.
            </p>

            <form onSubmit={handleConfirmSignoff} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Action</label>
                <select
                  value={approvingAction}
                  onChange={(e) => setApprovingAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                >
                  <option value="publish">Approve & Publish Immediately (Available to Patient)</option>
                  <option value="approve">Approve Only (Hold for internal dispatch)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Clinical Remarks & Signature Notes</label>
                <textarea
                  rows="3"
                  value={pathologistNotes}
                  onChange={(e) => setPathologistNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                Signatory: <strong>{adminUser.name}</strong> ({role.toUpperCase()})
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovingReport(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
                >
                  {signing ? 'Signing...' : 'Electronically Verify & Certify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {auditReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                Audit Trail — {auditReport.reportId}
              </h3>
              <button onClick={() => setAuditReport(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {(auditReport.auditHistory || []).map((entry, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-400 font-mono text-[11px]">{entry.action}</span>
                    <span className="text-[10px] text-slate-500">{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{entry.changesSummary}</p>
                  <span className="text-[10px] text-slate-500 block">
                    By: {entry.modifierName} ({entry.modifierRole})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
