import { TOOLS_BY_PERSONA } from '../tools/registry.ts';

// Models confirmed to support tool/function calling on OpenRouter free tier
const TOOL_CAPABLE_MODELS = [
  'google/gemini-2.0-flash-001:free',
  'google/gemini-2.0-flash-lite-preview-02-05:free',
  'deepseek/deepseek-chat:free',
  'meta-llama/llama-3.3-70b-instruct:free',
];

// Extended pool for text-only personas (no tool calls)
const TEXT_ONLY_MODELS = [
  ...TOOL_CAPABLE_MODELS,
  'mistralai/mistral-7b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
];

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';


const SYSTEM_PROMPT = `
You are an advanced, tool-augmented AI agent.

CRITICAL RESEARCH PROTOCOLS:
1. NEVER fabricate live data or stock prices from memory.
2. If the user asks for current info (stocks, news, weather), you MUST use a tool immediately.
3. NEVER say "Let's assume" or "I think the price is...". 
4. If you don't have a tool for the specific request, use 'web_search'.
5. Accuracy is your absolute priority. Use real data from tools only.
`;

export interface AgentEvent {
  type: 'token' | 'tool_start' | 'tool_result' | 'error' | 'done';
  content?: string;
  tool?: string;
  input?: any;
  result?: any;
}

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY is not set');
  return key;
}

