import React, { useState } from 'react';
import { Clipboard, Trash2, ArrowRight, Sparkles, Loader2, ShieldAlert, Check } from 'lucide-react';
import { SAMPLE_MESSAGES, SampleMessage } from '../data/sampleMessages';

interface MessageInputProps {
  message: string;
  setMessage: (msg: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  webhookUrl: string;
  onOpenSettings: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  onAnalyze,
  isLoading,
  webhookUrl,
  onOpenSettings,
}) => {
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setMessage(text);
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2000);
      }
    } catch {
      // Clipboard permission denied or unsupported
    }
  };

  const handleClear = () => {
    setMessage('');
    setActivePresetId(null);
  };

  const handleSelectSample = (sample: SampleMessage) => {
    setMessage(sample.message);
    setActivePresetId(sample.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        onAnalyze();
      }
    }
  };

  const hasWebhook = Boolean(webhookUrl && webhookUrl.trim().length > 0);

  return (
    <div className="space-y-4">
      {/* Webhook Notice if unconfigured */}
      {!hasWebhook && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Your n8n Webhook URL is not configured yet. Set it to send analysis requests.
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Configure Webhook
          </button>
        </div>
      )}

      {/* Main Textarea Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden focus-within:border-cyan-500/80 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
        {/* Textarea Toolbar */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <span>Paste Suspicious Message</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-500">SMS, WhatsApp, UPI Collect Request, or Email</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Paste text from clipboard"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Pasted!</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </>
              )}
            </button>
            {message.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Text Area */}
        <div className="p-4">
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setActivePresetId(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Paste suspicious UPI notification here (e.g., 'Congratulations! You won ₹4,999 cashback in GPay. Click here to claim...')"
            rows={5}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-y leading-relaxed font-sans"
          />
        </div>

        {/* Textarea Footer Controls */}
        <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="font-mono tabular-nums">{message.length} characters</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="hidden sm:inline text-slate-500">Press Ctrl + Enter to analyze</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isLoading || !message.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm rounded-lg shadow-md shadow-cyan-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with n8n...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Analyze Message</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Test Samples */}
      <div id="samples" className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">Quick Test Scenarios:</span>
          <span className="text-slate-500">Click any preset to test your webhook</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {SAMPLE_MESSAGES.map((sample) => {
            const isSelected = activePresetId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`text-left p-3 rounded-lg border text-xs transition-all ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500/80 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-semibold truncate text-white">{sample.title}</span>
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${
                      sample.category === 'scam'
                        ? 'text-rose-400 bg-rose-950/80 border border-rose-900'
                        : sample.category === 'suspicious'
                        ? 'text-amber-400 bg-amber-950/80 border border-amber-900'
                        : 'text-emerald-400 bg-emerald-950/80 border border-emerald-900'
                    }`}
                  >
                    {sample.badgeLabel}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                  {sample.message}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
