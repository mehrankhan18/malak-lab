import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import api from '../services/api';

const statusLabels = {
  pending_confirmation: 'Waiting for laboratory confirmation',
  confirmed: 'Price and availability confirmed',
  unavailable: 'Currently unavailable',
  appointment_booked: 'Appointment booked',
  completed: 'Request completed',
};

export default function RequestTracking() {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('tracking') || '');
  const [phone, setPhone] = useState('');
  const [inquiry, setInquiry] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTrackingId(searchParams.get('tracking') || '');
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setInquiry(null);
    try {
      const response = await api.get(`/inquiries/${encodeURIComponent(trackingId.trim())}`, {
        params: { phone },
      });
      setInquiry(response.data.inquiry);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not find this request. Check the tracking number and phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/tests" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600">
        <ArrowLeft className="h-4 w-4" /> Browse tests
      </Link>
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Request tracking</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Check your test request</h1>
        <p className="mt-2 text-sm text-slate-600">Enter the tracking number from WhatsApp and the phone number used for your request.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700">
          Tracking number
          <input
            required
            value={trackingId}
            onChange={(event) => setTrackingId(event.target.value.toUpperCase())}
            placeholder="MLR-20261109-1234ABCD"
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm uppercase"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Phone / WhatsApp number
          <input
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            placeholder="Enter the phone number used for the request"
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
        </label>
        {error && <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>}
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
          <Search className="h-4 w-4" /> {loading ? 'Checking…' : 'Check request'}
        </button>
      </form>

      {inquiry && (
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Patient</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">{inquiry.patientName}</h2>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 font-mono text-sm font-bold text-blue-800">{inquiry.trackingId}</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Request status</p>
            <p className="mt-1 font-bold text-slate-900">{statusLabels[inquiry.status] || inquiry.status}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected tests / packages</p>
            <ol className="mt-2 space-y-2">
              {inquiry.items.map((item, index) => (
                <li key={`${item.itemType}-${item.itemId}`} className="flex gap-3 text-sm text-slate-800">
                  <span className="font-mono font-bold text-blue-700">{String(index + 1).padStart(2, '0')}</span>
                  <span>{item.name}{item.code ? <span className="ml-2 text-xs text-slate-500">({item.code})</span> : null}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="text-sm text-slate-600">Report preference: {inquiry.reportDelivery === 'online' ? 'Online' : 'Physical collection'}</p>
          {inquiry.confirmedPrice != null && (
            <p className="text-sm font-semibold text-slate-800">Confirmed price: PKR {Number(inquiry.confirmedPrice).toLocaleString('en-PK')}</p>
          )}
          {inquiry.labResponse && (
            <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-950">
              <p className="font-bold">Laboratory response</p>
              <p className="mt-1 whitespace-pre-wrap">{inquiry.labResponse}</p>
            </div>
          )}
          <p className="text-xs text-slate-500">This tracks your price and availability request. It becomes a test booking only after the laboratory confirms and an appointment is arranged.</p>
        </section>
      )}
    </main>
  );
}
