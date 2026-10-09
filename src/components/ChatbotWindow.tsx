import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Bot,
  User,
  Settings2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Check,
  ExternalLink,
  HelpCircle,
  Copy
} from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessageToN8n } from '../services/chatService';

interface ChatbotWindowProps {
  isOpen: boolean;
  onToggle: () => void;
  chatbotWebhookUrl: string;
  onUpdateChatbotWebhookUrl: (url: string) => void;
  scamAnalysisWebhookUrl?: string;
}

const STARTER_PROMPTS = [
  'Do I need to enter my UPI PIN to receive money or cashback?',
  'Someone asked me to scan a QR code on OLX to accept payment. Is it safe?',
  'I received an electricity bill disconnection threat with a UPI ID. What should I do?',
  'How do I report a fraudulent UPI transaction to the 1930 helpline?',
];

export const ChatbotWindow: React.FC<ChatbotWindowProps> = ({
  isOpen,
  onToggle,
  chatbotWebhookUrl,
  onUpdateChatbotWebhookUrl,
  scamAnalysisWebhookUrl,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: `Hello! I'm your **UPI Guardian Assistant** connected to your n8n workflow.\n\nAsk me any question about UPI fraud, collect requests, QR code scams, or digital payment safety.\n\n⚠️ **Golden Rule:** You **NEVER** need to enter your UPI PIN or scan a QR code to receive money.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [urlInput, setUrlInput] = useState(chatbotWebhookUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrlInput(chatbotWebhookUrl);
  }, [chatbotWebhookUrl]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSaveUrl = () => {
    const trimmed = urlInput.trim();
    onUpdateChatbotWebhookUrl(trimmed);
    setShowConfig(false);
    setTestStatus('idle');
  };

  const handleUseScamWebhook = () => {
    if (scamAnalysisWebhookUrl) {
      setUrlInput(scamAnalysisWebhookUrl);
      onUpdateChatbotWebhookUrl(scamAnalysisWebhookUrl);
      setShowConfig(false);
    }
  };

  const handleTestPing = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setTestStatus('error');
      setTestMessage('Please enter a Webhook URL.');
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
    setTestMessage('Sending ping with body: {"input": "Ping test"}...');

    try {
      const res = await sendChatMessageToN8n(trimmed, 'Ping test connection from UPI Guardian Assistant');
      setTestStatus('success');
      setTestMessage(`Received response from n8n: ${res.slice(0, 120)}`);
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'Connection failed.');
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    if (!chatbotWebhookUrl.trim()) {
      setShowConfig(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Sends POST request with body { "input": text } to n8n backend
      const reply = await sendChatMessageToN8n(chatbotWebhookUrl.trim(), text);

      const botMsg: ChatMessage = {
        id: `${Date.now()}-bot`,
        sender: 'bot',
        text: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `${Date.now()}-err`,
        sender: 'bot',
        text: `Error from n8n backend: ${err?.message || 'Failed to reach webhook'}. Check your n8n Chatbot Webhook URL in settings.`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-msg-reset',
        sender: 'bot',
        text: `Chat history cleared. How can I assist you with UPI security today?\n\nRemember: Never share your UPI PIN, OTP, or remote screen sharing code with anyone.`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const hasConfiguredWebhook = Boolean(chatbotWebhookUrl && chatbotWebhookUrl.trim().length > 0);

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full shadow-xl shadow-cyan-950/50 border border-cyan-400/30 transition-all hover:scale-105 group"
          aria-label="Open UPI Guardian Assistant Chatbot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-xs font-semibold tracking-wide">
            UPI Guardian Assistant
          </span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 w-[calc(100vw-2rem)] sm:w-[440px] max-h-[85vh] h-[620px] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-cyan-500/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                  <span>UPI Guardian Assistant</span>
                </h3>
                <p className="text-[11px] text-cyan-400 font-medium truncate flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>
                    {hasConfiguredWebhook ? 'n8n Webhook Backend' : 'Configure n8n Webhook'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showConfig || !hasConfiguredWebhook
                    ? 'text-cyan-400 bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Configure n8n Chatbot Webhook URL"
              >
                <Settings2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Clear current session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onToggle}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Close chat window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Persistent Webhook Target Status Bar */}
          <div className="px-3.5 py-1.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0 text-slate-400">
              <span className="font-semibold text-slate-300 shrink-0">Webhook:</span>
              {hasConfiguredWebhook ? (
                <span className="font-mono text-cyan-300 truncate text-[10px]">
                  {chatbotWebhookUrl}
                </span>
              ) : (
                <span className="text-amber-400 font-medium truncate text-[10px]">
                  Not set - click Setup
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-cyan-400 hover:text-cyan-300 text-[10px] font-semibold underline shrink-0"
            >
              {showConfig ? 'Hide' : hasConfiguredWebhook ? 'Change' : 'Setup'}
            </button>
          </div>

          {/* Security Alert Header Strip */}
          <div className="px-3.5 py-1.5 bg-amber-950/40 border-b border-amber-900/60 flex items-center gap-2 text-[11px] text-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>Never</strong> share your UPI PIN or OTP. We will never ask for credentials.
            </span>
          </div>

          {/* Configurable n8n Chatbot Webhook URL Drawer */}
          {showConfig && (
            <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3 text-xs animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">n8n Chatbot Webhook URL</span>
                <span className="text-[10px] text-slate-500 font-mono">POST {`{"input": "question"}`}</span>
              </div>

              <div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://n8n.your-instance.com/webhook/chatbot-qa"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Separate endpoint from your scam-analysis webhook to prevent routing conflicts.
                </p>
              </div>

              {scamAnalysisWebhookUrl && scamAnalysisWebhookUrl !== urlInput && (
                <button
                  type="button"
                  onClick={handleUseScamWebhook}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline block"
                >
                  Use same URL as Scam Detector ({scamAnalysisWebhookUrl.slice(0, 35)}...)
                </button>
              )}

              {testStatus !== 'idle' && (
                <div
                  className={`p-2.5 rounded border text-[11px] ${
                    testStatus === 'testing'
                      ? 'bg-blue-950/40 border-blue-800 text-blue-300'
                      : testStatus === 'success'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}
                >
                  {testMessage}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestPing}
                  disabled={testStatus === 'testing' || !urlInput.trim()}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
                >
                  Test Ping
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfig(false)}
                    className="px-2.5 py-1 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveUrl}
                    className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded text-xs transition-colors"
                  >
                    Save Webhook
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Unconfigured Webhook Alert Banner if empty */}
          {!hasConfiguredWebhook && !showConfig && (
            <div className="p-3 bg-cyan-950/40 border-b border-cyan-800/80 flex items-center justify-between gap-2 text-xs text-cyan-200">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Enter your n8n Chatbot Webhook URL to activate the assistant:</span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfig(true)}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-semibold text-[11px] shrink-0"
              >
                Configure Now
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-900/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : msg.isError
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-slate-800 text-cyan-400 border border-slate-700'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : msg.isError
                        ? 'bg-rose-950/60 border border-rose-900 text-rose-200 rounded-tl-none'
                        : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.text.split('\n').map((line, i) => (
                        <p key={i} className={line.startsWith('- ') || line.startsWith('* ') ? 'pl-2' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                    <div
                      className={`text-[10px] mt-1 text-right font-mono tabular-nums ${
                        isUser ? 'text-blue-200' : 'text-slate-500'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-cyan-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl rounded-tl-none px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Sending to n8n Webhook & awaiting response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Starter prompt chips if only welcome message exists */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-3.5 py-2 bg-slate-950/80 border-t border-slate-800/80 space-y-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">
                Suggested Questions:
              </span>
              <div className="flex flex-col gap-1">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-left text-[11px] text-cyan-300 hover:text-white hover:bg-slate-800/80 px-2 py-1 rounded transition-colors truncate flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-2.5 h-2.5 text-cyan-500 shrink-0" />
                    <span className="truncate">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  hasConfiguredWebhook
                    ? "Ask a question (sends { input: message } to n8n)..."
                    : "Please configure your n8n Chatbot Webhook URL above..."
                }
                disabled={isLoading}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={isLoading || !inputText.trim()}
                className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-cyan-600/30 shrink-0"
                title="Send message to n8n"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-0.5">
              <span>National Helpline: <strong className="text-slate-400">1930</strong></span>
              <span>Sends body <code className="text-cyan-400 font-mono">{`{"input": "..."}`}</code> to n8n</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
