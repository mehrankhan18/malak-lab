import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { downloadReportPdf } from '../../services/reportDownloads';
import SampleTracker from '../../components/SampleTracker';
import { Search, AlertCircle, FileSearch } from 'lucide-react';

export default function CustomerTracking() {
  const { bookingId } = useParams();
  const [searchId, setSearchId] = useState(bookingId || '');
  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (id) => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/samples/track/${id}`);
      setSample(res.data.sample);
    } catch (err) {
      setSample(null);
      setError(err.response?.data?.message || 'Sample not found. Please check your Booking ID or Sample ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      setSearchId(bookingId);
      fetchTracking(bookingId);
    }
  }, [bookingId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTracking(searchId);
  };

  const handleDownloadReport = async () => {
    if (sample?.reportId) {
      try {
        await downloadReportPdf(sample.reportId);
      } catch (downloadError) {
        console.error('Failed to download tracked report', downloadError);
        setError('Unable to download your report. Open My Laboratory Reports or contact the laboratory.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Live Sample & Report Tracking
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your biological sample through the full 8-stage clinical laboratory testing workflow.
        </p>
      </div>

      {/* Query Search */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Booking ID, Sample Barcode, or Specimen ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value.toUpperCase())}
          className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm uppercase font-mono font-bold focus:outline-none focus:border-blue-500 shadow-xs"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all shrink-0"
        >
          {loading ? 'Tracking...' : 'Track Sample'}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {sample && (
        <SampleTracker sample={sample} onDownloadReport={handleDownloadReport} />
      )}
    </div>
  );
}
