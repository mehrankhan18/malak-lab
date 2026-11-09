import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { downloadReportPdf } from '../../services/reportDownloads';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  X,
  AlertTriangle
} from 'lucide-react';

export default function CustomerReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState(null); // for preview modal
  const [downloadingReportId, setDownloadingReportId] = useState('');

  const handleDownload = async (reportId) => {
    setDownloadingReportId(reportId);
    try {
      await downloadReportPdf(reportId);
    } catch (error) {
      console.error('Failed to download laboratory report', error);
      alert(error.response?.status === 401
        ? 'Please sign in again to download your report.'
        : 'Unable to download this report. Please try again or contact the laboratory.');
    } finally {
      setDownloadingReportId('');
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/customer');
        setReports(res.data.reports || []);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          My Diagnostic Laboratory Reports
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Published results for tests booked under your account appear here after testing is complete and the laboratory approves the report.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
          <FileText className="w-12 h-12 mx-auto text-slate-200 stroke-1" />
          <h4 className="text-base font-bold text-slate-700">No Reports Available Yet</h4>
          <p className="text-xs text-slate-400">
            A WhatsApp price request or support ticket is not a test booking and cannot produce a report. After your test is booked, performed, and approved by the laboratory, the report will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep._id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-blue-600">{rep.reportId}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                    {rep.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{rep.testName}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>Booking Ref: <strong className="text-slate-600">{rep.bookingCode}</strong></span>
                  {rep.patientNumber && <><span>•</span><span>Patient ID: <strong className="text-slate-600">{rep.patientNumber}</strong></span></>}
                  <span>•</span>
                  <span>Specimen: {rep.sampleType}</span>
                  <span>•</span>
                  <span>Reported: {new Date(rep.reportedAt || rep.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveReport(rep)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Online</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(rep.reportId)}
                  disabled={downloadingReportId === rep.reportId}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingReportId === rep.reportId ? 'Downloading…' : 'Download Official PDF'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Online Preview Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Clinical Diagnostics Observation Report
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{activeReport.testName}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Report ID: {activeReport.reportId} | Patient: {activeReport.patientInfo?.fullName}
                </p>
              </div>
              <button onClick={() => setActiveReport(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Parameters Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Test Parameter</th>
                    <th className="py-2.5 px-4">Observed Value</th>
                    <th className="py-2.5 px-4">Unit</th>
                    <th className="py-2.5 px-4">Reference Interval</th>
                    <th className="py-2.5 px-4">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activeReport.results || []).map((res, i) => {
                    const isAbnormal = res.flag && res.flag !== 'Normal';
                    return (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-bold text-slate-800">{res.parameterName}</td>
                        <td className={`py-2.5 px-4 font-black ${isAbnormal ? 'text-rose-600' : 'text-slate-900'}`}>
                          {res.resultValue}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono">{res.unit || '-'}</td>
                        <td className="py-2.5 px-4 text-slate-500">{res.referenceRange || 'Standard'}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isAbnormal ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {res.flag}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pathologist Impression */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-800 block">Pathologist Clinical Impression:</span>
              <p className="text-slate-600 leading-relaxed">{activeReport.clinicalImpression || 'Correlate clinically.'}</p>
              <div className="pt-2 text-[11px] text-slate-400">
                Verified by: <strong className="text-slate-700">{activeReport.pathologistName || 'Consultant Pathologist'}</strong>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setActiveReport(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => handleDownload(activeReport.reportId)}
                disabled={downloadingReportId === activeReport.reportId}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingReportId === activeReport.reportId ? 'Downloading…' : 'Download Official PDF Document'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
