import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { getMarketPriceReference } from '../utils/marketPriceReference';
import { 
  HeartPulse, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ChevronLeft, 
  CalendarCheck, 
  Plus, 
  Check, 
  Sparkles,
  FlaskConical
} from 'lucide-react';

export default function PackageDetails() {
  const { slug } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackage = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/packages/${slug}`);
        setPkg(res.data.package);
      } catch (err) {
        console.error('Failed to load package details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="h-96 rounded-3xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Health Package Not Found</h2>
        <Link to="/packages" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold">
          Back to Packages
        </Link>
      </div>
    );
  }

  const isInCart = cart.some(i => i.id === pkg._id);
  const priceReference = getMarketPriceReference(pkg.name, 'package');

  const handleBookNow = () => {
    addToCart(pkg, 'package');
    navigate('/book-test');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <Link to="/packages" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Health Packages</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 flex flex-col lg:flex-row justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <HeartPulse className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full">
              Includes {pkg.testCount || pkg.testsIncluded?.length || 0} Medical Tests
            </span>
            <span className="text-xs font-mono text-slate-400">
              Code: {pkg.code}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {pkg.name}
          </h1>

          {pkg.tagline && (
            <p className="text-sm font-bold text-blue-600">
              {pkg.tagline}
            </p>
          )}

          <p className="text-sm text-slate-600 leading-relaxed">
            {pkg.description}
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
              <span><strong>Fasting Requirement:</strong> {pkg.fastingRequirements || '10-12 hours overnight fasting recommended.'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <FlaskConical className="w-4 h-4 text-blue-500 shrink-0" />
              <span><strong>Sample Types:</strong> {pkg.sampleTypes?.join(', ') || 'Blood (Serum & EDTA), Urine'}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Checkout Side */}
        <div className="lg:w-80 shrink-0 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Indicative Market Reference
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-slate-900">{priceReference}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Peshawar market reference only. Confirm MALAK Lab's actual price by WhatsApp.</p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={handleBookNow}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <CalendarCheck className="w-4 h-4" />
              Book This Package
            </button>

            <button
              onClick={() => addToCart(pkg, 'package')}
              disabled={isInCart}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isInCart
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4 text-blue-600" />
                  Added to Cart
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-500 pt-3 border-t border-slate-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              Ask the lab about home collection availability and fees
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              Ask the lab to confirm the package details
            </span>
          </div>
        </div>
      </div>

      {/* Tests Included In This Package */}
      {pkg.testsIncluded && pkg.testsIncluded.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              All Tests Included in This Package ({pkg.testsIncluded.length})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Contact MALAK Lab to confirm availability and included investigations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pkg.testsIncluded.map((test, index) => (
              <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {test.name || test}
                  </h4>
                  {test.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {test.description}
                    </p>
                  )}
                  {test.sampleType && (
                    <span className="text-[10px] font-mono text-blue-600 block mt-1">
                      Specimen: {test.sampleType}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
