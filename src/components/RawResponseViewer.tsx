import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Terminal } from 'lucide-react';

interface RawResponseViewerProps {
  rawResponse: any;
  status: number;
  responseTimeMs: number;
}

export const RawResponseViewer: React.FC<RawResponseViewerProps> = ({
  rawResponse,
  status,
  responseTimeMs,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedJson =
    typeof rawResponse === 'string'
      ? rawResponse
      : JSON.stringify(rawResponse, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-slate-800 bg-slate-950/70 rounded-xl overflow-hidden text-xs">
      {/* Header Bar */}
      <div className="px-4 py-3 flex items-center justify-between bg-slate-950 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Raw n8n Webhook Response</span>
          <span className="text-slate-500" aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-emerald-400 font-medium">HTTP {status}</span>
          <span className="text-slate-500" aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-400">{responseTimeMs}ms</span>
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-white transition-colors"
          >
            <span>{isOpen ? 'Collapse' : 'Inspect JSON'}</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Inspector */}
      {isOpen && (
        <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto border-t border-slate-800">
          <pre className="text-cyan-300 whitespace-pre-wrap leading-relaxed select-all">
            {formattedJson}
          </pre>
        </div>
      )}
    </div>
  );
};
