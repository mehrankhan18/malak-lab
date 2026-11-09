import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const statusLabels = {
  pending_confirmation: 'Waiting for laboratory confirmation',
  confirmed: 'Price and availability confirmed',
  unavailable: 'Currently unavailable',
  appointment_booked: 'Appointment booked',
  completed: 'Request completed',
};

export default function CustomerRequests() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let active = true;
    api.get('/inquiries/my')
      .then((response) => {
        if (active) setInquiries(response.data.inquiries || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load your test requests.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [retryToken]);

  return (
    <div className="min-w-0 space-y-6">
      <header>
        <h1 className="text-2xl font-black text-slate-900">My Test Requests</h1>
        <p className="mt-1 text-sm text-slate-600">View price and availability requests you submitted while signed in. These are not appointments or test reports.</p>
      </header>

      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <span>{error}</span>
          <button type="button" onClick={() => { setLoading(true); setRetryToken((token) => token + 1); }} className="inline-flex items-center gap-2 font-bold">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3" aria-label="Loading test requests">
          <div className="h-36 animate-pulse rounded-3xl bg-slate-100" />
          <div className="h-36 animate-pulse rounded-3xl bg-slate-100" />
        </div>
      ) : inquiries.length === 0 && !error ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 font-bold text-slate-900">No saved requests yet</h2>
          <p className="mt-1 text-sm text-slate-600">When you send a test price request while signed in, it will appear here.</p>
          <Link to="/tests" className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Browse tests</Link>
        </section>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <article key={inquiry._id} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Request tracking number</p>
                  <h2 className="mt-1 font-mono text-lg font-black text-blue-700">{inquiry.trackingId}</h2>
                  <p className="mt-1 text-xs text-slate-500">Submitted {new Date(inquiry.createdAt).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                  {statusLabels[inquiry.status] || inquiry.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Selected tests / packages</p>
                <ol className="mt-2 space-y-2">
                  {inquiry.items.map((item, index) => (
                    <li key={`${item.itemType}-${item.itemId}`} className="flex gap-3 text-sm text-slate-800">
                      <span className="font-mono font-bold text-blue-700">{String(index + 1).padStart(2, '0')}</span>
                      <span>{item.name}{item.code ? <span className="ml-2 text-xs text-slate-500">({item.code})</span> : null}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-600">Report preference: <strong>{inquiry.reportDelivery === 'online' ? 'Online' : 'Physical collection'}</strong></p>
                {inquiry.confirmedPrice != null && <p className="text-sm font-bold text-slate-800">Confirmed price: PKR {Number(inquiry.confirmedPrice).toLocaleString('en-PK')}</p>}
              </div>
              {inquiry.labResponse && <p className="whitespace-pre-wrap rounded-xl bg-blue-50 p-3 text-sm text-blue-950"><strong>Laboratory response:</strong> {inquiry.labResponse}</p>}
              <p className="text-xs text-slate-500">After the lab confirms and testing is booked and completed, your published result will appear under My Laboratory Reports.</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
