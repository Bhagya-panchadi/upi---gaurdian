/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatMessage } from '../types';

/**
 * Extracts and displays the actual response returned by n8n workflow
 */
export function extractN8nChatbotReply(data: any): string {
  if (data === null || data === undefined) {
    return 'No response content returned from n8n workflow.';
  }

  // Handle plain text
  if (typeof data === 'string') {
    const trimmed = data.trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null) {
        return extractN8nChatbotReply(parsed);
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  // Handle array of items from n8n (e.g. [ { output: "..." } ])
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return 'Empty response array returned from n8n workflow.';
    }
    return extractN8nChatbotReply(data[0]);
  }

  // Handle n8n standard { json: { ... } } wrapper
  if (data && typeof data === 'object' && data.json) {
    return extractN8nChatbotReply(data.json);
  }

  // Extract common n8n AI / Agent / Webhook response keys
  if (typeof data === 'object') {
    const candidate =
      data.output ??
      data.text ??
      data.reply ??
      data.response ??
      data.message ??
      data.answer ??
      data.result ??
      data.content;

    if (candidate !== undefined) {
      if (typeof candidate === 'string') return candidate.trim();
      if (typeof candidate === 'object') return JSON.stringify(candidate, null, 2);
      return String(candidate);
    }

    // If target has structured reason and safety advice
    if (data.reason || data.safety_advice || data.safetyAdvice || data.risk_level) {
      const parts: string[] = [];
      if (data.risk_level || data.riskLevel) {
        parts.push(`**Risk Level:** ${data.risk_level || data.riskLevel}`);
      }
      if (data.reason) {
        parts.push(`**Reason:** ${data.reason}`);
      }
      if (data.safety_advice || data.safetyAdvice) {
        parts.push(`**Safety Advice:** ${data.safety_advice || data.safetyAdvice}`);
      }
      if (parts.length > 0) {
        return parts.join('\n\n');
      }
    }

    // If it's a general JSON object, display clean formatted JSON
    return JSON.stringify(data, null, 2);
  }

  return String(data);
}

/**
 * Sends a chat message to the n8n Chatbot Webhook URL using a POST request
 * with exact JSON body: { "input": "user's question" }
 * Displays the actual response returned by n8n.
 */
export async function sendChatMessageToN8n(
  webhookUrl: string,
  userQuestion: string
): Promise<string> {
  const trimmedUrl = webhookUrl.trim();
  if (!trimmedUrl) {
    throw new Error('Please configure your n8n Chatbot Webhook URL before sending messages.');
  }

  const trimmedQuestion = userQuestion.trim();
  if (!trimmedQuestion) {
    throw new Error('Message cannot be empty.');
  }

  const payload = {
    input: trimmedQuestion,
  };

  // Attempt direct browser request first
  try {
    const response = await fetch(trimmedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {
        errorBody = response.statusText;
      }
      throw new Error(`n8n Webhook returned HTTP ${response.status}: ${errorBody || response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let responseData: any;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
    }

    return extractN8nChatbotReply(responseData);
  } catch (err: any) {
    const errorMsg = String(err?.message || err);
    const isCorsOrNetwork =
      err instanceof TypeError &&
      (errorMsg.includes('Failed to fetch') ||
        errorMsg.includes('NetworkError') ||
        errorMsg.includes('Load failed'));

    // If direct browser request was blocked by CORS, seamlessly route via the server proxy
    if (isCorsOrNetwork) {
      try {
        const proxyResponse = await fetch('/api/n8n-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            webhookUrl: trimmedUrl,
            input: trimmedQuestion,
          }),
        });

        if (!proxyResponse.ok) {
          let proxyErr = '';
          try {
            const errObj = await proxyResponse.json();
            proxyErr = errObj.error || proxyResponse.statusText;
          } catch {
            proxyErr = await proxyResponse.text();
          }
          throw new Error(`n8n Chatbot error (HTTP ${proxyResponse.status}): ${proxyErr}`);
        }

        const contentType = proxyResponse.headers.get('content-type') || '';
        let proxyData: any;

        if (contentType.includes('application/json')) {
          proxyData = await proxyResponse.json();
        } else {
          const text = await proxyResponse.text();
          try {
            proxyData = JSON.parse(text);
          } catch {
            proxyData = text;
          }
        }

        return extractN8nChatbotReply(proxyData);
      } catch (proxyErr: any) {
        throw new Error(proxyErr.message || 'Failed to reach n8n Chatbot Webhook.');
      }
    }

    throw new Error(err.message || 'Failed to communicate with n8n Chatbot Webhook.');
  }
}
