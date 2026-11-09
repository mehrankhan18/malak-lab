import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneCall, 
  MapPin,
  Droplet
} from 'lucide-react';

export default function HomeCollection() {
  return (
    <div className="space-y-16 py-10 pb-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-6 relative z-10">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 inline-block">
              MALAK LAB SCIENCE HUB · TIMARGARA
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ask about sample collection
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Collection availability can depend on your location and selected tests. Contact the lab team to confirm current options and any applicable fee.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/contact"
                className="px-6 py-3.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Ask About Collection
              </Link>
              <a
                href="tel:+923285027351"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm rounded-2xl transition-all flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-blue-400" />
                Call 0328 5027351
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Protocol Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Testing capabilities
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Laboratory services at a glance
          </h2>
          <p className="text-sm text-slate-500">
            Contact MALAK Lab for current availability, preparation instructions, and collection details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplet className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">HbA1c by HPLC</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              HbA1c testing is available using the GH900 Plus HPLC analyzer.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplet className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Hormone Testing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hormone testing is available using the CL900i CLIA analyzer.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">ABG Analysis</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ABG analysis is available using a Siemens analyzer. Tests are run with quality control.
            </p>
          </div>
        </div>
      </section>

      {/* Contact details */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-tr from-blue-50 via-white to-blue-50 border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Find Us</span>
            <h3 className="text-2xl font-black text-slate-900">
              MALAK Lab Science Hub, Timergara
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              Opposite DHQ Hospital on Main GT Road, Lower Dir. Call to confirm opening hours and collection availability.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shrink-0 transition-colors"
          >
            Contact the Lab
          </Link>
        </div>
      </section>
    </div>
  );
}
