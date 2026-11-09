import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  FlaskConical, 
  Users, 
  CheckCircle2, 
  Microscope,
  Target,
  HeartHandshake
} from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="space-y-20 py-12 pb-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
            About MALAK Lab Science Hub
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Modern laboratory testing in Timergara, Lower Dir
          </h1>
          <p className="text-base text-slate-600 leading-relaxed font-normal">
            Located opposite DHQ Hospital on Main GT Road, MALAK Lab Science Hub offers diagnostic testing with HPLC HbA1c, CLIA hormone testing, and ABG analysis.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Our Clinical Mission</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              To provide accessible laboratory testing for the people of Timergara and surrounding communities, with a focus on quality and clear communication.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Our Core Values</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Careful testing, quality control, respect for patients, and clear information about laboratory services.
            </p>
          </div>
        </div>
      </section>

      {/* Laboratory capabilities */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Our Laboratory</span>
            <h2 className="text-3xl font-black">Testing capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
              <h4 className="font-bold text-white text-base">HbA1c by HPLC</h4>
              <p className="text-xs text-slate-400">
                HPLC testing using the GH900 Plus analyzer.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <Award className="w-8 h-8 text-blue-400" />
              <h4 className="font-bold text-white text-base">Hormones by CLIA</h4>
              <p className="text-xs text-slate-400">
                Hormone testing using the CL900i analyzer.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <Microscope className="w-8 h-8 text-blue-400" />
              <h4 className="font-bold text-white text-base">ABG Analysis</h4>
              <p className="text-xs text-slate-400">
                Blood gas analysis using a Siemens analyzer.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
