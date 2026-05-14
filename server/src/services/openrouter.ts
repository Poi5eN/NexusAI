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

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY is not set in server/.env');
  return key;
}

/** Returns a streaming Response from OpenRouter (SSE). */
export async function streamChat(options: ChatOptions): Promise<Response> {
  return fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nexus.dev',
      'X-Title': 'NEXUS AI Platform',
    },
    body: JSON.stringify({ ...options, stream: true }),
  });
}

/** Returns the full completion as a string (non-streaming). */
export async function chat(options: ChatOptions): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nexus.dev',
      'X-Title': 'NEXUS AI Platform',
    },
    body: JSON.stringify({ ...options, stream: false }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    choices: { message: { content: string } }[];
  };

  return data.choices[0]?.message.content ?? '';
}
