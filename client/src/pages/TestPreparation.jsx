import React from 'react';
import { 
  AlertCircle, 
  Clock, 
  Droplet, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Coffee, 
  Pill, 
  Sun 
} from 'lucide-react';

export default function TestPreparation() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
          Patient Guidelines
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Test Preparation & Fasting Guidelines
        </h1>
        <p className="text-sm text-slate-500">
          Pre-analytical accuracy ensures the highest diagnostic precision. Please review these essential guidelines before your blood or urine sample collection.
        </p>
      </div>

      {/* Fasting Rules Block */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Fasting Blood Tests (Lipid, Blood Sugar, Packages)</h3>
            <span className="text-xs text-slate-500">Required Fasting Duration: 10 to 12 Hours</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              What IS Allowed During Fasting:
            </span>
            <ul className="space-y-1.5 text-blue-800 pl-5 list-disc">
              <li>Plain drinking water (actively encouraged to avoid dehydration)</li>
              <li>Essential prescribed medications (unless instructed otherwise by your doctor)</li>
              <li>Normal teeth brushing and light morning hydration</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-2">
            <span className="font-bold text-rose-900 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              What is STRICTLY PROHIBITED:
            </span>
            <ul className="space-y-1.5 text-rose-800 pl-5 list-disc">
              <li>Coffee, tea, sodas, fruit juices, or milk of any kind</li>
              <li>Chewing gum, mints, or throat lozenges</li>
              <li>Cigarettes, vaping, or nicotine products</li>
              <li>Strenuous early morning physical workouts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Urine Collection Rules */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Clean-Catch Midstream Urine Collection</h3>
            <span className="text-xs text-slate-500">For Routine Urinalysis & Urine Culture Tests</span>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">1</span>
            <p><strong>First Morning Void:</strong> The earliest morning urine sample is most concentrated and ideal for microscopic and biochemical analysis.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">2</span>
            <p><strong>Clean Mid-Stream Catch:</strong> Discard the initial stream of urine into the toilet; collect the middle stream directly into the sterile container without touching the container rim.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">3</span>
            <p><strong>Seal & Refrigerate:</strong> Tightly screw on the container lid. If the sample cannot be transported to the lab within 1 hour, keep it refrigerated between 2°C to 4°C.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
