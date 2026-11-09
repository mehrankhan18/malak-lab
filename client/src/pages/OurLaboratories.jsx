import React from 'react';
import { 
  Building2, 
  FlaskConical, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  Thermometer, 
  Zap,
  Microscope
} from 'lucide-react';

export default function OurLaboratories() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
          World-Class Infrastructure
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Our Advanced Laboratory Infrastructure
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Featuring Class 10,000 cleanroom air filtration, continuous temperature sensors, and automated robotics handling thousands of specimens daily with zero cross-contamination.
        </p>
      </div>

      {/* Equipment Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Roche Cobas Integrated Platforms</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            High-throughput clinical chemistry and electrochemiluminescence immunoassay (ECLIA) modules with bidirectional LIS interfacing and automated clot detection.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Microscope className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Sysmex Automated Hematology</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Fluorescent flow cytometry providing true 5-part differential leukocyte analysis, immature granulocyte counts, and automated slide staining.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Thermometer className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Digital Cold-Chain Tracking</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Continuous IoT temperature data-logging from patient venipuncture to centrifugation and deep freeze biorepository storage (-80°C).
          </p>
        </div>
      </div>

      {/* Clean Room Standards */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white space-y-6">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Sterility & Safety</span>
        <h3 className="text-2xl sm:text-3xl font-black">Cleanroom Environments & Waste Management</h3>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Our reference pavilions feature positive-pressure HEPA filtration rooms for PCR and molecular diagnostics to prevent aerosolized DNA amplification carryover. All biomedical hazardous waste is sterilized via certified autoclaving and non-incineration eco-friendly disposal.
        </p>
      </div>
    </div>
  );
}

