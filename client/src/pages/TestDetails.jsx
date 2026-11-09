import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { 
  FlaskConical, 
  Clock, 
  Droplets, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Check, 
  Building2, 
  Share2, 
  CalendarCheck,
  ChevronLeft
} from 'lucide-react';

export default function TestDetails() {
  const { slug } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/tests/${slug}`);
        setTest(res.data.test);
      } catch (err) {
        setLoadError(err.response?.data?.message || 'Could not load test details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="h-96 rounded-3xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Medical Test Not Found</h2>
        <p className="text-sm text-slate-500">{loadError || 'The test you are looking for may have been updated or retired.'}</p>
        <Link to="/tests" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold">
          Back to Tests Catalog
        </Link>
      </div>
    );
  }

  const isInCart = cart.some(i => i.id === test._id);
  const price = test.discountedPrice ?? test.price;
  const availability = test.isActive === false ? 'unavailable' : (test.availabilityStatus || 'available');
  const hasPrice = price !== null && price !== undefined && price !== '' && Number.isFinite(Number(price));
  const canBook = test.isActive !== false
    && availability === 'available'
    && hasPrice;

  const handleBookNow = () => {
    if (canBook && (isInCart || addToCart(test, 'test'))) navigate('/book-test');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <div>
        <Link to="/tests" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Tests</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 flex flex-col lg:flex-row justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
              {test.department}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
              {test.category}
            </span>
              <span className="text-xs font-mono text-slate-400">Code: {test.code}</span>
              <span className={`rounded-lg px-3 py-1 text-xs font-bold ${availability === 'available' ? 'bg-emerald-50 text-emerald-700' : availability === 'unavailable' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>
                {availability === 'available' ? 'Available' : availability === 'unavailable' ? 'Unavailable' : 'Pending verification'}
              </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {test.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {test.description || 'Additional test information has not yet been confirmed by the laboratory.'}
          </p>

          {/* Key metrics pill row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Sample Specimen</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Droplets className="w-3.5 h-3.5 text-rose-500" />
                {test.sampleType || 'Not confirmed'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Fasting Status</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                {test.fastingRequired === true
                  ? (test.fastingHours ? `${test.fastingHours}h fasting` : 'Required; duration not confirmed')
                  : test.fastingRequired === false ? 'Not required' : 'Not confirmed'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Turnaround Time</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                {test.turnaroundHours ? `${test.turnaroundHours} hours` : 'Not confirmed'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Volume Required</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <FlaskConical className="w-3.5 h-3.5 text-blue-500" />
                {test.requiredQuantity || 'Not confirmed'}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Booking Card Side */}
        <div className="lg:w-80 shrink-0 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Laboratory price
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-slate-900">
                {hasPrice ? `PKR ${Number(price).toLocaleString('en-PK')}` : 'Pending confirmation'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Only a price entered and confirmed by laboratory staff is shown.</p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={canBook
                ? handleBookNow
                : () => navigate(`/book-test?test=${encodeURIComponent(test.slug || test.code)}`)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <CalendarCheck className="w-4 h-4" />
              {canBook ? 'Book This Test Now' : 'Request price and availability'}
            </button>

            <button
              onClick={() => addToCart(test, 'test')}
              disabled={isInCart || !canBook}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isInCart
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : canBook ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4 text-blue-600" />
                  Added to Test Cart
                </>
              ) : canBook ? (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Cart
                </>
              ) : (
                <>Unavailable for booking</>
              )}
            </button>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-500 pt-3 border-t border-slate-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              Contact the laboratory to verify test details
            </span>
          </div>
        </div>
      </div>

      {/* Preparation Guidelines Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Test Preparation & Fasting Instructions
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {test.preparation || 'Preparation instructions have not been confirmed by laboratory staff.'}
        </p>
      </div>

      {/* Clinical Parameters Table */}
      {test.parameters && test.parameters.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Biological Parameters Measured ({test.parameters.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Laboratory-provided parameter information.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Parameter Name</th>
                  <th className="py-3 px-6">Unit</th>
                  <th className="py-3 px-6">Biological Reference Interval</th>
                  <th className="py-3 px-6">Analytical Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {test.parameters.map((param, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-800">
                      {param.parameterName}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono">
                      {param.unit || '-'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-medium">
                      {param.referenceRange || (param.maleRange || param.femaleRange ? `M: ${param.maleRange || '—'} | F: ${param.femaleRange || '—'}` : 'Not provided')}
                    </td>
                    <td className="py-3.5 px-6 text-slate-400">
                      {param.method || 'Not provided'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available Branches */}
      {test.availableBranches && test.availableBranches.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Available at These Diagnostic Branches
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {test.availableBranches.map((br) => (
              <div key={br._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <h5 className="font-bold text-slate-800">{br.name}</h5>
                <p className="text-slate-500 mt-1">{br.address?.street}, {br.address?.city}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
