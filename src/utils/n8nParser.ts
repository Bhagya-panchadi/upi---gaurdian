import { ParsedAnalysis, RiskLevel } from '../types';

/**
 * Normalizes any text risk string into a categorized risk level
 */
export function normalizeRisk(levelStr?: string): RiskLevel {
  if (!levelStr) return 'unknown';
  const clean = levelStr.toLowerCase().trim();

  if (
    clean.includes('high') ||
    clean.includes('critical') ||
    clean.includes('danger') ||
    clean.includes('severe') ||
    clean.includes('fraud') ||
    clean.includes('scam') ||
    clean.includes('phishing') ||
    clean.includes('malicious')
  ) {
    return 'high';
  }

  if (
    clean.includes('medium') ||
    clean.includes('moderate') ||
    clean.includes('suspicious') ||
    clean.includes('warning') ||
    clean.includes('caution')
  ) {
    return 'medium';
  }

  if (
    clean.includes('low') ||
    clean.includes('minimal') ||
    clean.includes('minor')
  ) {
    return 'low';
  }

  if (
    clean.includes('safe') ||
    clean.includes('legit') ||
    clean.includes('clean') ||
    clean.includes('secure') ||
    clean.includes('genuine') ||
    clean.includes('none')
  ) {
    return 'safe';
  }

  return 'unknown';
}

/**
 * Intelligent parser that extracts risk_level, reason, safety_advice and extra fields
 * from any arbitrary n8n workflow output format.
 */
export function parseN8nResponse(
  data: any,
  status: number,
  responseTimeMs: number,
  inputMessage: string
): ParsedAnalysis {
  let target: any = data;

  // If n8n returns an array (e.g., [ { json: { ... } } ] or [ { risk_level: ... } ])
  if (Array.isArray(target)) {
    if (target.length > 0) {
      target = target[0];
    } else {
      target = {};
    }
  }

  // Handle standard n8n { json: { ... } } wrapper
  if (target && typeof target === 'object' && target.json && typeof target.json === 'object') {
    target = target.json;
  }

  // Handle stringified JSON or plain string output
  if (typeof target === 'string') {
    try {
      const parsed = JSON.parse(target);
      if (typeof parsed === 'object' && parsed !== null) {
        target = parsed;
      }
    } catch {
      // It's a plain text/markdown string
      target = parseTextResponse(target);
    }
  }

  // If target has a single 'output' or 'text' or 'response' property that is JSON string or object
  if (target && typeof target === 'object') {
    const singleKey = Object.keys(target)[0];
    if (Object.keys(target).length === 1 && (singleKey === 'output' || singleKey === 'text' || singleKey === 'response' || singleKey === 'message' || singleKey === 'result')) {
      const innerVal = target[singleKey];
      if (typeof innerVal === 'string') {
        try {
          const parsed = JSON.parse(innerVal);
          if (typeof parsed === 'object' && parsed !== null) {
            target = parsed;
          }
        } catch {
          // Check if markdown-like text
          const extracted = parseTextResponse(innerVal);
          if (extracted.reason || extracted.safety_advice || extracted.risk_level) {
            target = extracted;
          }
        }
      } else if (typeof innerVal === 'object' && innerVal !== null) {
        target = innerVal;
      }
    }
  }

  // Extract risk level from possible keys
  const rawRisk =
    target?.risk_level ??
    target?.riskLevel ??
    target?.risk ??
    target?.Risk_Level ??
    target?.severity ??
    target?.threat_level ??
    target?.threatLevel ??
    target?.verdict ??
    target?.status ??
    '';

  // Extract reason from possible keys
  const rawReason =
    target?.reason ??
    target?.Reason ??
    target?.explanation ??
    target?.analysis ??
    target?.details ??
    target?.description ??
    target?.message ??
    '';

  // Extract safety advice from possible keys
  const rawAdvice =
    target?.safety_advice ??
    target?.safetyAdvice ??
    target?.Safety_Advice ??
    target?.advice ??
    target?.safety_tips ??
    target?.safetyTips ??
    target?.recommendation ??
    target?.recommendations ??
    target?.action_items ??
    target?.actions ??
    '';

  const riskLevelStr = String(rawRisk || '').trim();
  const reasonStr = typeof rawReason === 'object' ? JSON.stringify(rawReason, null, 2) : String(rawReason || '').trim();
  const adviceStr = typeof rawAdvice === 'object' ? JSON.stringify(rawAdvice, null, 2) : String(rawAdvice || '').trim();

  // Collect any remaining properties as additional fields
  const standardKeys = new Set([
    'risk_level',
    'risklevel',
    'risk',
    'severity',
    'threat_level',
    'threatlevel',
    'verdict',
    'status',
    'reason',
    'explanation',
    'analysis',
    'details',
    'description',
    'safety_advice',
    'safetyadvice',
    'advice',
    'safety_tips',
    'safetytips',
    'recommendation',
    'recommendations',
  ]);

  const additionalFields: Record<string, any> = {};
  if (target && typeof target === 'object' && !Array.isArray(target)) {
    for (const [key, value] of Object.entries(target)) {
      if (!standardKeys.has(key.toLowerCase())) {
        additionalFields[key] = value;
      }
    }
  }

  const normalized = normalizeRisk(riskLevelStr || reasonStr);

  return {
    riskLevel: riskLevelStr || (normalized !== 'unknown' ? normalized.toUpperCase() + ' RISK' : 'Analyzed'),
    normalizedLevel: normalized,
    reason: reasonStr || (typeof data === 'string' ? data : 'Analysis returned from n8n workflow.'),
    safetyAdvice: adviceStr || 'Always verify the sender VPA, never enter your UPI PIN to receive money, and report suspicious transactions to 1930.',
    additionalFields,
    rawResponse: data,
    status,
    responseTimeMs,
    timestamp: new Date().toISOString(),
    inputMessage,
  };
}

/**
 * Fallback parser for text/markdown returned by an n8n LLM or chain node
 */
function parseTextResponse(text: string): Record<string, string> {
  const result: Record<string, string> = {};

  const riskMatch = text.match(/(?:risk(?:\s*level)?|verdict|threat):\s*([^\n\r]+)/i);
  if (riskMatch) {
    result.risk_level = riskMatch[1].trim().replace(/^[*_#]+|[*_#]+$/g, '');
  }

  const reasonMatch = text.match(/(?:reason|explanation|analysis):\s*([\s\S]*?)(?=(?:safety|advice|recommendation|$))/i);
  if (reasonMatch) {
    result.reason = reasonMatch[1].trim().replace(/^[*_#]+|[*_#]+$/g, '');
  }

  const adviceMatch = text.match(/(?:safety(?:\s*advice)?|recommendation|advice|tips):\s*([\s\S]*?)$/i);
  if (adviceMatch) {
    result.safety_advice = adviceMatch[1].trim().replace(/^[*_#]+|[*_#]+$/g, '');
  }

  if (!result.reason && !result.risk_level && !result.safety_advice) {
    result.reason = text;
  }

  return result;
}
