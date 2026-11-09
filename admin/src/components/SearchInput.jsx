import React from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable search input for admin page filter bars.
 *
 * Props:
 *  - value: string
 *  - onChange: (value: string) => void
 *  - placeholder: string
 *  - className: string (optional extra classes)
 */
export default function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        aria-label={placeholder}
      />
    </div>
  );
}
