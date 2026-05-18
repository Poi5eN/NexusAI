/**
 * OpenRouter LLM Service
 * All personas route through here. Never call OpenRouter directly from agents.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

const BASE_URL = 'https://openrouter.ai/api/v1';

// Robust free model pool to rotate through if limits are hit
const FALLBACK_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'mistralai/mistral-7b-instruct:free',
  'arcee-ai/trinity-large-thinking:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'deepseek/deepseek-v4-flash:free'
];

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY is not set in server/.env');
  return key;
}

import { chatHF } from './huggingface.ts';

/** Returns a streaming Response from OpenRouter (SSE). */
export async function streamChat(options: ChatOptions): Promise<Response> {
  const apiKey = getApiKey();
  const modelsToTry = [options.model, ...FALLBACK_MODELS.filter(m => m !== options.model)];
  
  for (const model of modelsToTry) {
    try {
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nexus.dev',
          'X-Title': 'NEXUS AI Platform',
        },
        body: JSON.stringify({ ...options, model, stream: true }),
      });

      // Check for rate limits (OpenRouter sometimes returns 200/400 with a specific error JSON)
      if (!res.ok) {
        const err = await res.text();
        const isRateLimit = res.status === 429 || err.toLowerCase().includes('rate limit exceeded') || err.toLowerCase().includes('429');
        
        if (isRateLimit && model !== modelsToTry[modelsToTry.length - 1]) {
          console.warn(`[OPENROUTER] Rate limited on ${model}. Trying next fallback...`);
          continue;
        }
        
        // If it's the last OpenRouter model and it failed, we'll try HF below
        if (isRateLimit && model === modelsToTry[modelsToTry.length - 1]) {
          console.warn(`[OPENROUTER] All free models exhausted. Falling back to Hugging Face...`);
          break; 
        }

        throw new Error(`LLM Error: ${err}`);
      }

      return res;
    } catch (err) {
      if (model === modelsToTry[modelsToTry.length - 1]) throw err;
      console.error(`[OPENROUTER] Connection error on ${model}:`, err);
      continue;
    }
  }
  
  // FINAL FALLBACK: Hugging Face (non-streaming, but reliable)
  console.log("[FALLBACK] Using Hugging Face Fail-Safe...");
  const hfContent = await chatHF(options.messages);
  
  // Mock an SSE stream response that looks like OpenRouter's format
  const mockChunk = {
    choices: [{
      delta: { content: hfContent }
    }]
  };
  const streamData = `data: ${JSON.stringify(mockChunk)}\n\ndata: [DONE]\n\n`;
  
  return new Response(streamData, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}

/** Returns the full completion as a string (non-streaming). */
export async function chat(options: ChatOptions): Promise<string> {
  const apiKey = getApiKey();
  const modelsToTry = [options.model, ...FALLBACK_MODELS.filter(m => m !== options.model)];

  for (const model of modelsToTry) {
    try {
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nexus.dev',
          'X-Title': 'NEXUS AI Platform',
        },
        body: JSON.stringify({ ...options, model, stream: false }),
      });

      if (!res.ok) {
        const err = await res.text();
        const isRateLimit = res.status === 429 || err.toLowerCase().includes('rate limit exceeded') || err.toLowerCase().includes('429');
        if (isRateLimit && model !== modelsToTry[modelsToTry.length - 1]) continue;
        if (isRateLimit && model === modelsToTry[modelsToTry.length - 1]) break;
        throw new Error(`OpenRouter error ${res.status}: ${err}`);
      }

      const data = await res.json() as {
        choices: { message: { content: string } }[];
      };

      return data.choices[0]?.message.content ?? '';
    } catch (err) {
      if (model === modelsToTry[modelsToTry.length - 1]) break;
      continue;
    }
  }

  // Final fallback to HF
  return await chatHF(options.messages);
}
