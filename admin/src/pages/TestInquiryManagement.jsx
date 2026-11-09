import React, { useEffect, useMemo, useState } from 'react';
import { MessageSquareText, Search, Save, CalendarPlus, X } from 'lucide-react';
import api from '../services/api';

const statuses = [
  ['pending_confirmation', 'Waiting for confirmation'],
  ['confirmed', 'Confirmed'],
  ['unavailable', 'Unavailable'],
  ['appointment_booked', 'Appointment booked'],
  ['completed', 'Completed'],
];

export default function TestInquiryManagement() {
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');
  const [drafts, setDrafts] = useState({});
  const [bookingInquiry, setBookingInquiry] = useState(null);
  const [branches, setBranches] = useState([]);
  const [bookingDraft, setBookingDraft] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchInquiries = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/inquiries');
      setInquiries(response.data.inquiries || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load test requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInquiries(); }, []);

  const filtered = useMemo(() => inquiries.filter((inquiry) => {
    const needle = search.trim().toLowerCase();
    const matchesText = !needle
      || inquiry.trackingId.toLowerCase().includes(needle)
      || inquiry.patientName.toLowerCase().includes(needle)
      || inquiry.phone.includes(search.replace(/\D/g, ''))
      || inquiry.items.some((item) => item.name.toLowerCase().includes(needle) || item.code.toLowerCase().includes(needle));
    return matchesText && (!statusFilter || inquiry.status === statusFilter);
  }), [inquiries, search, statusFilter]);

  const getDraft = (inquiry) => drafts[inquiry._id] || {
    status: inquiry.status,
    confirmedPrice: inquiry.confirmedPrice ?? '',
    labResponse: inquiry.labResponse || '',
  };

  const updateDraft = (inquiry, patch) => {
    setDrafts((current) => ({
      ...current,
      [inquiry._id]: { ...getDraft(inquiry), ...patch },
    }));
  };

  const saveInquiry = async (inquiry) => {
    const draft = getDraft(inquiry);
    setSavingId(inquiry._id);
    setError('');
    try {
      const response = await api.patch(`/admin/inquiries/${inquiry._id}`, draft);
      setInquiries((current) => current.map((item) => item._id === inquiry._id ? response.data.inquiry : item));
      setDrafts((current) => {
        const next = { ...current };
        delete next[inquiry._id];
        return next;
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save this request.');
    } finally {
      setSavingId('');
    }
  };

  const openBookingForm = async (inquiry) => {
    setBookingError('');
    setNotice('');
    try {
      const response = await api.get('/branches');
      setBranches(response.data.branches || []);
      setBookingInquiry(inquiry);
      setBookingDraft({
        age: '',
        gender: '',
        appointmentDate: '',
        timeSlot: '',
        collectionType: 'branch_visit',
        branchId: response.data.branches?.find((branch) => branch.isActive)?._id || '',
        address: { street: '', city: '', state: '', zipCode: '' },
        itemPrices: inquiry.items.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          price: inquiry.items.length === 1 && inquiry.confirmedPrice != null ? String(inquiry.confirmedPrice) : '',
        })),
      });
    } catch (requestError) {
      setBookingError(requestError.response?.data?.message || 'Could not load branches. Please try again.');
    }
  };

  const updateBookingDraft = (patch) => {
    setBookingDraft((current) => ({ ...current, ...patch }));
  };

  const updateItemPrice = (itemId, price) => {
    setBookingDraft((current) => ({
      ...current,
      itemPrices: current.itemPrices.map((item) => item.itemId === itemId ? { ...item, price } : item),
    }));
  };

  const createBooking = async (event) => {
    event.preventDefault();
    if (!bookingInquiry || !bookingDraft) return;
    setCreatingBooking(true);
    setBookingError('');
    try {
      const response = await api.post(`/admin/inquiries/${bookingInquiry._id}/booking`, bookingDraft);
      setInquiries((current) => current.map((inquiry) => inquiry._id === bookingInquiry._id
        ? { ...inquiry, status: 'appointment_booked', bookingId: response.data.booking._id }
        : inquiry));
      setNotice(response.data.message);
      setBookingInquiry(null);
      setBookingDraft(null);
      await fetchInquiries();
    } catch (requestError) {
      setBookingError(requestError.response?.data?.message || 'Could not create booking. Check the details and try again.');
    } finally {
      setCreatingBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-white">Test Price & Availability Requests</h1>
        <p className="mt-1 text-xs text-slate-400">Review WhatsApp requests, confirm prices and availability, and create appointments after catalogue tests are marked available.</p>
      </header>

      {notice && <p role="status" className="rounded-xl border border-emerald-900 bg-emerald-950/50 p-3 text-sm text-emerald-300">{notice}</p>}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tracking number, patient, phone, or test" className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none" />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200">
          <option value="">All statuses</option>
          {statuses.map(([value, label]) => <option key={value} value={value} disabled={value === 'appointment_booked'}>{label}</option>)}
        </select>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-900 bg-rose-950/50 p-3 text-sm text-rose-300">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full min-w-[1050px] text-left text-xs">
          <thead className="bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="p-4">Tracking / Patient</th>
              <th className="p-4">Requested items</th>
              <th className="p-4">Report preference</th>
              <th className="p-4">Status and response</th>
              <th className="p-4">Confirmed price</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading requests…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-400">No matching test requests.</td></tr>
            ) : filtered.map((inquiry) => {
              const draft = getDraft(inquiry);
              return (
                <tr key={inquiry._id} className="align-top text-slate-200">
                  <td className="space-y-1 p-4">
                    <p className="font-mono font-bold text-blue-400">{inquiry.trackingId}</p>
                    <p className="font-bold text-white">{inquiry.patientName}</p>
                    <p className="text-slate-400">{inquiry.phone}</p>
                    <p className="text-[10px] text-slate-500">{new Date(inquiry.createdAt).toLocaleString()}</p>
                  </td>
                  <td className="max-w-xs p-4">
                    <ol className="space-y-1">
                      {inquiry.items.map((item, index) => (
                        <li key={`${item.itemType}-${item.itemId}`}><span className="mr-2 font-mono text-blue-400">{String(index + 1).padStart(2, '0')}</span>{item.name}</li>
                      ))}
                    </ol>
                  </td>
                  <td className="p-4">{inquiry.reportDelivery === 'online' ? 'Online' : 'Physical collection'}</td>
                  <td className="min-w-[280px] space-y-2 p-4">
                    <select value={draft.status} disabled={Boolean(inquiry.bookingId)} onChange={(event) => updateDraft(inquiry, { status: event.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white disabled:opacity-60">
                      {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <textarea value={draft.labResponse} onChange={(event) => updateDraft(inquiry, { labResponse: event.target.value })} maxLength={1000} rows={2} placeholder="Message shown to patient on request tracking" className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500" />
                  </td>
                  <td className="space-y-2 p-4">
                    <input type="number" min="0" step="0.01" value={draft.confirmedPrice} onChange={(event) => updateDraft(inquiry, { confirmedPrice: event.target.value })} placeholder="Not confirmed" className="w-32 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white" />
                    <button onClick={() => saveInquiry(inquiry)} disabled={savingId === inquiry._id || Boolean(inquiry.bookingId)} className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 font-bold text-white hover:bg-slate-600 disabled:opacity-50">
                      <Save className="h-3.5 w-3.5" />{savingId === inquiry._id ? 'Saving…' : 'Save update'}
                    </button>
                  </td>
                  <td className="p-4">
                    {inquiry.bookingId ? (
                      <span className="text-emerald-400">Booked</span>
                    ) : inquiry.status === 'confirmed' && inquiry.confirmedPrice != null ? (
                      <button onClick={() => openBookingForm(inquiry)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 font-bold text-white hover:bg-blue-700">
                        <CalendarPlus className="h-3.5 w-3.5" />Create booking
                      </button>
                    ) : (
                      <span className="text-slate-500">Confirm quote first</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="flex items-center gap-2 text-xs text-slate-500"><MessageSquareText className="h-4 w-4" />Patients check updates using their tracking number and the phone number on the request.</p>

      {bookingInquiry && bookingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" role="presentation">
          <form onSubmit={createBooking} className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Create booking from request</h2>
                <p className="mt-1 text-xs text-slate-400">{bookingInquiry.trackingId} · {bookingInquiry.patientName} · {bookingInquiry.phone}</p>
              </div>
              <button type="button" onClick={() => { setBookingInquiry(null); setBookingDraft(null); }} aria-label="Close booking form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="rounded-xl border border-amber-900/70 bg-amber-950/30 p-3 text-xs text-amber-200">
              This request came from WhatsApp. Requested tests must be marked available in Test Catalog & Pricing. The booking will be managed by staff and will not appear in a patient portal unless the patient has a linked account.
            </p>
            {bookingError && <p role="alert" className="rounded-xl border border-rose-900 bg-rose-950/50 p-3 text-sm text-rose-300">{bookingError}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs font-semibold">Patient age
                <input type="number" min="1" max="120" required value={bookingDraft.age} onChange={(event) => updateBookingDraft({ age: event.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
              </label>
              <label className="space-y-1 text-xs font-semibold">Gender
                <select required value={bookingDraft.gender} onChange={(event) => updateBookingDraft({ gender: event.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="space-y-1 text-xs font-semibold">Appointment date
                <input type="date" min={new Date().toISOString().slice(0, 10)} required value={bookingDraft.appointmentDate} onChange={(event) => updateBookingDraft({ appointmentDate: event.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
              </label>
              <label className="space-y-1 text-xs font-semibold">Appointment time
                <input type="text" required minLength="3" maxLength="100" placeholder="e.g. 09:00 AM - 10:00 AM" value={bookingDraft.timeSlot} onChange={(event) => updateBookingDraft({ timeSlot: event.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
              </label>
              <label className="space-y-1 text-xs font-semibold">Collection method
                <select value={bookingDraft.collectionType} onChange={(event) => updateBookingDraft({ collectionType: event.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
                  <option value="branch_visit">Visit a branch</option>
                  <option value="home_collection">Home collection</option>
                </select>
              </label>
              {bookingDraft.collectionType === 'branch_visit' && (
                <label className="space-y-1 text-xs font-semibold">Branch
                  <select required value={bookingDraft.branchId} onChange={(event) => updateBookingDraft({ branchId: event.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
                    <option value="">Select branch</option>
                    {branches.filter((branch) => branch.isActive).map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}
                  </select>
                </label>
              )}
            </div>

            {bookingDraft.collectionType === 'home_collection' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-semibold sm:col-span-2">Street address
                  <input required minLength="3" value={bookingDraft.address.street} onChange={(event) => updateBookingDraft({ address: { ...bookingDraft.address, street: event.target.value } })} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
                </label>
                <label className="space-y-1 text-xs font-semibold">City
                  <input required minLength="2" value={bookingDraft.address.city} onChange={(event) => updateBookingDraft({ address: { ...bookingDraft.address, city: event.target.value } })} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
                </label>
                <label className="space-y-1 text-xs font-semibold">Area / landmark (optional)
                  <input value={bookingDraft.address.state} onChange={(event) => updateBookingDraft({ address: { ...bookingDraft.address, state: event.target.value } })} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
                </label>
              </div>
            )}

            <fieldset className="space-y-2">
              <legend className="text-xs font-bold">Confirm price for each item (PKR)</legend>
              {bookingDraft.itemPrices.map((item) => (
                <label key={item.itemId} className="flex items-center justify-between gap-3 rounded-lg bg-slate-950 p-3 text-xs">
                  <span>{item.name}</span>
                  <input type="number" min="0" step="0.01" required value={item.price} onChange={(event) => updateItemPrice(item.itemId, event.target.value)} className="w-36 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
                </label>
              ))}
              <p className="text-[11px] text-slate-400">Item prices must add up to the confirmed quote of PKR {bookingInquiry.confirmedPrice}. Applicable home-collection fee is added separately.</p>
            </fieldset>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setBookingInquiry(null); setBookingDraft(null); }} className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800">Cancel</button>
              <button type="submit" disabled={creatingBooking} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                {creatingBooking ? 'Creating booking…' : 'Create booking'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
