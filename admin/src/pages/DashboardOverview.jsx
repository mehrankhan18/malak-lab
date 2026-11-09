import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  CalendarCheck, 
  Users, 
  FlaskConical, 
  FileCheck2, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function DashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const weekly = data?.weeklyTrends || [];
  const recentBookings = data?.recentBookings || [];
  const recentActivities = data?.recentActivities || [];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Executive Laboratory Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time analytical metrics, active accessioned specimens, and financial performance.
        </p>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total Revenue</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-white">PKR {stats.totalRevenue?.toLocaleString()}</span>
            <span className="text-[11px] text-emerald-400 block mt-1 font-semibold">● Real database collections</span>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total Bookings</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{stats.totalBookings}</span>
            <span className="text-[11px] text-blue-400 block mt-1 font-semibold">{stats.todayBookings} booked today</span>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Pending Reports</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{stats.pendingReports}</span>
            <span className="text-[11px] text-blue-400 block mt-1 font-semibold">Awaiting results / review</span>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Certified Reports</span>
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{stats.completedReports}</span>
            <span className="text-[11px] text-teal-400 block mt-1 font-semibold">Signed by Pathologists</span>
          </div>
        </div>
      </div>

      {/* Weekly Trends Chart Visualizer */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              7-Day Specimen Inflow & Revenue Analytics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily comparative volume of appointments booked and financial accruals.
            </p>
          </div>
        </div>

        {/* CSS Flex Bar Chart */}
        <div className="grid grid-cols-7 gap-3 pt-6 items-end h-56 border-b border-slate-800 pb-2">
          {weekly.map((day, idx) => {
            const heightPercent = Math.min(100, Math.max(15, (day.revenue / (stats.totalRevenue || 1)) * 300));
            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  PKR {day.revenue}
                </span>
                <div 
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[48px] bg-gradient-to-t from-blue-600 to-teal-400 rounded-t-xl group-hover:brightness-110 transition-all shadow-sm"
                />
                <span className="text-[11px] font-bold text-slate-400 text-center truncate w-full">
                  {day.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Recent Bookings & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Recent Patient Appointments</h3>
            <Link to="/bookings" className="text-xs font-bold text-blue-400 hover:underline">
              View All Bookings →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Booking ID</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-blue-400">{b.bookingId}</td>
                    <td className="py-3 px-3 font-bold text-white">{b.patientDetails.fullName}</td>
                    <td className="py-3 px-3 text-slate-400">{new Date(b.appointmentDate).toLocaleDateString()}</td>
                    <td className="py-3 px-3 font-mono text-white font-bold">PKR {b.totalAmount}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        b.bookingStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Activity Stream (1 Col) */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Security Audit Log
            </h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {recentActivities.map((act, i) => (
              <div key={i} className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-300 font-mono text-[11px]">{act.action}</span>
                  <span className="text-[10px] text-slate-500">{new Date(act.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  By <strong className="text-white">{act.performedByName}</strong> ({act.performedByRole})
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
