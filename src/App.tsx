/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MessageInput } from './components/MessageInput';
import { AnalysisResult } from './components/AnalysisResult';
import { SecurityGuidelines } from './components/SecurityGuidelines';
import { WebhookConfigModal } from './components/WebhookConfigModal';
import { ScanHistoryModal } from './components/ScanHistoryModal';
import { ChatbotWindow } from './components/ChatbotWindow';
import { analyzeMessageWithN8n } from './services/n8nService';
import { ParsedAnalysis, ScanHistoryRecord } from './types';
import { ShieldCheck, ArrowRight, Settings, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';
import shieldImg from './assets/images/upi_guardian_shield_1791564178453.jpg';

const STORAGE_KEY_WEBHOOK = 'upi_guardian_webhook_url';
const STORAGE_KEY_HISTORY = 'upi_guardian_scan_history';
const STORAGE_KEY_CHATBOT_WEBHOOK = 'upi_guardian_chatbot_webhook_url';

export default function App() {
  const [message, setMessage] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WEBHOOK);
    if (saved) return saved;
    return (import.meta.env.VITE_N8N_WEBHOOK_URL as string) || '';
  });
  const [chatbotWebhookUrl, setChatbotWebhookUrl] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CHATBOT_WEBHOOK);
    if (saved) return saved;
    return (import.meta.env.VITE_N8N_CHATBOT_WEBHOOK_URL as string) || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ParsedAnalysis | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save scan history to local storage
  const saveToHistory = (result: ParsedAnalysis) => {
    const newRecord: ScanHistoryRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      inputMessage: result.inputMessage,
      riskLevel: result.riskLevel,
      normalizedLevel: result.normalizedLevel,
      reason: result.reason,
      safetyAdvice: result.safetyAdvice,
      timestamp: result.timestamp,
      responseTimeMs: result.responseTimeMs,
      rawResponse: result.rawResponse,
    };

    setScanHistory((prev) => {
      const updated = [newRecord, ...prev.slice(0, 24)];
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch {
        // quota exceeded fallback
      }
      return updated;
    });
  };

  const handleSaveWebhooks = (scamUrl: string, chatUrl: string) => {
    setWebhookUrl(scamUrl);
    localStorage.setItem(STORAGE_KEY_WEBHOOK, scamUrl);
    setChatbotWebhookUrl(chatUrl);
    localStorage.setItem(STORAGE_KEY_CHATBOT_WEBHOOK, chatUrl);
  };

  const handleUpdateChatbotWebhookUrl = (url: string) => {
    setChatbotWebhookUrl(url);
    localStorage.setItem(STORAGE_KEY_CHATBOT_WEBHOOK, url);
  };

  const handleClearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  };

  const handleSelectHistoryRecord = (record: ScanHistoryRecord) => {
    setMessage(record.inputMessage);
    setAnalysisResult({
      riskLevel: record.riskLevel,
      normalizedLevel: record.normalizedLevel,
      reason: record.reason,
      safetyAdvice: record.safetyAdvice,
      additionalFields: {},
      rawResponse: record.rawResponse,
      status: 200,
      responseTimeMs: record.responseTimeMs,
      timestamp: record.timestamp,
      inputMessage: record.inputMessage,
    });
    setError(null);
    // Scroll smoothly to results
    const elem = document.getElementById('detector');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAnalyze = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    if (!webhookUrl || !webhookUrl.trim()) {
      setIsSettingsOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeMessageWithN8n({
        webhookUrl: webhookUrl.trim(),
        message: trimmedMessage,
      });

      setAnalysisResult(result);
      saveToHistory(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze message with n8n webhook.');
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Bar Header */}
      <Header
        webhookUrl={webhookUrl}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={scanHistory.length}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <Cpu className="w-4 h-4" />
              <span>n8n Workflow Intelligence Engine</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-400">Zero Synthetic Hallucinations</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Detect Suspicious UPI Messages Before Approving Payments
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Verify fraudulent collect requests, fake cashback links, electricity disconnection threats, and reverse-charge scams. Connects directly to your <strong className="text-slate-200">n8n Production Webhook</strong> to return the exact workflow risk level, reasoning, and safety advice.
            </p>

            {/* Current Webhook Connectivity Bar */}
            <div className="pt-2">
              <div className="inline-flex flex-wrap items-center gap-2 p-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs">
                <span className="text-slate-400 px-2 font-medium">Webhook Target:</span>
                {webhookUrl ? (
                  <span className="font-mono text-cyan-300 max-w-xs sm:max-w-md truncate bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    {webhookUrl}
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium px-2 py-1 bg-amber-950/40 rounded border border-amber-900/60">
                    Not connected yet
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded transition-colors font-medium ml-auto flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          </div>

          {/* Hero Visual Shield */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl shadow-cyan-950/40 bg-slate-900">
              <img
                src={shieldImg}
                alt="UPI Guardian Payment Security Shield"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Detector Main Workspace */}
        <section id="detector" className="space-y-6 pt-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Message Analysis Console
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Submits POST payload <code className="text-cyan-300 font-mono text-[11px]">{`{ "input": "..." }`}</code> to your configured n8n webhook.
              </p>
            </div>
          </div>

          {/* Grid layout: Input on left, Result on right on wide displays */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left: Input Textarea and Samples */}
            <MessageInput
              message={message}
              setMessage={setMessage}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              webhookUrl={webhookUrl}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Right: Results / Loading / Errors */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold text-slate-300">Live Webhook Verdict:</span>
                <span className="text-slate-500">Unfiltered n8n response</span>
              </div>
              <AnalysisResult
                result={analysisResult}
                isLoading={isLoading}
                error={error}
                onRetry={handleAnalyze}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </div>
          </div>
        </section>

        {/* Security Guidelines & NPCI Standards */}
        <SecurityGuidelines />
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-slate-950 border-t border-slate-800/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-medium">UPI Guardian</span>
            <span className="text-slate-700" aria-hidden="true">·</span>
            <span>n8n Production Webhook Security Client</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>National Cyber Crime Helpline: <strong className="text-slate-200 font-mono">1930</strong></span>
            <span className="text-slate-700" aria-hidden="true">·</span>
            <a
              href="https://www.npci.org.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 transition-colors"
            >
              NPCI Guidelines
            </a>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <WebhookConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        scamWebhookUrl={webhookUrl}
        chatbotWebhookUrl={chatbotWebhookUrl}
        onSave={handleSaveWebhooks}
      />

      {/* History Modal */}
      <ScanHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={scanHistory}
        onSelectRecord={handleSelectHistoryRecord}
        onClearHistory={handleClearHistory}
      />

      {/* Floating AI Chatbot Window */}
      <ChatbotWindow
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((prev) => !prev)}
        chatbotWebhookUrl={chatbotWebhookUrl}
        onUpdateChatbotWebhookUrl={handleUpdateChatbotWebhookUrl}
        scamAnalysisWebhookUrl={webhookUrl}
      />
    </div>
  );
}
