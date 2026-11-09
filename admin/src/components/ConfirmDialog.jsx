import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

/**
 * Reusable confirmation dialog for destructive actions.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onConfirm: () => void
 *  - title: string
 *  - message: string
 *  - confirmLabel: string (default: 'Confirm')
 *  - confirmColor: 'rose' | 'emerald' | 'sky' (default: 'rose')
 *  - loading: boolean
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmLabel = 'Confirm',
  confirmColor = 'rose',
  loading = false,
}) {
  const btnColor = {
    rose:    'bg-rose-600 hover:bg-rose-500 text-white',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    sky:     'bg-blue-600 hover:bg-blue-500 text-white',
  }[confirmColor] || 'bg-rose-600 hover:bg-rose-500 text-white';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-5">
        {/* Warning Icon + Message */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 shrink-0">
            <AlertTriangle className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-xl font-bold text-xs shadow-md transition-colors ${btnColor} disabled:opacity-50`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
