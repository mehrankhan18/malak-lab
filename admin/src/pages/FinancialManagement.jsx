import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DollarSign, Tag, TrendingUp, CreditCard, Receipt, Plus, X } from 'lucide-react';

export default function FinancialManagement() {
  const [stats, setStats] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Coupon Modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponTitle, setCouponTitle] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(15);
  const [minBookingAmount, setMinBookingAmount] = useState(50);
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  const fetchFinancials = async () => {
    try {
      const [statsRes, invRes, coupRes] = await Promise.all([
        api.get('/billing/stats'),
        api.get('/billing/invoices'),
        api.get('/billing/coupons'),
      ]);
      setStats(statsRes.data.stats || {});
      setInvoices(invRes.data.invoices || []);
      setCoupons(coupRes.data.coupons || []);
    } catch (err) {
      console.error('Failed to load financial data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setCreatingCoupon(true);
    try {
      await api.post('/billing/coupons', {
        code: couponCode.toUpperCase(),
        title: couponTitle,
        discountType,
        discountValue,
        minBookingAmount,
        validUntil: new Date('2028-12-31'),
      });
      setShowCouponModal(false);
      setCouponCode('');
      setCouponTitle('');
      fetchFinancials();
    } catch (err) {
      alert('Failed to create coupon code');
    } finally {
      setCreatingCoupon(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Financial Management & Revenue Accounting
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Daily, weekly, and monthly analytical income metrics, invoice journals, and discount coupon campaigns.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Net Collections</span>
          <span className="text-2xl font-black text-emerald-400 block">PKR {stats.totalRevenue?.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500">{stats.totalInvoices} Invoices Settled</span>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Today's Revenue</span>
          <span className="text-2xl font-black text-white block">PKR {stats.todayRevenue?.toLocaleString()}</span>
          <span className="text-[10px] text-blue-400">{stats.todayInvoicesCount || 0} Paid Today</span>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Past 7 Days Revenue</span>
          <span className="text-2xl font-black text-white block">PKR {stats.weekRevenue?.toLocaleString()}</span>
          <span className="text-[10px] text-teal-400">Trailing 7-Day Rolling</span>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">This Month's Revenue</span>
          <span className="text-2xl font-black text-white block">PKR {stats.monthRevenue?.toLocaleString()}</span>
          <span className="text-[10px] text-indigo-400">Current Month To Date</span>
        </div>
      </div>

      {/* Two Column Section: Coupons & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Promotional Coupons */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-400" />
              Promotional Coupons
            </h3>
            <button
              onClick={() => setShowCouponModal(true)}
              className="px-3 py-1 bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded-lg text-xs font-bold"
            >
              + Create
            </button>
          </div>

          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c._id} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-emerald-400 text-sm">{c.code}</span>
                  <span className="text-[10px] text-slate-400">{c.timesUsed} Uses</span>
                </div>
                <p className="font-semibold text-white">{c.title}</p>
                <span className="text-[10px] text-slate-400 block">
                  Discount: {c.discountType === 'percentage' ? `${c.discountValue}%` : `PKR ${c.discountValue}`} | Min: PKR {c.minBookingAmount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Invoices Master Journal */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-teal-400" />
              Master Invoices Journal
            </h3>
            <span className="text-xs text-slate-400">{invoices.length} Total Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Patient Name</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Grand Total</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invoices.slice(0, 10).map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-blue-400">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 font-bold text-white">{inv.customerName}</td>
                    <td className="py-3 px-3 text-slate-400">{new Date(inv.issuedDate || inv.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-slate-300 uppercase font-mono text-[10px]">{inv.paymentMethod}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">PKR {inv.grandTotal}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                        {inv.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Promotional Coupon</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Coupon Title / Campaign</label>
                <input
                  type="text"
                  required
                  placeholder="Summer Preventive Checkup Promo"
                  value={couponTitle}
                  onChange={(e) => setCouponTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Minimum Booking Order ($)</label>
                <input
                  type="number"
                  value={minBookingAmount}
                  onChange={(e) => setMinBookingAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCoupon}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  {creatingCoupon ? 'Creating...' : 'Deploy Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
