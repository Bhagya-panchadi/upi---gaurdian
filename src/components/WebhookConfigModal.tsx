import React, { useState } from 'react';
import { X, Check, AlertCircle, HelpCircle, ArrowRight, Zap, Copy, Bot, ShieldCheck } from 'lucide-react';
import { sendChatMessageToN8n } from '../services/chatService';

interface WebhookConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  scamWebhookUrl: string;
  chatbotWebhookUrl: string;
  onSave: (scamUrl: string, chatbotUrl: string) => void;
}

export const WebhookConfigModal: React.FC<WebhookConfigModalProps> = ({
  isOpen,
  onClose,
  scamWebhookUrl,
  chatbotWebhookUrl,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'scam' | 'chatbot'>('scam');
  const [scamUrlInput, setScamUrlInput] = useState(scamWebhookUrl);
  const [chatUrlInput, setChatUrlInput] = useState(chatbotWebhookUrl);

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [copiedPayload, setCopiedPayload] = useState(false);

  if (!isOpen) return null;

  const currentUrl = activeTab === 'scam' ? scamUrlInput : chatUrlInput;
  const setCurrentUrl = (val: string) => {
    if (activeTab === 'scam') setScamUrlInput(val);
    else setChatUrlInput(val);
  };

  const handleSave = () => {
    onSave(scamUrlInput.trim(), chatUrlInput.trim());
    onClose();
  };

  const handleTestConnection = async () => {
    const trimmed = currentUrl.trim();
    if (!trimmed) {
      setTestStatus('error');
      setTestMessage('Please enter a Webhook URL first.');
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      setTestStatus('error');
      setTestMessage('Invalid URL format. Please start with https://');
      return;
    }

    setTestStatus('testing');
    setTestMessage(`Testing POST {"input": "Ping test"} to ${activeTab === 'scam' ? 'Scam Detector' : 'Chatbot'} webhook...`);

    try {
      if (activeTab === 'scam') {
        const res = await fetch(trimmed, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: 'Ping test from UPI Guardian' }),
        });
        if (res.ok) {
          setTestStatus('success');
          setTestMessage(`Webhook connected successfully! HTTP ${res.status}`);
        } else {
          const text = await res.text();
          setTestStatus('error');
          setTestMessage(`Received HTTP ${res.status}: ${text.slice(0, 100) || res.statusText}`);
        }
      } else {
        const reply = await sendChatMessageToN8n(trimmed, 'Ping test connection from UPI Guardian Assistant');
        setTestStatus('success');
        setTestMessage(`n8n Chatbot replied: ${reply.slice(0, 120)}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Connection failed: ${err.message || 'Network/CORS error'}. Check that your n8n workflow is Active.`);
    }
  };

  const copySamplePayload = () => {
    const payload = activeTab === 'scam'
      ? { input: "Sample suspicious UPI message" }
      : { input: "User's question about UPI safety" };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleCopyScamToChat = () => {
    setChatUrlInput(scamUrlInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">n8n Production Webhooks</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure endpoints for message scam analysis and the AI chatbot assistant.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('scam');
              setTestStatus('idle');
            }}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'scam'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>1. Scam Analysis Webhook</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('chatbot');
              setTestStatus('idle');
            }}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'chatbot'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>2. AI Chatbot Webhook</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {activeTab === 'scam' ? (
            <div>
              <label htmlFor="scam-webhook-url" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Scam Detection Production Webhook URL
              </label>
              <input
                id="scam-webhook-url"
                type="url"
                value={scamUrlInput}
                onChange={(e) => setScamUrlInput(e.target.value)}
                placeholder="https://n8n.your-instance.com/webhook/detect-upi-scam"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                Used for analyzing pasted UPI SMS and payment notifications.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="chat-webhook-url" className="block text-xs font-semibold text-slate-300">
                  AI Chatbot Production Webhook URL
                </label>
                {scamUrlInput && scamUrlInput !== chatUrlInput && (
                  <button
                    type="button"
                    onClick={handleCopyScamToChat}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Copy Scam Webhook URL
                  </button>
                )}
              </div>
              <input
                id="chat-webhook-url"
                type="url"
                value={chatUrlInput}
                onChange={(e) => setChatUrlInput(e.target.value)}
                placeholder="https://n8n.your-instance.com/webhook/upi-chatbot"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                Dedicated endpoint for answering user security questions via POST <code className="text-cyan-300 font-mono">{`{"input":"..."}`}</code>.
              </p>
            </div>
          )}

          {/* Payload schema notice */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">
                JSON Body Sent to Webhook:
              </span>
              <button
                type="button"
                onClick={copySamplePayload}
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <Copy className="w-3 h-3" />
                {copiedPayload ? 'Copied' : 'Copy JSON'}
              </button>
            </div>
            <pre className="font-mono text-cyan-300 bg-slate-900/90 p-2.5 rounded border border-slate-800 text-[11px] overflow-x-auto">
{activeTab === 'scam'
? `{
  "input": "User pasted UPI message"
}`
: `{
  "input": "User's question"
}`}
            </pre>
            <p className="text-slate-400 text-[11px]">
              {activeTab === 'scam'
                ? 'Your n8n workflow returns risk_level, reason, and safety_advice.'
                : 'Your n8n workflow returns the conversational safety advice (text, reply, or output).'}
            </p>
          </div>

          {/* Test Status feedback */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                testStatus === 'testing'
                  ? 'bg-blue-950/40 border-blue-800 text-blue-300'
                  : testStatus === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {testStatus === 'testing' && <Zap className="w-4 h-4 shrink-0 animate-spin" />}
              {testStatus === 'success' && <Check className="w-4 h-4 shrink-0 text-emerald-400" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
              <span className="break-all">{testMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing' || !currentUrl.trim()}
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            Test Current Tab
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors shadow-sm shadow-cyan-600/30"
            >
              <span>Save Webhooks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
