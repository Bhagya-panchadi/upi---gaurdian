import { ParsedAnalysis } from '../types';
import { parseN8nResponse } from '../utils/n8nParser';

export interface SendToWebhookOptions {
  webhookUrl: string;
  message: string;
  timeoutMs?: number;
}

export class WebhookError extends Error {
  status?: number;
  isCorsError?: boolean;
  rawError?: any;

  constructor(message: string, options?: { status?: number; isCorsError?: boolean; rawError?: any }) {
    super(message);
    this.name = 'WebhookError';
    this.status = options?.status;
    this.isCorsError = options?.isCorsError;
    this.rawError = options?.rawError;
  }
}

/**
 * Sends a POST request to the user's n8n Production Webhook URL
 * with exact JSON payload: { "input": "user message" }
 */
export async function analyzeMessageWithN8n({
  webhookUrl,
  message,
  timeoutMs = 35000,
}: SendToWebhookOptions): Promise<ParsedAnalysis> {
  const trimmedUrl = webhookUrl.trim();

  if (!trimmedUrl) {
    throw new WebhookError('Please configure your n8n Production Webhook URL before analyzing.');
  }

  // Validate URL format
  try {
    new URL(trimmedUrl);
  } catch {
    throw new WebhookError('Invalid Webhook URL format. Please enter a valid URL (e.g. https://your-n8n.domain.com/webhook/...)');
  }

  const payload = {
    input: message,
  };

  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(trimmedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Math.round(performance.now() - startTime);

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {
        errorBody = response.statusText;
      }

      throw new WebhookError(
        `n8n Webhook returned HTTP ${response.status} (${response.statusText}): ${errorBody || 'No error details provided by webhook'}`,
        { status: response.status, rawError: errorBody }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    let responseData: any;

    if (contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch (jsonErr) {
        responseData = await response.text();
      }
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
    }

    return parseN8nResponse(responseData, response.status, duration, message);
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new WebhookError(
        `Request timed out after ${timeoutMs / 1000} seconds. Please check if your n8n workflow is active and taking too long to execute.`,
        { status: 408 }
      );
    }

    if (err instanceof WebhookError) {
      throw err;
    }

    // Check for common browser CORS or network connection failure
    const errorMsg = String(err?.message || err);
    const isNetworkOrCors =
      err instanceof TypeError &&
      (errorMsg.includes('Failed to fetch') ||
        errorMsg.includes('NetworkError') ||
        errorMsg.includes('Load failed'));

    if (isNetworkOrCors) {
      throw new WebhookError(
        'Unable to connect to the n8n webhook. This usually occurs if: (1) The n8n instance does not allow browser cross-origin requests (CORS), (2) The webhook URL is incorrect or inactive, or (3) The n8n server is offline.',
        { isCorsError: true, rawError: err }
      );
    }

    throw new WebhookError(`Network request error: ${errorMsg}`, { rawError: err });
  }
}
