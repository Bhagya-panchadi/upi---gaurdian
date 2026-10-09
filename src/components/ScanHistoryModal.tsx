import React from 'react';
import { X, Trash2, Clock, ArrowUpRight, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { ScanHistoryRecord } from '../types';

interface ScanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ScanHistoryRecord[];
  onSelectRecord: (record: ScanHistoryRecord) => void;
  onClearHistory: () => void;
}

export const ScanHistoryModal: React.FC<ScanHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectRecord,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-white">Scan History</h2>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">{history.length} records</span>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-800/60">
          {history.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm text-slate-400 font-medium">No previous scans found</p>
              <p className="text-xs text-slate-600">
                Messages you analyze with your n8n workflow will appear here.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const badgeColor =
                item.normalizedLevel === 'high'
                  ? 'text-rose-400 bg-rose-950/80 border-rose-900'
                  : item.normalizedLevel === 'medium'
                  ? 'text-amber-400 bg-amber-950/80 border-amber-900'
                  : item.normalizedLevel === 'safe'
                  ? 'text-emerald-400 bg-emerald-950/80 border-emerald-900'
                  : 'text-cyan-400 bg-cyan-950/80 border-cyan-900';

              return (
                <div
                  key={item.id}
                  className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${badgeColor}`}>
                        {item.riskLevel}
                      </span>
                      <span className="text-slate-600" aria-hidden="true">·</span>
                      <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-slate-600" aria-hidden="true">·</span>
                      <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {item.responseTimeMs}ms
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 truncate font-mono">
                      "{item.inputMessage}"
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {item.reason}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectRecord(item);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
                  >
                    <span>View Result</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
