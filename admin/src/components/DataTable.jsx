import React from 'react';

/**
 * Reusable data table for admin pages.
 *
 * Props:
 *  - columns: Array<{ key: string, label: string, render?: (row) => ReactNode, className?: string }>
 *  - rows: Array<Object>
 *  - loading: boolean
 *  - emptyMessage: string
 *  - rowKey: string (default: '_id')
 */
export default function DataTable({
  columns = [],
  rows = [],
  loading = false,
  emptyMessage = 'No records found.',
  rowKey = '_id',
}) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="space-y-0 divide-y divide-slate-800">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 px-5 py-3.5 items-center animate-pulse">
              {columns.map((col, ci) => (
                <div
                  key={ci}
                  className="h-3 bg-slate-800 rounded flex-1"
                  style={{ maxWidth: ci === 0 ? 120 : undefined }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`py-3 px-4 ${col.headerClassName || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-slate-500 text-xs italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row[rowKey] || Math.random()}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3.5 px-4 ${col.className || ''}`}>
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
