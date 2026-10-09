import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  Info,
  Check,
  Copy,
  Clock,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  ShieldX,
  FileText
} from 'lucide-react';
import { ParsedAnalysis, RiskLevel } from '../types';
import { RawResponseViewer } from './RawResponseViewer';

interface AnalysisResultProps {
  result: ParsedAnalysis | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  onOpenSettings?: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  isLoading,
  error,
  onRetry,
  onOpenSettings,
}) => {
  const [copiedReport, setCopiedReport] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-900/40 border border-cyan-800 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <div className="h-4 w-44 bg-slate-800 rounded mb-1.5" />
            <div className="h-3 w-64 bg-slate-800/60 rounded" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="h-20 bg-slate-950/70 rounded-lg border border-slate-800/60" />
          <div className="h-24 bg-slate-950/70 rounded-lg border border-slate-800/60" />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
          <span>Sending POST payload to n8n Webhook...</span>
          <span>Awaiting workflow completion</span>
        </div>
      </div>
    );
  }

  if (error) {
    const isCorsWarning = error.toLowerCase().includes('cors') || error.toLowerCase().includes('connect to the n8n webhook');

    return (
      <div className="bg-rose-950/30 border border-rose-900/80 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-rose-200">Analysis Failed</h3>
            <p className="text-xs text-rose-300/90 leading-relaxed">{error}</p>
          </div>
        </div>

        {isCorsWarning && (
          <div className="bg-slate-950/80 border border-rose-900/50 rounded-lg p-3.5 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-slate-200">Troubleshooting n8n Webhook Connection:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li>
                <strong className="text-slate-300">Production vs Test URL:</strong> Make sure you copied the <span className="text-cyan-400 font-mono">Production URL</span>, not the Test URL.
              </li>
              <li>
                <strong className="text-slate-300">Workflow Active:</strong> In n8n, verify that the toggle at the top right is set to <span className="text-emerald-400 font-medium">Active</span>.
              </li>
              <li>
                <strong className="text-slate-300">Browser CORS:</strong> In n8n Webhook node settings, ensure it returns response headers or configure a <code className="text-slate-200">Respond to Webhook</code> node with header <code className="text-cyan-300">Access-Control-Allow-Origin: *</code>.
              </li>
            </ul>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
            >
              Retry Analysis
            </button>
          )}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
            >
              Verify Webhook URL
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 border-dashed rounded-xl p-8 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
          <FileText className="w-6 h-6 text-slate-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-300">No Message Analyzed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Paste any UPI text message or select one of the test scenarios above, then click Analyze.
          </p>
        </div>
      </div>
    );
  }

  const { riskLevel, normalizedLevel, reason, safetyAdvice, additionalFields, rawResponse, status, responseTimeMs } = result;

  const copyFullReport = () => {
    const reportText = `[UPI Guardian Analysis Report]
Risk Level: ${riskLevel}
Reason: ${reason}
Safety Advice: ${safetyAdvice}
Time: ${new Date(result.timestamp).toLocaleString()}
National Cyber Crime Helpline: 1930 / cybercrime.gov.in`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const getRiskTheme = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return {
          bg: 'bg-rose-950/30',
          border: 'border-rose-800/80',
          badgeBg: 'bg-rose-900/80 text-rose-200 border-rose-700',
          iconColor: 'text-rose-400',
          headingColor: 'text-rose-200',
          accent: 'from-rose-500 to-red-600',
          icon: ShieldX,
          label: 'CRITICAL / FRAUD RISK',
        };
      case 'medium':
        return {
          bg: 'bg-amber-950/30',
          border: 'border-amber-800/80',
          badgeBg: 'bg-amber-900/80 text-amber-200 border-amber-700',
          iconColor: 'text-amber-400',
          headingColor: 'text-amber-200',
          accent: 'from-amber-500 to-orange-600',
          icon: AlertTriangle,
          label: 'SUSPICIOUS / ELEVATED RISK',
        };
      case 'low':
        return {
          bg: 'bg-sky-950/30',
          border: 'border-sky-800/80',
          badgeBg: 'bg-sky-900/80 text-sky-200 border-sky-700',
          iconColor: 'text-sky-400',
          headingColor: 'text-sky-200',
          accent: 'from-sky-500 to-blue-600',
          icon: Info,
          label: 'LOW RISK / MINIMAL THREAT',
        };
      case 'safe':
        return {
          bg: 'bg-emerald-950/30',
          border: 'border-emerald-800/80',
          badgeBg: 'bg-emerald-900/80 text-emerald-200 border-emerald-700',
          iconColor: 'text-emerald-400',
          headingColor: 'text-emerald-200',
          accent: 'from-emerald-500 to-teal-600',
          icon: ShieldCheck,
          label: 'LEGITIMATE / SAFE',
        };
      default:
        return {
          bg: 'bg-slate-900/50',
          border: 'border-slate-800',
          badgeBg: 'bg-slate-800 text-slate-200 border-slate-700',
          iconColor: 'text-cyan-400',
          headingColor: 'text-slate-200',
          accent: 'from-cyan-500 to-blue-600',
          icon: Info,
          label: 'WORKFLOW VERDICT',
        };
    }
  };

  const theme = getRiskTheme(normalizedLevel);
  const IconComponent = theme.icon;

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className={`p-6 rounded-xl border ${theme.bg} ${theme.border} transition-all`}>
        {/* Risk Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0`}>
              <IconComponent className={`w-6 h-6 ${theme.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-400">
                  Risk Level
                </span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  {responseTimeMs}ms response
                </span>
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${theme.headingColor} mt-0.5`}>
                {riskLevel}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={copyFullReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Report Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Details: Reason & Safety Advice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5">
          {/* Reason Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Reason</span>
            </div>
            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
              {reason}
            </div>
          </div>

          {/* Safety Advice Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Safety Advice</span>
            </div>
            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg text-sm text-emerald-200/95 leading-relaxed font-sans whitespace-pre-wrap">
              {safetyAdvice}
            </div>
          </div>
        </div>

        {/* Additional Workflow Output Fields */}
        {Object.keys(additionalFields).length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Additional Workflow Insights
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Object.entries(additionalFields).map(([key, val]) => (
                <div
                  key={key}
                  className="p-3 bg-slate-950/50 border border-slate-800/60 rounded-lg text-xs"
                >
                  <span className="text-slate-400 font-mono text-[11px] block capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-200 font-medium break-all mt-0.5 block">
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action strip if High/Medium risk */}
        {(normalizedLevel === 'high' || normalizedLevel === 'medium') && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-300 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Do not click any links or enter your UPI PIN.</span>
            </div>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-200 bg-rose-950/60 border border-rose-800/80 rounded-lg hover:bg-rose-900/60 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Report to 1930 / cybercrime.gov.in</span>
              <ExternalLink className="w-3 h-3 text-rose-400" />
            </a>
          </div>
        )}
      </div>

      {/* Raw Response Viewer Component */}
      <RawResponseViewer
        rawResponse={rawResponse}
        status={status}
        responseTimeMs={responseTimeMs}
      />
    </div>
  );
};
