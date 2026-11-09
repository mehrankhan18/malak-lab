import React from 'react';
import { MapPin, ShieldCheck } from 'lucide-react';

export default function AuthVisual() {
  return (
    <aside className="relative order-first min-h-[240px] overflow-hidden rounded-[2rem] bg-slate-950 lg:order-last lg:min-h-[620px]">
      <img
        src="/malak-lab-team.jpg"
        alt="Laboratory scientists working with diagnostic testing equipment"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/65 to-transparent px-5 pb-5 pt-20 text-white lg:px-8 lg:pb-9 lg:pt-32">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-200 lg:text-sm">
          <ShieldCheck className="h-4 w-4" />
          MALAK Lab Science Hub
        </div>
        <h2 className="mt-2 text-lg font-black lg:mt-3 lg:text-2xl">Your laboratory services, in one place.</h2>
        <p className="mt-2 hidden max-w-md text-sm leading-relaxed text-slate-200 sm:block">
          Sign in to manage your account and view your available reports and bookings.
        </p>
        <p className="mt-3 flex items-start gap-2 text-[11px] font-medium text-slate-200 lg:mt-5 lg:text-xs">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
          Opposite DHQ Hospital, Main GT Road, Timergara, Lower Dir
        </p>
      </div>
    </aside>
  );
}
