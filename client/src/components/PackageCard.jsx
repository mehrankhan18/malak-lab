import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getMarketPriceReference } from '../utils/marketPriceReference';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Check, 
  ChevronRight,
  HeartPulse
} from 'lucide-react';

export default function PackageCard({ pkg }) {
  const { cart, addToCart } = useCart();
  const isInCart = cart.some(item => item.id === pkg._id);
  const priceReference = getMarketPriceReference(pkg.name, 'package');

  return (
    <div className="dark-card rounded-3xl border border-dark-700/50 p-6 transition-all flex flex-col justify-between relative overflow-hidden group medical-card-hover">
      {/* Featured ribbon if popular */}
      {pkg.popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-l from-blue-500 to-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider py-1 px-4 rounded-bl-xl shadow-sm">
            Most Popular
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HeartPulse className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            {pkg.testCount || (pkg.testsIncluded ? pkg.testsIncluded.length : 0)} Tests Included
          </span>
        </div>

        <Link to={`/packages/${pkg.slug}`} className="block group-hover:text-blue-400 transition-colors">
          <h3 className="text-xl font-bold text-white leading-snug">
            {pkg.name}
          </h3>
        </Link>
        {pkg.tagline && (
          <p className="text-xs font-medium text-blue-400 mt-1">
            {pkg.tagline}
          </p>
        )}

        <p className="text-xs text-dark-400 mt-3 line-clamp-2 leading-relaxed">
          {pkg.description}
        </p>

        {/* Tests breakdown preview list */}
        {pkg.testsIncluded && pkg.testsIncluded.length > 0 && (
          <div className="mt-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-dark-400 block">
              Tests Covered:
            </span>
            <ul className="space-y-1.5">
              {pkg.testsIncluded.slice(0, 4).map((t, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-dark-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{t.name || t}</span>
                </li>
              ))}
              {pkg.testsIncluded.length > 4 && (
                <li className="text-[11px] text-blue-400 font-semibold pl-5">
                  + {pkg.testsIncluded.length - 4} more specialized tests
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Fasting requirement */}
        {pkg.fastingRequirements && (
          <div className="mt-4 p-2.5 rounded-xl bg-dark-800/50 border border-dark-700 text-[11px] text-dark-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate">{pkg.fastingRequirements}</span>
          </div>
        )}
      </div>

      {/* Pricing & CTA */}
      <div className="mt-6 pt-5 border-t border-dark-700 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-white">{priceReference}</span>
          </div>
          <span className="text-[10px] text-dark-400 block">Market reference only</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/packages/${pkg.slug}`}
            className="p-2.5 text-dark-400 hover:text-blue-400 hover:bg-dark-800 rounded-xl transition-colors"
            title="View Details"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
          <button
            onClick={() => addToCart(pkg, 'package')}
            disabled={isInCart}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isInCart
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-95'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4" /> Selected
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Book Package
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
