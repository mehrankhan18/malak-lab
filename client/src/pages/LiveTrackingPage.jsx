import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { downloadReportPdf } from '../services/reportDownloads';
import SampleTracker from '../components/SampleTracker';
import { Search, FileSearch, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LiveTrackingPage() {
  const [searchParams] = useSearchParams();
  const { id: routeId } = useParams();
  const initialQuery = searchParams.get('id') || routeId || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sample, setSample] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTracking = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/samples/track/${encodeURIComponent(q.trim())}`);
      setSample(res.data.sample);
    } catch (err) {
      setSample(null);
      setError(err.response?.data?.message || 'No tracking record found for this identifier.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchTracking(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (/^TCK-/i.test(searchQuery.trim())) {
      setSample(null);
      setError('That is a support ticket number, not a sample or report ID. Sign in and open Support & Inquiries to view it.');
      return;
    }
    if (/^MLR-/i.test(searchQuery.trim())) {
      setSample(null);
      setError('That is a test-request tracking number. Use the request tracking page to check price and availability status.');
      return;
    }
    fetchTracking(searchQuery);
  };

  const handleDownloadReport = async () => {
    if (sample?.reportId) {
      try {
        await downloadReportPdf(sample.reportId);
      } catch (downloadError) {
        console.error('Failed to download tracked report', downloadError);
        setError('Sign in to your patient account to download your report. It is also available in My Laboratory Reports.');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
          Real-Time Diagnostics Tracker
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Track Your Sample & Lab Report
        </h1>
        <p className="text-sm text-slate-500">
          Enter your Booking ID (LMS-…), Sample Barcode (BC…), or Specimen ID (SMP-…) to view sample progress. Published results are under My Laboratory Reports.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="flex items-center p-2 rounded-2xl bg-white border-2 border-slate-200 focus-within:border-blue-500 shadow-sm transition-all">
          <Search className="w-5 h-5 text-slate-400 ml-3" />
          <input
            type="text"
            placeholder="Enter Booking ID, Sample Barcode, or Specimen ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            className="w-full px-4 py-2.5 text-sm uppercase font-mono font-bold text-slate-800 focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <span>{error}</span>
            {/request tracking number/i.test(error) && (
              <Link to="/request-tracking" className="ml-1 font-bold underline">Check test request</Link>
            )}
            {/support ticket number/i.test(error) && (
              <Link to="/login" className="ml-1 font-bold underline">Sign in to Support & Inquiries</Link>
            )}
            {/sign in to your patient account/i.test(error) && (
              <Link to="/login" className="ml-1 font-bold underline">Sign in to download</Link>
            )}
          </div>
        </div>
      )}

      {/* Tracker Display */}
      {sample && (
        <SampleTracker sample={sample} onDownloadReport={handleDownloadReport} />
      )}
    </div>
  );
}
