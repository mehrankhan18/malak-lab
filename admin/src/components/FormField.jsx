import React from 'react';

/**
 * Reusable form field wrapper for admin forms.
 *
 * Props:
 *  - label: string
 *  - required: boolean
 *  - error: string (optional validation error message)
 *  - hint: string (optional help text)
 *  - children: ReactNode (the actual input/select/textarea)
 *  - className: string (optional)
 */
export default function FormField({ label, required = false, error, hint, children, className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-300">
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-rose-400 mt-0.5">{error}</p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>
      )}
    </div>
  );
}

/**
 * Pre-styled text input for use inside FormField.
 */
export function AdminInput({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors ${className}`}
      {...props}
    />
  );
}

/**
 * Pre-styled select for use inside FormField.
 */
export function AdminSelect({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

/**
 * Pre-styled textarea for use inside FormField.
 */
export function AdminTextarea({ className = '', rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none ${className}`}
      {...props}
    />
  );
}
