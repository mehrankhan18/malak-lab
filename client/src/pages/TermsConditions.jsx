import React from 'react';
import { FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
          Legal Agreement
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Terms & Conditions of Laboratory Services
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Last Revised: 2026
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            1. Scope of Diagnostic Testing Services
          </h3>
          <p>
            MALAK Lab Science Hub provides laboratory testing services. Test results should be discussed with a qualified healthcare professional and interpreted alongside your clinical history.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-500" />
            2. Medical Disclaimer & Clinical Correlation
          </h3>
          <p>
            Laboratory test findings are intended solely to assist licensed healthcare providers in forming diagnostic judgments. Test reports do not constitute a direct medical prescription or substitute for clinical examination. All results must be clinically correlated with patient symptoms by a qualified physician.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            3. Rescheduling & Cancellation Policy
          </h3>
          <p>
            Patients may reschedule appointment dates or cancel bookings through their Customer Account Portal up to 4 hours prior to the reserved collection slot without fee. In the event of an unavoidable cancellation, refunds are credited back to the original payment source within 24 to 48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
