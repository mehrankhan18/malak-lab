import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, MessageCircle, PhoneCall } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getMalakWhatsAppUrl, MALAK_LAB_PHONE, MALAK_LAB_PHONE_LINK } from '../utils/contact';

export default function PriceRequest() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedTest = searchParams.get('test');
  const [directTest, setDirectTest] = useState(null);
  const [testError, setTestError] = useState('');
  const [loadingTest, setLoadingTest] = useState(false);
  const [patientName, setPatientName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [reportDelivery, setReportDelivery] = useState('online');
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [savedInquiry, setSavedInquiry] = useState(null);
  const [whatsappFallbackUrl, setWhatsappFallbackUrl] = useState('');

  useEffect(() => {
    if (user?.name) setPatientName((current) => current || user.name);
    if (user?.phone) setPhone((current) => current || user.phone);
  }, [user]);

  useEffect(() => {
    let active = true;
    if (!requestedTest) {
      setDirectTest(null);
      setTestError('');
      setLoadingTest(false);
      return () => { active = false; };
    }

    setLoadingTest(true);
    setTestError('');
    api.get(`/tests/${encodeURIComponent(requestedTest)}`)
      .then((response) => {
        if (active) setDirectTest(response.data.test);
      })
      .catch((error) => {
        if (active) {
          setDirectTest(null);
          setTestError(error.response?.data?.message || 'Could not load the requested test. Try selecting it again from the catalogue.');
        }
      })
      .finally(() => {
        if (active) setLoadingTest(false);
      });

    return () => { active = false; };
  }, [requestedTest]);

  const directTestIsSeparate = Boolean(directTest && !cart.some((item) => item.id === directTest._id));
  const requestItems = [
    ...(directTestIsSeparate ? [{
      itemId: directTest._id,
      itemType: 'test',
      name: directTest.name,
      code: directTest.code,
    }] : []),
    ...cart.map((item) => ({
      itemId: item.id,
      itemType: item.type === 'package' ? 'package' : 'test',
      name: item.name,
      code: item.code,
    })),
  ];

  const handleCreateRequest = async (event) => {
    event.preventDefault();
    if (requesting || savedInquiry || requestItems.length === 0) return;
    setRequesting(true);
    setRequestError('');
    setWhatsappFallbackUrl('');

    const whatsappWindow = window.open('about:blank', '_blank');
    try {
      const response = await api.post('/inquiries', {
        patientName,
        phone,
        reportDelivery,
        items: requestItems.map(({ itemId, itemType }) => ({ itemId, itemType })),
      });
      const inquiry = response.data.inquiry;
      const message = [
        'Assalam-o-Alaikum MALAK Lab Science Hub,',
        `Request tracking number: ${inquiry.trackingId}`,
        `Patient name: ${inquiry.patientName}`,
        `Contact number: ${phone}`,
        `Report delivery preference: ${reportDelivery === 'online' ? 'Online' : 'Physical collection'}`,
        '',
        'Please confirm price and availability for:',
        ...inquiry.items.map((item, index) => `${String(index + 1).padStart(2, '0')}. ${item.name}${item.code ? ` (${item.code})` : ''}`),
        '',
        'Please update this request using its tracking number. I understand this request is not yet a booking.',
      ].join('\n');
      const whatsappUrl = getMalakWhatsAppUrl(message);

      setSavedInquiry(inquiry);
      setWhatsappFallbackUrl(whatsappUrl);
      if (whatsappWindow) {
        whatsappWindow.opener = null;
        whatsappWindow.location.href = whatsappUrl;
      }
    } catch (error) {
      if (whatsappWindow) whatsappWindow.close();
      setRequestError(error.response?.data?.message || 'Could not save your request. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link to="/tests" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4" />
        Continue browsing tests
      </Link>

      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 p-8 sm:p-12 text-white shadow-xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-300/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-200">
          <MessageCircle className="w-4 h-4" />
          MALAK Lab · Timergara
        </span>
        <h1 className="mt-5 max-w-2xl text-3xl sm:text-5xl font-black tracking-tight">
          Confirm your test prices directly with the lab.
        </h1>
        <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-200">
          Request current prices and availability directly from the laboratory. No payment or appointment is made from this request.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Your selected tests</h2>
              <p className="mt-1 text-sm text-slate-500">The lab will confirm actual rates and availability.</p>
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs font-bold text-rose-600 hover:underline">
                Clear list
              </button>
            )}
          </div>

          {cart.length === 0 && !directTest && !loadingTest ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-600">{testError || 'Your list is empty. Browse the catalog to request test availability or select bookable items.'}</p>
              <Link to="/tests" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                Browse tests <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-slate-100">
              {loadingTest && <li className="py-4 text-sm text-slate-500">Loading requested test…</li>}
              {testError && <li role="alert" className="py-4 text-sm text-rose-700">{testError}</li>}
              {directTestIsSeparate && (
                <li className="flex items-center justify-between gap-4 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-700">
                    01
                  </span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Laboratory test</span>
                    <h3 className="mt-1 font-bold text-slate-900">{directTest.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{directTest.department} · Code: {directTest.code}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {directTest.price != null ? `Laboratory catalogue price: PKR ${Number(directTest.price).toLocaleString('en-PK')}` : 'Price pending confirmation'}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-blue-700">
                      {directTest.availabilityStatus === 'available' ? 'Availability listed as available' : 'Availability requires laboratory confirmation'}
                    </p>
                  </div>
                </li>
              )}
              {cart.map((item, index) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-700">
                    {String(index + (directTestIsSeparate ? 2 : 1)).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      {item.type === 'package' ? 'Health package' : 'Laboratory test'}
                    </span>
                    <h3 className="mt-1 font-bold text-slate-900">{item.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.price !== null && item.price !== undefined && item.price !== '' && Number.isFinite(Number(item.price))
                        ? `Laboratory catalogue price: PKR ${Number(item.price).toLocaleString('en-PK')}`
                        : 'Price pending confirmation'}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {requestItems.length > 0 && (
            <form onSubmit={handleCreateRequest} className="mt-6 space-y-4 border-t border-slate-100 pt-6">
              <h3 className="font-bold text-slate-900">Your contact and report preference</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Patient name
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={patientName}
                    onChange={(event) => setPatientName(event.target.value)}
                    autoComplete="name"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    placeholder="Your full name"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Phone / WhatsApp number
                  <input
                    required
                    minLength={7}
                    maxLength={24}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    autoComplete="tel"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    placeholder="03xx xxxxxxx"
                  />
                </label>
              </div>
              <fieldset>
                <legend className="text-xs font-semibold text-slate-700">If you proceed with testing, how would you like to receive your report?</legend>
                <div className="mt-2 flex flex-wrap gap-3">
                  {[
                    { value: 'online', label: 'Online report' },
                    { value: 'physical', label: 'Physical report collection' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name="reportDelivery"
                        value={option.value}
                        checked={reportDelivery === option.value}
                        onChange={(event) => setReportDelivery(event.target.value)}
                        className="accent-blue-600"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              {requestError && <p role="alert" className="text-sm font-medium text-rose-700">{requestError}</p>}
              <button
                type="submit"
                disabled={requesting || Boolean(savedInquiry) || loadingTest || (!directTest && cart.length === 0)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MessageCircle className="h-5 w-5" />
                {requesting ? 'Saving request…' : savedInquiry ? 'Request saved' : 'Save request & continue to WhatsApp'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {savedInquiry && (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-bold text-blue-950">Your request is saved and waiting for lab confirmation.</p>
              <p className="mt-1 text-sm text-blue-900">Tracking number: <strong className="font-mono">{savedInquiry.trackingId}</strong></p>
              <p className="mt-1 text-xs text-blue-800">Keep this number and your phone number. This is a request, not a confirmed appointment.</p>
              <Link
                to={savedInquiry.accountLinked
                  ? '/customer/requests'
                  : `/request-tracking?tracking=${encodeURIComponent(savedInquiry.trackingId)}`}
                className="mt-3 inline-flex text-sm font-bold text-blue-700 underline"
              >
                {savedInquiry.accountLinked ? 'View in My Test Requests' : 'Check request status'}
              </Link>
              {whatsappFallbackUrl && (
                <a href={whatsappFallbackUrl} target="_blank" rel="noopener noreferrer" className="ml-4 inline-flex text-sm font-bold text-blue-700 underline">
                  Open WhatsApp
                </a>
              )}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-extrabold text-slate-900">Visit MALAK Lab</h2>
            <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              Opposite DHQ Hospital, Main GT Road, Timergara, Lower Dir
            </p>
            <a href={`tel:${MALAK_LAB_PHONE_LINK}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:underline">
              <PhoneCall className="h-4 w-4" />
              {MALAK_LAB_PHONE}
            </a>
          </div>
          <p className="rounded-2xl bg-blue-50 p-4 text-xs leading-relaxed text-blue-900">
            Home sample collection availability and any fee must be confirmed with the laboratory.
          </p>
        </aside>
      </div>
    </main>
  );
}
