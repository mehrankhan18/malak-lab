import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, Download, CheckCircle2, Receipt, Printer } from 'lucide-react';

export default function CustomerInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get('/billing/invoices/my');
        setInvoices(res.data.invoices || []);
      } catch (err) {
        console.error('Failed to load invoices', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Invoices & Payment History
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review itemized billing receipts for your laboratory bookings and diagnostic tests.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
          <Receipt className="w-12 h-12 mx-auto text-slate-200 stroke-1" />
          <h4 className="text-base font-bold text-slate-700">No Invoices Found</h4>
          <p className="text-xs text-slate-400">
            Payment records and receipts will be cataloged here once you book an appointment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div
              key={inv._id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-slate-900">{inv.invoiceNumber}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                    {inv.paymentStatus}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Issued: {new Date(inv.issuedDate || inv.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 text-xs">
                {(inv.items || []).map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-700">
                    <span>{it.description}</span>
                    <span className="font-semibold text-slate-900">PKR {it.total}</span>
                  </div>
                ))}
                {inv.homeCollectionFee > 0 && (
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Phlebotomy Collection Fee</span>
                    <span>PKR {inv.homeCollectionFee}</span>
                  </div>
                )}
                {inv.discount > 0 && (
                  <div className="flex justify-between items-center text-blue-600 font-bold">
                    <span>Discount Coupon Applied</span>
                    <span>-PKR {inv.discount}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500">
                  Method: <strong className="text-slate-800 uppercase">{inv.paymentMethod}</strong>
                  {inv.transactionId && <span className="block font-mono text-[10px] text-slate-400">{inv.transactionId}</span>}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid</span>
                  <span className="text-lg font-black text-slate-900">PKR {inv.grandTotal}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
