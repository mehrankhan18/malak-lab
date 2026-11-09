import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
          Patient Privacy Protection
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Effective Date: January 1, 2026 | Last Updated: 2026
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            1. Information and Privacy
          </h3>
          <p>
            MALAK Lab Science Hub respects patient privacy. Personal information submitted through this website should only be used to respond to your inquiry or provide requested laboratory services. Please contact the lab directly if you have questions about how your information is handled.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            2. Collection and Transmission of Specimen Data
          </h3>
          <p>
            When you use booking or account features, the website may process information you provide, such as your name, contact details, appointment information, and collection address. Do not send sensitive medical details through WhatsApp or other channels unless the laboratory has confirmed that channel is appropriate.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            3. Strict Access Control on Medical Reports
          </h3>
          <p>
            Use your account credentials carefully. Contact MALAK Lab Science Hub if you have questions about report access or the handling of information submitted through this website.
          </p>
        </div>
      </div>
    </div>
  );
}
