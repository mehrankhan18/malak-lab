import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  CalendarCheck, 
  Truck, 
  Droplet, 
  Building2, 
  FlaskConical, 
  FileCheck2, 
  ShieldCheck, 
  FileDown 
} from 'lucide-react';

const STAGES = [
  { id: 'Booking Confirmed', label: 'Booking Confirmed', icon: CalendarCheck, desc: 'Appointment booked & scheduled' },
  { id: 'Sample Collection Scheduled', label: 'Collection Scheduled', icon: Truck, desc: 'Phlebotomist dispatched' },
  { id: 'Sample Collected', label: 'Sample Collected', icon: Droplet, desc: 'Specimen drawn sterilely' },
  { id: 'Sample Received', label: 'Sample Received at Lab', icon: Building2, desc: 'Accessioned & barcode scanned' },
  { id: 'Testing in Progress', label: 'Testing in Progress', icon: FlaskConical, desc: 'Automated analyzers processing' },
  { id: 'Report Under Review', label: 'Under Medical Review', icon: FileCheck2, desc: 'Submitted to Pathologist' },
  { id: 'Report Approved', label: 'Report Approved', icon: ShieldCheck, desc: 'Doctor digitally certified' },
  { id: 'Report Published', label: 'Report Published', icon: FileDown, desc: 'Ready for official download' },
];

export default function SampleTracker({ sample, onDownloadReport }) {
  if (!sample) return null;

  const currentStageIndex = STAGES.findIndex(s => s.id === sample.currentStage);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
              Live Sample Tracking
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Barcode: {sample.barcode}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Specimen ID: <span className="font-mono text-blue-600">{sample.sampleId}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Booking Code: <span className="font-semibold text-slate-700">{sample.bookingCode}</span> | Specimen: {sample.sampleType}
          </p>
        </div>

        {sample.currentStage === 'Report Published' && sample.reportId && (
          <div className="flex items-center gap-3">
            <button
              onClick={onDownloadReport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all animate-pulse"
            >
              <FileDown className="w-4 h-4" />
              Download Verified Report (PDF)
            </button>
          </div>
        )}
      </div>

      {/* 8-Stage Progress Pipeline */}
      <div className="relative">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 relative z-10">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;

            // Find matching history entry if exists
            const historyEntry = (sample.statusHistory || []).find(h => h.stage === stage.id);

            return (
              <div key={stage.id} className="flex flex-col items-center text-center relative group">
                {/* Node circle */}
                <div 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                      : isCurrent 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg shadow-blue-600/30 scale-110 animate-bounce' 
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </div>

                {/* Stage Title */}
                <h5 className={`text-xs font-bold mt-3 leading-tight ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                  {stage.label}
                </h5>

                {/* Status indicator */}
                <span className={`text-[10px] mt-1 font-semibold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-blue-600' : 'text-slate-400'}`}>
                  {isCurrent ? '● IN PROGRESS' : isCompleted ? 'Completed' : 'Upcoming'}
                </span>

                {/* Timestamp if logged */}
                {historyEntry && (
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">
                    {new Date(historyEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Activity Log Timeline */}
      {sample.statusHistory && sample.statusHistory.length > 0 && (
        <div className="mt-10 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Audit & Timestamp Log
          </h4>
          <div className="space-y-3">
            {sample.statusHistory.slice().reverse().map((entry, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-800">{entry.stage}</span>
                    <span className="text-slate-400 font-mono">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {entry.remarks && (
                    <p className="text-slate-600 mt-0.5">{entry.remarks}</p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span>Location: {entry.location || 'Central Laboratory'}</span>
                    <span>•</span>
                    <span>Staff: {entry.updatedByName || 'MALAK Lab'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
