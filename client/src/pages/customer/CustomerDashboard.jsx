import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { downloadReportPdf } from '../../services/reportDownloads';
import { useAuth } from '../../context/AuthContext';
import { 
  CalendarCheck, 
  FileText, 
  FileSearch, 
  CreditCard, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Download, 
  MapPin,
  FlaskConical,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [reports, setReports] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);
  const [downloadingReportId, setDownloadingReportId] = useState('');

  const handleDownloadReport = async (reportId) => {
    setDownloadingReportId(reportId);
    try {
      await downloadReportPdf(reportId);
    } catch (error) {
      console.error('Failed to download laboratory report', error);
      alert('Unable to download this report. Please sign in again or contact the laboratory.');
    } finally {
      setDownloadingReportId('');
    }
  };

  useEffect(() => {
    let active = true;
    const loadCustomerData = async () => {
      setLoading(true);
      setLoadError('');
      const results = await Promise.allSettled([
        api.get('/bookings/my'),
        api.get('/reports/customer'),
        api.get('/billing/invoices/my'),
      ]);
      if (!active) return;

      const [bookingsResult, reportsResult, invoicesResult] = results;
      const failedRequests = [];
      if (bookingsResult.status === 'fulfilled') {
        setBookings(bookingsResult.value.data.bookings || []);
      } else {
        failedRequests.push('bookings');
      }
      if (reportsResult.status === 'fulfilled') {
        setReports(reportsResult.value.data.reports || []);
      } else {
        failedRequests.push('reports');
      }
      if (invoicesResult.status === 'fulfilled') {
        setInvoices(invoicesResult.value.data.invoices || []);
      } else {
        failedRequests.push('invoices');
      }
      if (failedRequests.length) {
        setLoadError(`Could not load your ${failedRequests.join(', ')}. Please retry.`);
      }
      setLoading(false);
    };
    loadCustomerData();
    return () => { active = false; };
  }, [refreshToken]);

  const latestBooking = bookings[0];
  const activeAppointments = bookings.filter((booking) => (
    ['confirmed', 'rescheduled'].includes(booking.bookingStatus)
  )).length;
  const paidInvoices = invoices.filter((invoice) => invoice.paymentStatus === 'paid').length;

  return (
    <div className="min-w-0 space-y-8">
      {loadError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{loadError}</span>
          <button
            type="button"
            onClick={() => setRefreshToken((token) => token + 1)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      )}
      {/* Welcome Banner */}
      <div className="min-w-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-md shadow-blue-600/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block">
            Welcome to MALAK Lab
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">
            Hello, {user?.name || 'Patient'}
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-lg">
            Track your specimen journey from home phlebotomy to certified pathologist electronic verification.
          </p>
        </div>

        <Link
          to="/book-test"
          className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-blue-50 transition-colors shrink-0 flex items-center gap-2"
        >
          <CalendarCheck className="w-4 h-4 text-blue-600" />
          Book New Test
        </Link>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
        <div className="min-w-0 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 block">{loading ? '—' : bookings.length}</span>
            <span className="text-[11px] text-slate-400 font-medium">Total Bookings</span>
          </div>
        </div>

        <div className="min-w-0 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 block">{loading ? '—' : reports.length}</span>
            <span className="text-[11px] text-slate-400 font-medium">Ready Reports</span>
          </div>
        </div>

        <div className="min-w-0 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 block">
              {loading ? '—' : activeAppointments}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Active Appointments</span>
          </div>
        </div>

        <div className="min-w-0 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 block">{loading ? '—' : paidInvoices}</span>
            <span className="text-[11px] text-slate-400 font-medium">Paid Invoices</span>
          </div>
        </div>
      </div>

      {/* Latest Booking Live Banner */}
      {latestBooking && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Latest Appointment
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Booking Reference: <span className="font-mono text-blue-700">{latestBooking.bookingId}</span>
              </h3>
            </div>
            <Link
              to={`/customer/track/${latestBooking.bookingId}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <FileSearch className="w-3.5 h-3.5" />
              Live 8-Stage Tracker
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Appointment Date & Time</span>
              <span className="font-semibold text-slate-800">
                {new Date(latestBooking.appointmentDate).toDateString()} ({latestBooking.timeSlot})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Collection Mode</span>
              <span className="font-semibold text-slate-800 uppercase">
                {latestBooking.collectionType.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Booking Status</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-blue-100 text-blue-800 mt-0.5">
                {latestBooking.bookingStatus}
              </span>
            </div>
          </div>
        </div>
      )}
      {!loading && !loadError && bookings.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <CalendarCheck className="mx-auto h-8 w-8 text-blue-500" />
          <h3 className="mt-3 font-bold text-slate-900">No bookings yet</h3>
          <p className="mt-1 text-sm text-slate-500">Choose a laboratory test to start a booking.</p>
          <Link to="/tests" className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
            Browse tests
          </Link>
        </div>
      )}

      {/* Recent Laboratory Reports Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Verified Laboratory Reports
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Electronically certified medical documents with pathologist signatures.
            </p>
          </div>

          <Link to="/customer/reports" className="text-xs font-bold text-blue-600 hover:underline">
            View All Reports →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3" aria-label="Loading reports">
            <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No published laboratory reports yet. Completed test results will appear here automatically.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.slice(0, 5).map((rep) => (
              <div
                key={rep._id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{rep.testName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                      {rep.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                    <span>ID: {rep.reportId}</span>
                    <span>•</span>
                    <span>Specimen: {rep.sampleType}</span>
                    <span>•</span>
                    <span>Certified by: {rep.pathologistName || 'Consultant Pathologist'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadReport(rep.reportId)}
                  disabled={downloadingReportId === rep.reportId}
                  className="px-4 py-2 bg-white hover:bg-blue-50 border border-slate-200 text-blue-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>{downloadingReportId === rep.reportId ? 'Downloading…' : 'Download Verified PDF'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