async function callLLM(model: string, messages: any[], tools: any[]): Promise<Response> {
  // --- Local Ollama Development Mode ---
  if (model === 'ollama' || (process.env.NODE_ENV === 'development' && process.env.OLLAMA_URL)) {
    const ollamaUrl = (process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/chat').replace('localhost', '127.0.0.1');
    const ollamaModel = process.env.OLLAMA_MODEL || 'mistral';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for local model

      const ollamaRes = await fetch(ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: ollamaModel,
          messages: messages.map(m => {
            const msg: any = { role: m.role, content: m.content || "" };
            if (m.role === 'assistant' && m.tool_calls) {
              msg.tool_calls = m.tool_calls.map(tc => {
                let parsedArgs = tc.function.arguments;
                if (typeof parsedArgs === 'string' && parsedArgs.trim() !== '') {
                  try {
                    parsedArgs = JSON.parse(parsedArgs);
                  } catch (e) {
                    // Fallback if it's not valid JSON yet
                  }
                }
                return {
                  ...tc,
                  function: {
                    ...tc.function,
                    arguments: parsedArgs
                  }
                };
              });
            }
            if (m.role === 'tool') msg.tool_call_id = m.tool_call_id;
            return msg;
          }),
          stream: true,
          options: {
            temperature: 0.7,
            num_ctx: 4096 
          },
          tools: tools.length > 0 ? tools.map(t => ({ type: 'function', function: t.schema })) : undefined
        }),
      });
      clearTimeout(timeoutId);

      if (ollamaRes.ok) return ollamaRes;

      const errText = await ollamaRes.text();
      console.warn(`[AGENT] Ollama Error (${ollamaRes.status}):`, errText);

      if (model === 'ollama') throw new Error(`Ollama returned ${ollamaRes.status}: ${errText}`);
    } catch (e) {
      if (model === 'ollama') throw e;
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[AGENT] Ollama connection issue on ${ollamaUrl}: ${msg}. Using cloud fallback.`);
    }
  }

  // --- Production / OpenRouter Fallback ---
  const body: any = {
    model,
    messages,
    stream: true,
    temperature: 0.7,
  };
  if (tools.length > 0) {
    body.tools = tools.map(t => ({ type: 'function', function: t.schema }));
    body.tool_choice = 'auto';
  }

  return fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nexus.dev',
      'X-Title': 'NEXUS Agent Engine',
    },
    body: JSON.stringify(body),
  });
}

/**
 * Agentic Loop implementation.
 * Drives the LLM through multiple reasoning/tool-execution steps.
 * Includes automatic model rotation when 429 rate limits are hit.
 */
export async function* agentLoop(
  personaId: string,
  messages: any[],
  preferredModel: string
): AsyncGenerator<AgentEvent> {
  const isDev = process.env.NODE_ENV === 'development';
  console.log(`\n[SYSTEM] --- Agent Session Start ---`);
  console.log(`[SYSTEM] Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`[SYSTEM] Persona: ${personaId}`);
  console.log(`[SYSTEM] Preferred Model: ${preferredModel}`);
  console.log(`[SYSTEM] ---------------------------\n`);

  const tools = TOOLS_BY_PERSONA[personaId] || [];

  // Consolidate system prompts to avoid confusion (merge generic rules with persona rules)
  if (messages.length > 0 && messages[0].role === 'system') {
    messages[0].content = `${SYSTEM_PROMPT}\n\n${messages[0].content}`;
  } else {
    messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];
  }
  let loopCount = 0;
  const maxLoops = 4; // keep low to conserve free-tier tokens

  // Use only tool-capable fallbacks when tools are active; broader pool otherwise
  const fallbackPool = tools.length > 0
    ? TOOL_CAPABLE_MODELS.filter(m => m !== preferredModel)
    : TEXT_ONLY_MODELS.filter(m => m !== preferredModel);
  const modelsToTry = [preferredModel, ...fallbackPool];
  let currentModelIndex = 0;

  while (loopCount < maxLoops) {
    loopCount++;

    // --- Try models until one succeeds ---
    let response: Response | null = null;

    // DEV MODE: Priority attempt with local Ollama
    if (isDev && process.env.OLLAMA_URL) {
      const model = process.env.OLLAMA_MODEL || 'mistral';
      console.log(`[AGENT] Iteration ${loopCount}: Dev Mode priority attempt with local Ollama (${model})...`);
      try {
        const r = await callLLM('ollama', messages, tools);
        if (r.ok) {
          response = r;
          console.log(`[AGENT] Connected to local Ollama successfully.`);
        } else {
          console.warn(`[AGENT] Ollama request failed (Status: ${r.status}). Falling back to cloud pool.`);
        }
      } catch (e) {
        console.warn(`[AGENT] Local Ollama not reachable on ${process.env.OLLAMA_URL}. Falling back to cloud pool.`);
      }
    }

    if (!response) {
      while (currentModelIndex < modelsToTry.length) {
        const model = modelsToTry[currentModelIndex];
        if (!model) {
          currentModelIndex++;
          continue;
        }
        console.log(`[AGENT] Iteration ${loopCount}: Requesting ${model} from OpenRouter...`);
        try {
          const r = await callLLM(model, messages, tools);
          if (r.status === 429) {
            console.warn(`[AGENT] HTTP 429 on ${model}. Rotating...`);
            currentModelIndex++;
            continue;
          }
          if (!r.ok) {
            const txt = await r.text();
            console.error(`[AGENT] Error response from ${model}:`, txt);
            yield { type: 'error', content: `LLM Error: ${txt}` };
            return;
          }
          response = r;
          console.log(`[AGENT] Connected to ${model} successfully.`);
          break;
        } catch (e) {
          console.error(`[AGENT] Network error on ${model}:`, e);
          currentModelIndex++;
          continue;
        }
      }
    }

    if (!response) {
      yield { type: 'error', content: 'All LLM models are rate-limited. Please wait a few minutes and try again.' };
      return;
    }

    // --- Stream reading ---
    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: 'error', content: 'No response body from LLM.' };
      return;
    }

    const decoder = new TextDecoder();
    let toolCalls: any[] = [];
    let assistantMessageContent = '';
    let buffer = '';
    let gotRateLimited = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          let delta: any = null;
          let toolCallsInChunk: any[] = [];
          let isDone = false;

          // --- 1. Parse OpenRouter/OpenAI (SSE) ---
          if (trimmed.startsWith('data: ')) {
            const payload = trimmed.slice(6).trim();
            if (payload === '[DONE]') {
              isDone = true;
            } else {
              try {
                const parsed = JSON.parse(payload);
                if (parsed?.error) {
                  const msg: string = parsed.error?.message ?? String(parsed.error);
                  if (msg.toLowerCase().includes('rate limit') || parsed.error?.code === 429) {
                    gotRateLimited = true;
                    break;
                  }
                  yield { type: 'error', content: `LLM Error: ${msg}` };
                  return;
                }
                delta = parsed?.choices?.[0]?.delta;
                toolCallsInChunk = delta?.tool_calls || [];
              } catch { continue; }
            }
          }
          // --- 2. Parse Ollama (NDJSON) ---
          else {
            try {
              const chunk = JSON.parse(trimmed);
              if (chunk.message) {
                delta = { content: chunk.message.content };
                toolCallsInChunk = chunk.message.tool_calls || [];
              }
              if (chunk.done) isDone = true;
            } catch { continue; }
          }

          if (isDone) break;
          if (gotRateLimited) break;

          if (delta) {
            if (delta.content) {
              // HACK: Some models leak raw tool-call JSON into the content field.
              // We detect this using a more robust regex that catches multiline JSON arrays.
              const contentStr = delta.content.trim();
              const isRawToolCall =
                contentStr.startsWith('[{"name":') ||
                contentStr.startsWith('{"tool_calls":') ||
                (/^\[\s*\{\s*"name"\s*:/).test(contentStr);

              if (!isRawToolCall) {
                assistantMessageContent += delta.content;
                yield { type: 'token', content: delta.content };
              }
            }

            if (toolCallsInChunk.length > 0) {
              for (const tc of toolCallsInChunk) {
                // Determine the correct index or unique identifier for this tool call
                const tcIdx = tc.index ?? toolCalls.findIndex(existing => existing.id === tc.id);
                const finalIdx = tcIdx !== -1 ? tcIdx : toolCalls.length;

                if (!toolCalls[finalIdx]) {
                  toolCalls[finalIdx] = { id: tc.id || `tc_${finalIdx}`, function: { name: '', arguments: '' } };
                }
                if (tc.id) toolCalls[finalIdx].id = tc.id;
                if (tc.function?.name) toolCalls[finalIdx].function.name += tc.function.name;
                if (tc.function?.arguments) {
                  const chunkArgs = tc.function.arguments;
                  if (typeof chunkArgs === 'string') {
                    toolCalls[finalIdx].function.arguments += chunkArgs;
                  } else if (chunkArgs && typeof chunkArgs === 'object') {
                    // Some local models send pre-parsed objects in chunks
                    toolCalls[finalIdx].function.arguments = JSON.stringify(chunkArgs);
                  }
                }
              }
            }
          }
        }

        if (gotRateLimited) break;
      }
    } catch (streamErr) {
      // Network drop mid-stream — treat as rate limit and rotate
      console.error('[AGENT] Stream read error:', streamErr);
      gotRateLimited = true;
    } finally {
      try { reader.cancel(); } catch { }
    }

    if (gotRateLimited) {
      currentModelIndex++;
      if (currentModelIndex >= modelsToTry.length) {
        yield { type: 'error', content: 'All LLM models are rate-limited. Please wait a few minutes and try again.' };
        return;
      }
      // Reset client-side partial tokens
      yield { type: 'token_reset' as any };

      // Reset loop state for retry with new model
      toolCalls = [];
      assistantMessageContent = '';
      loopCount--; // don't count this as a real loop
      continue;
    }

    // --- Process tool calls ---
    if (toolCalls.length > 0) {
      messages.push({
        role: 'assistant',
        content: assistantMessageContent || null,
        tool_calls: toolCalls.map(tc => ({
          id: tc.id,
          type: 'function',
          function: tc.function,
        })),
      });

      // Emit start events first
      for (const tc of toolCalls) {
        console.log(`[AGENT] Executing tool: ${tc.function.name}`);
        let toolArgs: any = {};
        try { toolArgs = JSON.parse(tc.function.arguments || '{}'); } catch { /**/ }
        yield { type: 'tool_start', tool: tc.function.name, input: toolArgs };
      }

      // Execute tools in parallel
      const results = await Promise.all(
        toolCalls.map(async (tc) => {
          const toolName = tc.function.name;
          let toolArgs: any = {};
          try { toolArgs = JSON.parse(tc.function.arguments || '{}'); } catch { /**/ }

          const toolDef = tools.find(t => t.schema.name === toolName);
          if (!toolDef) return { id: tc.id, name: toolName, error: 'Tool not found', input: toolArgs };

          try {
            const result = await toolDef.execute(toolArgs);
            console.log(`[AGENT] Tool ${toolName} finished with ${result.length} chars of data.`);
            return { id: tc.id, name: toolName, result, input: toolArgs };
          } catch (err) {
            console.error(`[AGENT] Tool ${toolName} failed:`, err);
            return { id: tc.id, name: toolName, error: err instanceof Error ? err.message : String(err), input: toolArgs };
          }
        })
      );

      for (const res of results) {
        if ('error' in res && res.error) {
          messages.push({ role: 'tool', tool_call_id: res.id, name: res.name, content: `Error: ${res.error}` });
        } else {
          yield { type: 'tool_result', tool: res.name, result: res.result };
          messages.push({ role: 'tool', tool_call_id: res.id, name: res.name, content: res.result });
        }
      }

      continue; // Give tool results back to LLM
    }

    // --- No tool calls — we're done ---
    yield { type: 'done' };
    break;
  }
}
