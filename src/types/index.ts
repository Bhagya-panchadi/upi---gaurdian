export type RiskLevel = 'high' | 'medium' | 'low' | 'safe' | 'unknown';

export interface ParsedAnalysis {
  riskLevel: string;
  normalizedLevel: RiskLevel;
  reason: string;
  safetyAdvice: string;
  additionalFields: Record<string, any>;
  rawResponse: any;
  status: number;
  responseTimeMs: number;
  timestamp: string;
  inputMessage: string;
}

export interface ScanHistoryRecord {
  id: string;
  inputMessage: string;
  riskLevel: string;
  normalizedLevel: RiskLevel;
  reason: string;
  safetyAdvice: string;
  timestamp: string;
  responseTimeMs: number;
  rawResponse: any;
}

export interface WebhookConfig {
  url: string;
  useProxy: boolean;
  timeoutMs: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isError?: boolean;
}

export interface ChatbotConfig {
  provider: 'gemini' | 'n8n';
  n8nWebhookUrl: string;
}
