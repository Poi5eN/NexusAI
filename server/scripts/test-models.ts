#!/usr/bin/env bun
/**
 * NEXUS Model Health Check Script
 * Tests every configured model + service and reports pass/fail.
 * Run: bun scripts/test-models.ts
 */

const OR_KEY = process.env.OPENROUTER_API_KEY;
const HF_KEY = process.env.HF_API_TOKEN;
const TAVILY_KEY = process.env.TAVILY_API_KEY;
const SGAI_KEY = process.env.SGAI_API_KEY;

const GREEN = '\x1b[32m✅';
const RED   = '\x1b[31m❌';
const RESET = '\x1b[0m';
const DIM   = '\x1b[2m';

function ok(label: string, detail = '') {
  console.log(`${GREEN} ${label}${RESET} ${DIM}${detail}${RESET}`);
}
function fail(label: string, err: string) {
  console.log(`${RED} ${label}${RESET} ${DIM}${err}${RESET}`);
}

// ── OpenRouter model test ──────────────────────────────────────────────────

async function testModel(name: string, model: string): Promise<boolean> {
  if (!OR_KEY) { fail(name, 'OPENROUTER_API_KEY not set'); return false; }
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OR_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nexus.dev',
        'X-Title': 'NEXUS Model Test',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Reply with exactly: NEXUS_OK' }],
        max_tokens: 20,
        stream: false,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      fail(name, `HTTP ${res.status}: ${t.slice(0, 120)}`);
      return false;
    }
    const data = await res.json() as { choices?: { message: { content: string } }[]; error?: { message: string } };
    if (data.error) { fail(name, data.error.message); return false; }
    const reply = data.choices?.[0]?.message?.content ?? '';
    ok(name, `→ "${reply.trim().slice(0, 60)}"`);
    return true;
  } catch (e) {
    fail(name, e instanceof Error ? e.message : String(e));
    return false;
  }
}

// ── Hugging Face test ──────────────────────────────────────────────────────

async function testHF(): Promise<boolean> {
  if (!HF_KEY) { fail('HF Image (FLUX)', 'HF_API_TOKEN not set'); return false; }
  const model = process.env.HF_IMAGE_MODEL ?? 'black-forest-labs/FLUX.1-schnell';
  try {
    const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${HF_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: 'a tiny blue circle, minimal', parameters: { num_inference_steps: 2 } }),
    });
    if (!res.ok) {
      const t = await res.text();
      // Model loading (503) is expected on cold start — treat as warning not failure
      if (res.status === 503) {
        console.log(`\x1b[33m⚠️  HF Image (${model})${RESET} ${DIM}Model loading (cold start) — try again in 30s${RESET}`);
        return true;
      }
      fail(`HF Image (${model})`, `HTTP ${res.status}: ${t.slice(0, 120)}`);
      return false;
    }
    const bytes = (await res.arrayBuffer()).byteLength;
    ok(`HF Image (${model})`, `→ ${bytes} bytes received`);
    return true;
  } catch (e) {
    fail('HF Image', e instanceof Error ? e.message : String(e));
    return false;
  }
}

// ── Tavily test ────────────────────────────────────────────────────────────

async function testTavily(): Promise<boolean> {
  if (!TAVILY_KEY) { console.log(`\x1b[33m⚠️  Tavily${RESET} ${DIM}TAVILY_API_KEY not set (optional)${RESET}`); return true; }
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: TAVILY_KEY, query: 'test', max_results: 1 }),
    });
    if (!res.ok) { fail('Tavily Search', `HTTP ${res.status}`); return false; }
    const data = await res.json() as { results?: unknown[] };
    ok('Tavily Search', `→ ${data.results?.length ?? 0} result(s)`);
    return true;
  } catch (e) {
    fail('Tavily Search', e instanceof Error ? e.message : String(e));
    return false;
  }
}

// ── ScrapeGraphAI test ────────────────────────────────────────────────────

async function testSGAI(): Promise<boolean> {
  if (!SGAI_KEY) { console.log(`\x1b[33m⚠️  ScrapeGraphAI${RESET} ${DIM}SGAI_API_KEY not set (optional)${RESET}`); return true; }
  try {
    const res = await fetch('https://v2-api.scrapegraphai.com/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'SGAI-APIKEY': SGAI_KEY },
      body: JSON.stringify({ query: 'test query', max_results: 1 }),
    });
    if (!res.ok) { fail('ScrapeGraphAI', `HTTP ${res.status}`); return false; }
    ok('ScrapeGraphAI', '→ API reachable');
    return true;
  } catch (e) {
    fail('ScrapeGraphAI', e instanceof Error ? e.message : String(e));
    return false;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n\x1b[1m🔍 NEXUS Model Health Check\x1b[0m\n');

  const results = await Promise.all([
    testModel('Chatbot  (GPT-OSS-120B)',   process.env.MODEL_CHATBOT   ?? 'openai/gpt-oss-120b:free'),
    testModel('Travel   (DeepSeek-V4)',      process.env.MODEL_TRAVEL    ?? 'deepseek/deepseek-v4-flash:free'),
    testModel('Support  (Trinity-Large)',  process.env.MODEL_SUPPORT   ?? 'arcee-ai/trinity-large-thinking:free'),
    testModel('Research (DeepSeek-V4)',    process.env.MODEL_RESEARCH  ?? 'deepseek/deepseek-v4-flash:free'),
    testModel('Image    (Prompt Enhancer)',process.env.MODEL_IMAGE_PROMPT ?? 'openai/gpt-oss-120b:free'),
  ]);

  const hfOk    = await testHF();
  const tavilyOk = await testTavily();
  const sgaiOk  = await testSGAI();

  const passed = [...results, hfOk, tavilyOk, sgaiOk].filter(Boolean).length;
  const total  = results.length + 3;
  console.log(`\n\x1b[1mResult: ${passed}/${total} checks passed\x1b[0m\n`);
  process.exit(passed === total ? 0 : 1);
}

main();
