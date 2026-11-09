import React from 'react';

/**
 * Reusable KPI stat card for the admin dashboard and overview sections.
 *
 * Props:
 *  - title: string
 *  - value: string | number
 *  - subtitle: string (optional)
 *  - icon: Lucide React icon component
 *  - color: 'sky' | 'teal' | 'emerald' | 'blue' | 'rose' | 'indigo' (default: 'sky')
 *  - loading: boolean (shows skeleton)
 */
const colorMap = {
  sky: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    sub: 'text-blue-400',
  },
  teal: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/20',
    sub: 'text-teal-400',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    sub: 'text-emerald-400',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    sub: 'text-blue-400',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    sub: 'text-rose-400',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
    sub: 'text-indigo-400',
  },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'sky', loading = false }) {
  const c = colorMap[color] || colorMap.sky;

  if (loading) {
    return (
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3 animate-pulse">
        <div className="h-3 w-24 bg-slate-800 rounded" />
        <div className="h-8 w-20 bg-slate-800 rounded" />
        <div className="h-2.5 w-32 bg-slate-800 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-3 hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-center">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
          {title}
        </span>
        {Icon && (
          <span className={`p-2 rounded-xl ${c.bg} ${c.text} border ${c.border}`}>
            <Icon className="w-4 h-4" />
          </span>
        )}
      </div>
      <div>
        <span className="text-3xl font-black text-white">{value ?? '—'}</span>
        {subtitle && (
          <span className={`text-[11px] ${c.sub} block mt-1 font-semibold`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
