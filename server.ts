import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Initialize Gemini AI client server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Chatbot AI Route: UPI Guardian Assistant
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message text is required' });
      }

      const systemInstruction = `You are "UPI Guardian Assistant", a dedicated cybersecurity and fraud prevention assistant for the UPI Guardian application.
Your mission is to answer questions about UPI scams, suspicious payment SMS/messages, QR code fraud, OTP and UPI PIN safety, fake cashback/reward offers, accidental transfer/refund scams, and safe digital payment practices in India.

CRITICAL SECURITY RULES:
1. Always remind users that UPI PIN is ONLY needed to SEND money or deduct funds. You NEVER need to enter your UPI PIN to RECEIVE money, rewards, or cashback.
2. Scanning a QR code ALWAYS debits money, never receives money.
3. WARN users never to share their UPI PIN, OTP, ATM PIN, bank passwords, or remote access codes.
4. NEVER ask for actual banking credentials, card numbers, or OTP.
5. NEVER guarantee that an unverified transaction or unknown link is definitely safe. Always advise caution and verifying through official bank channels.
6. If a user suspects they have been defrauded, urge them to immediately call the National Cyber Crime Helpline at 1930 and file a complaint at cybercrime.gov.in within the 2-hour window, and report the transaction in their UPI app (Google Pay, PhonePe, Paytm, BHIM).
7. Keep responses helpful, structured, concise, and easy to read with bullet points when providing steps.`;

      // Build conversation history
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-10)) {
          if (item && item.text) {
            const role = item.sender === 'user' ? 'user' : 'model';
            contents.push({ role, parts: [{ text: String(item.text) }] });
          }
        }
      }

      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text || 'Please remain safe: never enter your UPI PIN to receive money or scan unknown QR codes.';
      return res.json({ reply });
    } catch (err: any) {
      console.error('Chat error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate assistant response.',
      });
    }
  });

  // Dedicated Chatbot n8n Webhook Proxy route
  // Sends exact JSON body { "input": message } to the user's n8n chatbot webhook
  app.post('/api/n8n-chat', async (req, res) => {
    try {
      const { webhookUrl, input } = req.body;
      if (!webhookUrl || typeof webhookUrl !== 'string') {
        return res.status(400).json({ error: 'n8n Chatbot Webhook URL is required' });
      }
      if (!input || typeof input !== 'string') {
        return res.status(400).json({ error: 'Input message is required' });
      }

      const response = await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify({
          input: input.trim(),
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return res.status(response.status).json(data);
      } else {
        const text = await response.text();
        return res.status(response.status).send(text);
      }
    } catch (err: any) {
      console.error('n8n Chatbot proxy error:', err);
      return res.status(500).json({
        error: 'Failed to reach n8n Chatbot Webhook: ' + (err?.message || String(err)),
      });
    }
  });

  // In production, serve dist; in dev, mount Vite middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UPI Guardian server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
