import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle2, 
  X, 
  Truck,
  Edit
} from 'lucide-react';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Status Change Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [targetStatus, setTargetStatus] = useState('confirmed');
  const [targetPayment, setTargetPayment] = useState('paid');
  const [targetBranch, setTargetBranch] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchBookings = async () => {
    try {
      const [bookRes, branchRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/branches'),
      ]);
      setBookings(bookRes.data.bookings || []);
      setBranches(branchRes.data.branches || []);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenEdit = (b) => {
    setSelectedBooking(b);
    setTargetStatus(b.bookingStatus);
    setTargetPayment(b.paymentStatus);
    setTargetBranch(b.branchId?._id || (branches[0]?._id || ''));
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setUpdating(true);
    try {
      await api.put(`/bookings/${selectedBooking._id}/status`, {
        bookingStatus: targetStatus,
        paymentStatus: targetPayment,
        branchId: targetBranch || null,
      });
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      alert('Failed to update booking status');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = bookings.filter(b => {
    const matchesSearch = b.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      b.patientDetails?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      b.patientDetails?.phone?.includes(search);
    const matchesStatus = !statusFilter || b.bookingStatus === statusFilter;
    const matchesDate = !dateFilter || new Date(b.appointmentDate).toISOString().split('T')[0] === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Master Booking & Appointment Operations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter by scheduled date, assign branch diagnostic centers, and manage sample collector dispatches.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Booking ID, Patient Name, or Mobile Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Patient Information</th>
                <th className="py-3 px-4">Date & Time Slot</th>
                <th className="py-3 px-4">Mode / Branch</th>
                <th className="py-3 px-4">Amount / Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((b) => (
                <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                    {b.bookingId}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{b.patientDetails?.fullName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{b.patientDetails?.phone}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-200 block">
                      {new Date(b.appointmentDate).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[140px] block">
                      {b.timeSlot}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 block w-max">
                      {b.collectionType.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-teal-400 block mt-0.5">
                      {b.branchId?.name || 'Home Phlebotomy'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-white block">PKR {b.totalAmount}</span>
                    <span className={`text-[10px] uppercase font-bold ${
                      b.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-blue-400'
                    }`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${
                      b.bookingStatus === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : b.bookingStatus === 'cancelled'
                          ? 'bg-rose-500/20 text-rose-400'
                          : b.bookingStatus === 'rescheduled'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold transition-all"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Booking Status Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Manage Booking #{selectedBooking.bookingId}</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBooking} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Booking Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Payment Status</label>
                <select
                  value={targetPayment}
                  onChange={(e) => setTargetPayment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Assigned Diagnostic Branch</label>
                <select
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold"
                >
                  <option value="">No Specific Branch (Home Dispatch)</option>
                  {branches.map((br) => (
                    <option key={br._id} value={br._id}>{br.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-md"
                >
                  {updating ? 'Saving...' : 'Update Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
