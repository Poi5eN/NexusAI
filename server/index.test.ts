import { expect, test, describe, beforeAll } from 'bun:test';
import app from './index';

beforeAll(() => {
  process.env.OPENROUTER_API_KEY = '';
  process.env.HF_API_TOKEN = '';
});

describe('GET /', () => {
  test('returns health + persona list', async () => {
    const res = await app.fetch(new Request('http://localhost/'));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string; personas: string[] };
    expect(data.status).toBe('ok');
    expect(data.personas).toContain('chatbot');
    expect(data.personas).toHaveLength(5);
  });
});

describe('POST /api/chat', () => {
  test('returns 500 when API key is missing', async () => {
    const res = await app.fetch(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Persona': 'chatbot' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] }),
      })
    );
    expect(res.status).toBe(500);
    const data = (await res.json()) as { error: string };
    expect(data.error).toContain('OPENROUTER_API_KEY');
  });
});

describe('POST /api/image', () => {
  test('returns 500 when HF key is missing', async () => {
    const res = await app.fetch(
      new Request('http://localhost/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'a futuristic city' }),
      })
    );
    expect(res.status).toBe(500);
    const data = (await res.json()) as { error: string };
    expect(data.error).toContain('HF_API_TOKEN');
  });
});

describe('POST /api/search', () => {
  test('returns empty results gracefully when key is missing', async () => {
    process.env.WEB_SEARCH_KEY = '';
    const res = await app.fetch(
      new Request('http://localhost/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'best beaches in Bali' }),
      })
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { results: unknown[] };
    expect(Array.isArray(data.results)).toBe(true);
  });
});
