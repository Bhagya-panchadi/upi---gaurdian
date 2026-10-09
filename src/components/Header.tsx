import React from 'react';
import { ShieldCheck, Settings, History, ExternalLink } from 'lucide-react';

interface HeaderProps {
  webhookUrl: string;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onToggleChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  webhookUrl,
  onOpenSettings,
  onOpenHistory,
  historyCount,
  onToggleChat,
}) => {
  const isConfigured = Boolean(webhookUrl && webhookUrl.trim().length > 0);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold">UPI Guardian</span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a href="#detector" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Fraud Detector
          </a>
          <a href="#samples" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Test Scenarios
          </a>
          <a href="#guidelines" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Safety Rules
          </a>
          {onToggleChat && (
            <button
              type="button"
              onClick={onToggleChat}
              className="text-cyan-300 hover:text-white transition-colors whitespace-nowrap shrink-0 font-medium"
            >
              AI Assistant
            </button>
          )}
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Cyber Helpline 1930
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </nav>

        {/* Zone 3: Primary Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
            title="View scan history"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
            <span className="font-mono tabular-nums text-slate-400">({historyCount})</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 border ${
              isConfigured
                ? 'bg-slate-900 text-cyan-300 border-cyan-500/40 hover:bg-cyan-950/40'
                : 'bg-cyan-600 text-white border-cyan-500 hover:bg-cyan-500 shadow-sm shadow-cyan-600/30'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isConfigured ? 'Webhook Active' : 'Set Webhook URL'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
