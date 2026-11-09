import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  FileSearch, 
  Calendar, 
  X, 
  AlertCircle, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const TIME_SLOTS = [
  '06:30 AM - 07:30 AM (Fasting Slot)',
  '07:30 AM - 08:30 AM (Fasting Slot)',
  '08:30 AM - 09:30 AM (Fasting Slot)',
  '09:30 AM - 10:30 AM',
  '11:00 AM - 12:00 PM',
  '02:00 PM - 03:00 PM',
  '04:00 PM - 05:00 PM',
  '05:30 PM - 06:30 PM',
];

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reschedule Modal
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState(TIME_SLOTS[0]);
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Cancel Modal
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate) return;
    setActionLoading(true);
    try {
      await api.put(`/bookings/${rescheduleBookingId}/reschedule`, {
        appointmentDate: newDate,
        timeSlot: newSlot,
        reason: rescheduleReason,
      });
      setActionSuccess('Appointment successfully rescheduled!');
      setRescheduleBookingId(null);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put(`/bookings/${cancelBookingId}/cancel`, {
        reason: cancelReason || 'Cancelled by customer',
      });
      setActionSuccess('Booking has been cancelled.');
      setCancelBookingId(null);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          My Test Appointments & Bookings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review appointment history, live tracking, and reschedule or cancel appointments.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-blue-600 font-bold">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
          <CalendarCheck className="w-12 h-12 mx-auto text-slate-200 stroke-1" />
          <h4 className="text-base font-bold text-slate-700">No Bookings Yet</h4>
          <p className="text-xs text-slate-400">
            Book medical tests or executive health packages to see your appointments here.
          </p>
          <Link to="/book-test" className="inline-block mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs">
            Book a Test Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-blue-600">{b.bookingId}</span>
                  {b.patientNumber && <span className="text-[11px] font-mono font-bold text-slate-500">Patient ID: {b.patientNumber}</span>}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    b.bookingStatus === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : b.bookingStatus === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : b.bookingStatus === 'rescheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-blue-100 text-blue-800'
                  }`}>
                    {b.bookingStatus}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/customer/track/${b.bookingId}`}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    Track Sample
                  </Link>

                  {b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'completed' && (
                    <>
                      <button
                        onClick={() => {
                          setRescheduleBookingId(b._id);
                          setNewDate(new Date(b.appointmentDate).toISOString().split('T')[0]);
                          setNewSlot(b.timeSlot);
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => setCancelBookingId(b._id)}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tests Included:</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {b.items.map((it, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800">
                      {String(idx + 1).padStart(2, '0')}. {it.itemName} (PKR {it.price})
                    </span>
                  ))}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
                  <span className="font-semibold text-slate-800">{b.patientDetails.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Slot</span>
                  <span className="font-semibold text-slate-800">{new Date(b.appointmentDate).toLocaleDateString()}</span>
                  <span className="block text-[10px] text-slate-400 truncate">{b.timeSlot}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Collection Type</span>
                  <span className="font-semibold text-slate-800 uppercase">{b.collectionType.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid</span>
                  <span className="font-bold text-slate-900">PKR {b.totalAmount} ({b.paymentStatus.toUpperCase()})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Reschedule Appointment</h3>
              <button onClick={() => setRescheduleBookingId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">New Appointment Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Preferred Time Slot</label>
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                >
                  {TIME_SLOTS.map((slot, i) => (
                    <option key={i} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Rescheduling (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule conflict, traveling"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleBookingId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  {actionLoading ? 'Saving...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Cancel Appointment</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this booking? If you have paid online, a full refund will be processed to your account within 24-48 hours.
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Cancellation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Test performed elsewhere, change of doctor"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelBookingId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold"
                >
                  {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
