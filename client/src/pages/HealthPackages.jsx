import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PackageCard from '../components/PackageCard';
import { Sparkles, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';

export default function HealthPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get('/packages');
        setPackages(res.data.packages || []);
      } catch (err) {
        console.error('Failed to load packages', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
          Executive Preventive Healthcare
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Comprehensive Health Packages
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Curated multi-specialty wellness evaluations providing deep physiological insights across cardiovascular, endocrine, hepatic, and metabolic health.
        </p>
      </div>

      {/* Package comparison highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Indicative market references</h4>
            <p className="text-xs text-slate-500 mt-1">
              Displayed ranges are general market references and are not MALAK Lab quotes.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Ask before booking</h4>
            <p className="text-xs text-slate-500 mt-1">
              Contact the laboratory to confirm the package details and current price.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Collection options</h4>
            <p className="text-xs text-slate-500 mt-1">
              Ask MALAK Lab whether home collection is available in your area and what fee applies.
            </p>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-96 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg._id} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
}
