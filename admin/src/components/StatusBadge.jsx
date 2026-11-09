import React from 'react';

/**
 * Reusable status badge component for the admin portal.
 *
 * Props:
 *  - status: string — the raw status value
 *  - type: 'booking' | 'payment' | 'report' | 'sample' | 'staff' | 'generic'
 */

const BOOKING_STATUS_MAP = {
  confirmed:   { bg: 'bg-blue-500/20',     text: 'text-blue-400',     border: 'border-blue-500/30' },
  rescheduled: { bg: 'bg-blue-500/20',   text: 'text-blue-400',   border: 'border-blue-500/30' },
  cancelled:   { bg: 'bg-rose-500/20',    text: 'text-rose-400',    border: 'border-rose-500/30' },
  completed:   { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

const PAYMENT_STATUS_MAP = {
  pending:  { bg: 'bg-blue-500/20',   text: 'text-blue-400',   border: 'border-blue-500/30' },
  paid:     { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  failed:   { bg: 'bg-rose-500/20',    text: 'text-rose-400',    border: 'border-rose-500/30' },
  refunded: { bg: 'bg-indigo-500/20',  text: 'text-indigo-400',  border: 'border-indigo-500/30' },
};

const REPORT_STATUS_MAP = {
  draft:                 { bg: 'bg-slate-700',       text: 'text-slate-400',   border: 'border-slate-600' },
  submitted_for_review:  { bg: 'bg-blue-500/20',    text: 'text-blue-400',   border: 'border-blue-500/30' },
  approved:              { bg: 'bg-teal-500/20',     text: 'text-teal-400',    border: 'border-teal-500/30' },
  published:             { bg: 'bg-emerald-500/20',  text: 'text-emerald-400', border: 'border-emerald-500/30' },
  rejected:              { bg: 'bg-rose-500/20',     text: 'text-rose-400',    border: 'border-rose-500/30' },
};

const getStatusStyle = (status, type) => {
  const s = String(status).toLowerCase().replace(/ /g, '_');
  let map;
  switch (type) {
    case 'booking': map = BOOKING_STATUS_MAP; break;
    case 'payment': map = PAYMENT_STATUS_MAP; break;
    case 'report':  map = REPORT_STATUS_MAP;  break;
    default:        map = {};
  }
  return map[s] || { bg: 'bg-slate-700', text: 'text-slate-300', border: 'border-slate-600' };
};

export default function StatusBadge({ status, type = 'generic' }) {
  if (!status) return <span className="text-slate-500 text-[11px]">—</span>;

  const style = getStatusStyle(status, type);
  const label = String(status).replace(/_/g, ' ').toUpperCase();

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${style.bg} ${style.text} border ${style.border}`}
    >
      {label}
    </span>
  );
}
