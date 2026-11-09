import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Clock, 
  FlaskConical, 
  Droplets, 
  Plus, 
  Check, 
  ChevronRight, 
  Sparkles,
  Info
} from 'lucide-react';

export default function TestCard({ test }) {
  const { cart, addToCart } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === 'light';
  const selectedIndex = cart.findIndex(item => item.id === test._id);
  const isInCart = selectedIndex !== -1;

  const price = test.discountedPrice ?? test.price;
  const hasPrice = price !== null && price !== undefined && price !== '' && Number.isFinite(Number(price));
  const canBook = test.isActive !== false
    && (test.availabilityStatus || 'available') === 'available'
    && hasPrice;
  const availability = test.isActive === false ? 'unavailable' : (test.availabilityStatus || 'available');
  const cardClass = isLight
    ? 'bg-white border-slate-200'
    : 'dark-card border-dark-700/50';
  const primaryTextClass = isLight ? 'text-slate-900' : 'text-white';
  const mutedTextClass = isLight ? 'text-slate-600' : 'text-dark-400';
  const dividerClass = isLight ? 'border-slate-200' : 'border-dark-700';

  return (
    <div className={`group ${cardClass} rounded-2xl border p-5 transition-all flex min-w-0 flex-col justify-between relative overflow-hidden medical-card-hover`}>
      {/* Top badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex min-w-0 items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="truncate">{test.department || test.category}</span>
          </span>

          {availability !== 'available' && (
            <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-300">
              {availability === 'pending_verification' ? 'Confirm availability' : 'Unavailable'}
            </span>
          )}
          {test.fastingRequired === true ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20">
              Fasting {test.fastingHours ? `${test.fastingHours}h` : 'Req.'}
            </span>
          ) : test.fastingRequired === false ? (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-dark-800 text-dark-400'}`}>
              No Fasting
            </span>
          ) : null}
        </div>

        {/* Test Name */}
        <Link to={`/tests/${test.slug}`} className="block min-w-0 group-hover:text-blue-500 transition-colors">
          <div className="flex items-start gap-2">
            {isInCart && (
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white">
                {String(selectedIndex + 1).padStart(2, '0')}
              </span>
            )}
            <h3 className={`text-base font-bold ${primaryTextClass} leading-snug line-clamp-2`}>
              {test.name}
            </h3>
          </div>
        </Link>
        <span className={`text-[11px] font-mono ${mutedTextClass} mt-0.5 block`}>
          Code: {test.code}
        </span>

        {/* Short description */}
        {test.description ? (
          <p className={`text-xs ${mutedTextClass} mt-2 line-clamp-2 leading-relaxed`}>{test.description}</p>
        ) : (
          <p className={`text-xs ${mutedTextClass} mt-2`}>Test details pending laboratory verification.</p>
        )}

        {/* Key test tags */}
        <div className={`mt-4 pt-3 border-t ${dividerClass} flex flex-wrap items-center gap-3 text-[11px] ${mutedTextClass}`}>
          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            {test.sampleType || 'Sample not confirmed'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            {test.turnaroundHours ? `Reports in ${test.turnaroundHours} hrs` : 'Report time not confirmed'}
          </span>
          {test.parameters && test.parameters.length > 0 && (
            <span className={mutedTextClass}>
              ({test.parameters.length} parameters)
            </span>
          )}
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className={`mt-5 pt-4 border-t ${dividerClass} flex min-w-0 items-center justify-between gap-3`}>
        <div className="min-w-0">
          <span className={`text-sm font-extrabold ${primaryTextClass}`}>
            {hasPrice ? `PKR ${Number(price).toLocaleString('en-PK')}` : 'Price pending confirmation'}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={`/tests/${test.slug}`}
            className={`p-2 rounded-xl transition-colors ${isLight ? 'text-slate-500 hover:text-blue-600 hover:bg-blue-50' : 'text-dark-400 hover:text-blue-400 hover:bg-dark-800'}`}
            title="View Test Details"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => canBook
              ? addToCart(test, 'test')
              : navigate(`/book-test?test=${encodeURIComponent(test.slug || test.code)}`)}
            disabled={isInCart}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isInCart
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 cursor-default'
                : canBook
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 active:scale-95'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20'
            }`}
            title={canBook ? 'Add this test to your booking' : 'Ask the laboratory to confirm availability and price'}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : canBook ? (
              <>
                <Plus className="w-3.5 h-3.5" /> Book
              </>
            ) : (
              <>Request availability</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
