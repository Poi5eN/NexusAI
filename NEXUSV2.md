# NEXUS V2 — Developer Implementation Guide

> **For:** Antigravity Dev Team
> **Purpose:** Upgrade all 9 personas from basic chatbots to full agentic tools with real workflows
> **Stack:** Bun.js (server) · Vite + React + Tailwind (client) · OpenRouter (LLM) · Ollama (local Saar) · Tavily (search) · ChromaDB (RAG) · HuggingFace Inference (images)
> **Version:** 2.0 — Agentic Upgrade

---

## Table of Contents

1. [Core Architecture Changes](#1-core-architecture-changes)
2. [Agentic Loop Engine](#2-agentic-loop-engine)
3. [Tool Registry](#3-tool-registry)
4. [SSE Event Streaming Protocol](#4-sse-event-streaming-protocol)
5. [Persistent Memory Layer](#5-persistent-memory-layer)
6. [Persona 1 — Nexus Assistant](#6-persona-1--nexus-assistant)
7. [Persona 2 — Voyage Architect](#7-persona-2--voyage-architect)
8. [Persona 3 — Deep Search](#8-persona-3--deep-search)
9. [Persona 4 — Support Desk](#9-persona-4--support-desk)
10. [Persona 5 — Vision Canvas](#10-persona-5--vision-canvas)
11. [Persona 6 — Academic Tutor](#11-persona-6--academic-tutor)
12. [Persona 7 — Medical Assistant](#12-persona-7--medical-assistant)
13. [Persona 8 — Cinephile Expert](#13-persona-8--cinephile-expert)
14. [Persona 9 — Legal Helper](#14-persona-9--legal-helper)
15. [Frontend Agent UI Components](#15-frontend-agent-ui-components)
16. [Environment Configuration](#16-environment-configuration)
17. [Folder Structure](#17-folder-structure)
18. [Implementation Priority Order](#18-implementation-priority-order)

---

## 1. Core Architecture Changes

### What changes in V2

**V1 (current):** `POST /chat` → system prompt + user message → OpenRouter → stream text → render in bubble

**V2 (target):** `POST /chat` → persona router → agent loop → tool calls → structured JSON output → rich UI render

The entire upgrade has** ** **three layers** :

| Layer    | Change                                         | Impact                       |
| -------- | ---------------------------------------------- | ---------------------------- |
| Server   | Replace single LLM call with agentic tool loop | Agents actually*do things* |
| Protocol | Add SSE event types beyond just tokens         | UI shows live agent activity |
| Frontend | Render structured JSON, not just text          | Rich cards, maps, charts     |

### LLM Provider Routing

```typescript
// server/src/services/llm-router.ts
// Priority: Saar (Ollama local) → OpenRouter fallback

export async function getLLMClient(persona: PersonaId) {
  const useSaar = process.env.SAAR_ENABLED === 'true' && 
                  process.env[`SAAR_PERSONA_${persona.toUpperCase()}`] === 'true';
  
  if (useSaar) return ollamaClient;   // local, zero cost
  return openrouterClient;             // fallback
}
```

---

## 2. Agentic Loop Engine

This is the** ****single most important file** in V2. Replace every persona's direct LLM call with this.

```typescript
// server/src/core/agent-loop.ts

import { Tool, Message, PersonaConfig } from '../../shared/types';

export type AgentEvent =
  | { type: 'token';        content: string }
  | { type: 'tool_start';   tool: string; input: Record<string, unknown> }
  | { type: 'tool_result';  tool: string; result: unknown; durationMs: number }
  | { type: 'thinking';     content: string }
  | { type: 'structured';   schema: string; data: unknown }
  | { type: 'error';        message: string }
  | { type: 'done' };

export async function* agentLoop(
  persona: PersonaConfig,
  messages: Message[],
  tools: Tool[]
): AsyncGenerator<AgentEvent> {
  const MAX_ITERATIONS = 8; // prevent infinite loops
  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    const response = await callLLM({
      model: persona.model,
      messages,
      tools: tools.map(t => t.schema),
      tool_choice: 'auto',
      stream: true,
      response_format: persona.outputSchema 
        ? { type: 'json_object' } 
        : undefined,
    });

    let accumulatedText = '';
    let toolCalls: ToolCall[] = [];

    // Stream tokens and collect tool calls
    for await (const chunk of response) {
      if (chunk.type === 'text_delta') {
        accumulatedText += chunk.content;
        yield { type: 'token', content: chunk.content };
      }
      if (chunk.type === 'tool_call') {
        toolCalls.push(chunk);
      }
    }

    // No tool calls = final answer, exit loop
    if (toolCalls.length === 0) {
      // Try to parse as structured output if persona expects it
      if (persona.outputSchema && accumulatedText) {
        try {
          const parsed = JSON.parse(accumulatedText);
          yield { type: 'structured', schema: persona.outputSchema, data: parsed };
        } catch {
          // Not JSON, already streamed as tokens
        }
      }
      yield { type: 'done' };
      break;
    }

    // Execute all tool calls (parallel where possible)
    const toolResults = await Promise.all(
      toolCalls.map(async (tc) => {
        yield { type: 'tool_start', tool: tc.name, input: tc.arguments };
        const start = Date.now();
      
        const tool = tools.find(t => t.schema.name === tc.name);
        if (!tool) return { id: tc.id, result: 'Tool not found' };
      
        try {
          const result = await tool.execute(tc.arguments);
          const durationMs = Date.now() - start;
          yield { type: 'tool_result', tool: tc.name, result, durationMs };
          return { id: tc.id, result };
        } catch (err) {
          yield { type: 'error', message: `Tool ${tc.name} failed: ${err}` };
          return { id: tc.id, result: `Error: ${err}` };
        }
      })
    );

    // Append assistant message + tool results to history, then loop
    messages.push({ role: 'assistant', content: accumulatedText, tool_calls: toolCalls });
    messages.push(...toolResults.map(r => ({
      role: 'tool' as const,
      tool_call_id: r.id,
      content: JSON.stringify(r.result),
    })));
  }
}
```

---

## 3. Tool Registry

All tools are registered here. Each persona imports only what it needs.

```typescript
// server/src/tools/registry.ts

// ── Web Search (Tavily) ──────────────────────────────────────
export const webSearchTool: Tool = {
  schema: {
    name: 'web_search',
    description: 'Search the web for current information, prices, news, or any real-time data',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        max_results: { type: 'number', default: 5 },
        search_depth: { type: 'string', enum: ['basic', 'advanced'], default: 'basic' }
      },
      required: ['query']
    }
  },
  execute: async ({ query, max_results = 5, search_depth = 'basic' }) => {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.WEB_SEARCH_KEY, query, max_results, search_depth })
    });
    const data = await res.json();
    return data.results.map((r: any) => ({ title: r.title, url: r.url, snippet: r.content }));
  }
};

// ── Weather (Open-Meteo — free, no key) ─────────────────────
export const weatherTool: Tool = {
  schema: {
    name: 'get_weather',
    description: 'Get current weather and forecast for any location',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City name or coordinates' },
        days: { type: 'number', default: 3 }
      },
      required: ['location']
    }
  },
  execute: async ({ location, days = 3 }) => {
    // Geocode location name → lat/lon
    const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
    const geoData = await geo.json();
    const { latitude, longitude, name, country } = geoData.results[0];
  
    const weather = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&forecast_days=${days}&timezone=auto`
    );
    const wData = await weather.json();
    return { location: `${name}, ${country}`, forecast: wData.daily };
  }
};

// ── Vector Search (ChromaDB — Support RAG) ──────────────────
export const vectorSearchTool: Tool = {
  schema: {
    name: 'search_knowledge_base',
    description: 'Search the support knowledge base for relevant documentation and FAQs',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        collection: { type: 'string', default: 'support_docs' },
        top_k: { type: 'number', default: 5 }
      },
      required: ['query']
    }
  },
  execute: async ({ query, collection = 'support_docs', top_k = 5 }) => {
    // Embed query via HF inference
    const embedding = await embedText(query);
  
    const res = await fetch(`${process.env.VECTOR_DB_URL}/api/v1/collections/${collection}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query_embeddings: [embedding], n_results: top_k })
    });
    const data = await res.json();
    return data.documents[0].map((doc: string, i: number) => ({
      content: doc,
      metadata: data.metadatas[0][i],
      distance: data.distances[0][i]
    }));
  }
};

// ── Ticket System ────────────────────────────────────────────
export const createTicketTool: Tool = {
  schema: {
    name: 'create_ticket',
    description: 'Create a support ticket for issues that cannot be resolved immediately',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        category: { type: 'string' }
      },
      required: ['title', 'description', 'priority']
    }
  },
  execute: async (params) => {
    const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
    // Store in SQLite via Bun
    await db.run(
      'INSERT INTO tickets (id, title, description, priority, category, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ticketId, params.title, params.description, params.priority, params.category, 'open', new Date().toISOString()]
    );
    return { ticketId, status: 'open', estimatedResponse: priorityToETA(params.priority) };
  }
};

// ── Image Generation (HuggingFace FLUX) ─────────────────────
export const generateImageTool: Tool = {
  schema: {
    name: 'generate_image',
    description: 'Generate an image using FLUX.1-schnell from HuggingFace',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Full optimized image generation prompt' },
        negative_prompt: { type: 'string' },
        width: { type: 'number', default: 1024 },
        height: { type: 'number', default: 1024 }
      },
      required: ['prompt']
    }
  },
  execute: async ({ prompt, negative_prompt, width = 1024, height = 1024 }) => {
    const { InferenceClient } = await import('@huggingface/inference');
    const client = new InferenceClient(process.env.HF_API_TOKEN);
  
    const blob = await client.textToImage({
      model: process.env.HF_IMAGE_MODEL || 'black-forest-labs/FLUX.1-schnell',
      inputs: prompt,
      parameters: { negative_prompt, width, height }
    });
  
    const buffer = Buffer.from(await blob.arrayBuffer());
    const filename = `gen_${Date.now()}.png`;
    await Bun.write(`./public/generated/${filename}`, buffer);
    return { url: `/generated/${filename}`, prompt };
  }
};

// ── Code Executor (Bun subprocess sandbox) ──────────────────
export const codeExecutorTool: Tool = {
  schema: {
    name: 'execute_code',
    description: 'Execute Python or JavaScript code and return the output',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        language: { type: 'string', enum: ['python', 'javascript'] }
      },
      required: ['code', 'language']
    }
  },
  execute: async ({ code, language }) => {
    const cmd = language === 'python' ? ['python3', '-c', code] : ['bun', 'eval', code];
    const proc = Bun.spawn(cmd, { stdout: 'pipe', stderr: 'pipe', timeout: 10000 });
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    await proc.exited;
    return { output: stdout, error: stderr, exitCode: proc.exitCode };
  }
};

// ── Academic Tools ───────────────────────────────────────────
export const searchPapersTool: Tool = {
  schema: {
    name: 'search_papers',
    description: 'Search academic papers on Semantic Scholar or ArXiv',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        source: { type: 'string', enum: ['semantic_scholar', 'arxiv'], default: 'semantic_scholar' },
        limit: { type: 'number', default: 5 }
      },
      required: ['query']
    }
  },
  execute: async ({ query, source = 'semantic_scholar', limit = 5 }) => {
    if (source === 'semantic_scholar') {
      const res = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,abstract,authors,year,citationCount,openAccessPdf`);
      const data = await res.json();
      return data.data;
    } else {
      const res = await fetch(`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${limit}`);
      const xml = await res.text();
      // Parse ArXiv XML
      return parseArxivXML(xml);
    }
  }
};

// ── Movie/Media Search ───────────────────────────────────────
export const movieSearchTool: Tool = {
  schema: {
    name: 'search_movies',
    description: 'Search for movies, shows, ratings, cast, and streaming availability',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        type: { type: 'string', enum: ['movie', 'tv', 'any'], default: 'any' },
        year: { type: 'number' }
      },
      required: ['query']
    }
  },
  execute: async ({ query, type = 'any', year }) => {
    // OMDB API — free tier 1000/day
    const url = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=${type === 'any' ? '' : type}${year ? `&y=${year}` : ''}`;
    const res = await fetch(url);
    return await res.json();
  }
};

// ── Legal Document Search ────────────────────────────────────
export const legalSearchTool: Tool = {
  schema: {
    name: 'search_legal_docs',
    description: 'Search public legal databases, case law, and statutes',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        jurisdiction: { type: 'string', default: 'general' },
        doc_type: { type: 'string', enum: ['case_law', 'statute', 'regulation', 'any'], default: 'any' }
      },
      required: ['query']
    }
  },
  execute: async ({ query, jurisdiction, doc_type }) => {
    // CourtListener API (free) + web search fallback
    const results = await webSearchTool.execute({ 
      query: `${query} ${jurisdiction} law site:law.cornell.edu OR site:courtlistener.com OR site:justia.com`,
      max_results: 5,
      search_depth: 'advanced'
    });
    return results;
  }
};

// ── Tool-to-Persona Map ──────────────────────────────────────
export const PERSONA_TOOLS: Record<string, Tool[]> = {
  nexus_assistant:  [webSearchTool, codeExecutorTool],
  voyage_architect: [webSearchTool, weatherTool],
  deep_search:      [webSearchTool],
  support_desk:     [vectorSearchTool, createTicketTool, webSearchTool],
  vision_canvas:    [generateImageTool],
  academic_tutor:   [searchPapersTool, webSearchTool, codeExecutorTool],
  medical_assistant:[webSearchTool],
  cinephile_expert: [movieSearchTool, webSearchTool],
  legal_helper:     [legalSearchTool, webSearchTool],
};
```

---

## 4. SSE Event Streaming Protocol

The server sends typed events. The frontend handles each type differently.

```typescript
// server/src/core/sse-emitter.ts

export function createSSEResponse(generator: AsyncGenerator<AgentEvent>): Response {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
    
      const emit = (event: AgentEvent) => {
        const data = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        for await (const event of generator) {
          emit(event);
          if (event.type === 'done') break;
        }
      } catch (err) {
        emit({ type: 'error', message: String(err) });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
```

**Frontend event handler:**

```typescript
// client/src/hooks/useAgentStream.ts

export function useAgentStream() {
  const [tokens, setTokens] = useState('');
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [structured, setStructured] = useState<unknown>(null);
  const [isThinking, setIsThinking] = useState(false);

  const sendMessage = async (persona: string, messages: Message[]) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Persona': persona },
      body: JSON.stringify({ messages }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n\n').filter(Boolean);
      for (const line of lines) {
        const [eventLine, dataLine] = line.split('\n');
        const eventType = eventLine.replace('event: ', '');
        const data = JSON.parse(dataLine.replace('data: ', ''));

        switch (eventType) {
          case 'token':
            setTokens(prev => prev + data.content);
            break;
          case 'tool_start':
            setIsThinking(true);
            setToolEvents(prev => [...prev, { ...data, status: 'running' }]);
            break;
          case 'tool_result':
            setToolEvents(prev => prev.map(e => 
              e.tool === data.tool ? { ...e, status: 'done', result: data.result } : e
            ));
            break;
          case 'structured':
            setStructured(data.data);
            break;
          case 'done':
            setIsThinking(false);
            break;
        }
      }
    }
  };

  return { tokens, toolEvents, structured, isThinking, sendMessage };
}
```

---

## 5. Persistent Memory Layer

Every persona gets session memory. No more forgetting context.

```typescript
// server/src/services/memory.ts
// Uses SQLite via Bun — zero infra, built-in

import { Database } from 'bun:sqlite';

const db = new Database('nexus.db');
db.run(`
  CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    persona TEXT,
    summary TEXT,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    title TEXT, description TEXT, priority TEXT,
    category TEXT, status TEXT, created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS image_gallery (
    id TEXT PRIMARY KEY,
    session_id TEXT, prompt TEXT, url TEXT,
    style TEXT, created_at TEXT
  );
`);

export async function getMemoryContext(sessionId: string, persona: string): Promise<string> {
  const memories = db.query(
    'SELECT summary FROM memories WHERE session_id = ? AND persona = ? ORDER BY created_at DESC LIMIT 3'
  ).all(sessionId, persona);
  
  if (!memories.length) return '';
  return `\n\n[Previous context from this session:\n${memories.map((m: any) => m.summary).join('\n')}\n]`;
}

export async function saveMemory(sessionId: string, persona: string, conversation: Message[]) {
  // Summarize last exchange and save
  const summary = await summarizeConversation(conversation);
  db.run(
    'INSERT INTO memories (id, session_id, persona, summary, created_at) VALUES (?, ?, ?, ?, ?)',
    [crypto.randomUUID(), sessionId, persona, summary, new Date().toISOString()]
  );
}
```

---

## 6. Persona 1 — Nexus Assistant

**Role:** Core conversational AI. Genius friend. Grounded in real-time data.

### System Prompt

```
You are Nexus Assistant — a highly intelligent, warm, direct AI companion. 
You are like a genius friend who happens to know everything. 
You never say "I don't know" — you search, find out, and tell them.
You use web_search when the topic is current, recent, or time-sensitive.
You use execute_code when asked about math, data, or code that needs running.
You are concise but never shallow. You treat the user as smart.
```

### Tools

* `web_search` — triggered for current events, prices, news, recent facts
* `execute_code` — triggered for math, algorithms, code debugging

### Workflow

```
1. Classify query: [timeless | current | code/math]
2. Timeless → answer directly with depth
3. Current → web_search → synthesize with citations as footnote chips
4. Code/math → execute_code → show actual output + explanation
5. Inject session memory context into every prompt
6. Response: streaming markdown with inline citation chips
```

### Output Format

Plain streaming markdown. No structured JSON needed. Citation chips rendered from** **`tool_result` events.

### Frontend Components

* `ChatBubble` — standard markdown renderer with citation chip support
* `AgentActivityPanel` — shows "🔍 Searching..." events
* `CodeBlock` — syntax highlighted with copy button and live output panel

---

## 7. Persona 2 — Voyage Architect

**Role:** Full trip planner. Real prices, real weather, real itineraries. Not suggestions — actual plans.

### System Prompt

```
You are Voyage Architect — a world-class travel planning expert and personal guide.
You ALWAYS search for real-time prices, weather, and availability before answering.
You produce structured itinerary JSON — never just a text list.
You know visa requirements, local customs, budgeting, hidden gems, and safety tips.
You think like a seasoned traveler who has been everywhere.
Always search for at least: weather, accommodation options, and top activities.
```

### Tools

* `web_search` — prices, hotels, flights, visa info, local tips
* `get_weather` — forecast for travel dates

### Workflow

```
1. Extract: destination, dates, budget, interests, group size (ask if missing)
2. Parallel tool calls:
   - web_search("best hotels [city] [budget] [dates]")
   - web_search("things to do [city] [month]")  
   - web_search("flight prices [origin] to [city] [dates]")
   - get_weather(destination, days=trip_length)
   - web_search("visa requirements [user_country] to [destination]")
3. LLM synthesizes → emits ItineraryJSON (schema below)
4. Follow-up: user says "make it cheaper" → re-search with budget constraint
5. Follow-up: user says "add a day" → patch itinerary JSON
```

### Output Schema (ItineraryJSON)

```typescript
interface ItineraryOutput {
  destination: string;
  dates: { from: string; to: string };
  duration_days: number;
  budget: { estimated_min: number; estimated_max: number; currency: string };
  weather_summary: string;
  visa_info: string;
  days: Array<{
    day: number;
    date: string;
    theme: string;
    activities: Array<{
      time: string;
      activity: string;
      location: string;
      estimated_cost: string;
      tip: string;
    }>;
    accommodation: { name: string; price_per_night: number; rating: number; booking_url?: string };
    meals: Array<{ meal: string; restaurant: string; cuisine: string; price_range: string }>;
  }>;
  packing_tips: string[];
  local_tips: string[];
  emergency_contacts: { police: string; ambulance: string; embassy?: string };
}
```

### Frontend Components

* `ItineraryCard` — collapsible day-by-day view
* `BudgetChart` — pie chart using Recharts
* `WeatherWidget` — forecast cards per travel day
* `HotelCard` — name, price, rating, map link
* `MapEmbed` — Leaflet.js with destination pin
* `ExportButton` — download itinerary as PDF

---

## 8. Persona 3 — Deep Search

**Role:** Autonomous multi-step researcher. Perplexity-style but with structured reports.

### System Prompt

```
You are Deep Search — an expert research analyst and synthesizer.
You NEVER answer from memory alone on factual questions — you always search.
Your process: Plan → Search multiple angles → Read sources → Cross-check → Synthesize → Cite.
You produce structured research reports, not chat responses.
You flag conflicting information across sources explicitly.
You always cite your sources with URLs.
Use search_depth: 'advanced' for complex topics.
```

### Tools

* `web_search` (multiple calls, advanced depth)

### Workflow

```
1. Receive research topic/question
2. Generate research plan: 4-6 different search queries covering different angles
   - Main topic query
   - Opposing viewpoints query
   - Recent developments query
   - Expert opinion query
   - Data/statistics query
3. Execute all searches in parallel
4. LLM reads all results → identifies conflicts and gaps
5. If gaps found → run 1-2 follow-up targeted searches
6. Synthesize into ReportJSON (schema below)
7. Stream report section by section with progress events
```

### Output Schema (ReportJSON)

```typescript
interface ResearchReport {
  title: string;
  query: string;
  generated_at: string;
  executive_summary: string;
  key_findings: Array<{
    finding: string;
    confidence: 'high' | 'medium' | 'low';
    sources: string[];
  }>;
  conflicting_data: Array<{
    claim_a: string; source_a: string;
    claim_b: string; source_b: string;
    note: string;
  }>;
  timeline?: Array<{ date: string; event: string }>;
  sources: Array<{ title: string; url: string; relevance: 'primary' | 'secondary' }>;
  further_reading: string[];
}
```

### Frontend Components

* `ResearchReport` — sectioned report with collapsible findings
* `SourceChips` — clickable citation badges
* `ConflictAlert` — highlighted conflicting data section
* `ProgressBar` — "Searching source 3/6..." live progress
* `ExportMarkdown` — download report as .md

---

## 9. Persona 4 — Support Desk

**Role:** RAG-powered support agent. Answers from YOUR documents. Creates tickets. Tracks issues.

### System Prompt

```
You are Support Desk — a professional, empathetic customer support agent.
You ALWAYS search the knowledge base first before answering any support question.
You only answer based on what you find in the knowledge base — do not invent policies.
If the knowledge base doesn't contain the answer, say so and offer to create a ticket.
If the user is frustrated, acknowledge it before answering.
If confidence is low (distance > 0.8 in vector search), offer to escalate.
You can look up existing tickets if the user provides a ticket ID.
```

### Tools

* `search_knowledge_base` — primary tool for every query
* `create_ticket` — when KB doesn't resolve the issue
* `web_search` — fallback for general product information

### Workflow

```
1. Embed user query → vector search knowledge base (top 5 chunks)
2. Evaluate confidence (vector distance score):
   - High confidence (< 0.5): Answer directly, cite source doc
   - Medium confidence (0.5–0.8): Answer with caveat, offer ticket
   - Low confidence (> 0.8): Acknowledge gap, create ticket
3. If user says "create ticket" / "escalate" / "talk to human":
   → create_ticket() → return ticket ID and ETA
4. If user provides ticket ID: → lookup_ticket() → show status
5. Response includes: answer + source doc name + ticket option
```

### Admin Features (separate /admin routes)

```
POST /admin/upload-doc    → accepts PDF/DOCX/TXT → chunk → embed → store in ChromaDB
GET  /admin/tickets       → list all open tickets with priority sort
PUT  /admin/tickets/:id   → update ticket status
GET  /admin/kb-stats      → collection size, doc count, last updated
```

### Document Pipeline

```typescript
// server/src/services/document-ingestor.ts
async function ingestDocument(file: File, collection: string) {
  const text = await extractText(file);           // pdf-parse or mammoth
  const chunks = chunkText(text, 512, 50);        // 512 tokens, 50 overlap
  const embeddings = await embedBatch(chunks);    // HF all-MiniLM-L6-v2
  await chromaClient.upsert(collection, chunks, embeddings, metadata);
}
```

### Frontend Components

* `KnowledgeSourceBadge` — "Answer from: FAQ_Document.pdf"
* `TicketCreator` — inline form that calls create_ticket tool
* `TicketStatus` — shows ticket ID, status, ETA
* `AdminUploader` — drag-drop doc upload in admin panel
* `ConfidenceIndicator` — subtle bar showing answer confidence

---

## 10. Persona 5 — Vision Canvas

**Role:** AI image generation studio with prompt intelligence, not a simple text→image box.

### System Prompt

```
You are Vision Canvas — a professional AI art director and image generation expert.
When given a user's idea, you ALWAYS enhance it into a detailed, optimized prompt before generating.
You think in terms of: subject, style, lighting, camera angle, color palette, art movement, quality tags.
You generate the image, show the crafted prompt, and offer variations.
For FLUX.1-schnell: prompts should be detailed, descriptive, 50-150 words.
Always add quality tags: high quality, detailed, professional.
Always generate negative_prompt: blurry, low quality, watermark, deformed.
```

### Tools

* `generate_image` — after prompt enhancement step

### Workflow

```
1. Receive casual user idea ("a dragon in a city")
2. ENHANCE prompt (LLM, no tool call):
   - Add style: "cinematic photography / digital art / oil painting"
   - Add lighting: "golden hour / dramatic side lighting / neon"
   - Add detail: camera, composition, quality descriptors
   - Generate negative_prompt automatically
3. Show enhanced prompt to user BEFORE generating (they can edit)
4. Call generate_image(enhanced_prompt, negative_prompt)
5. Display image + offer: "Regenerate" / "3 Variations" / "Edit prompt" / "Download"
6. Save to session gallery (SQLite image_gallery table)
```

### Output Schema

```typescript
interface ImageOutput {
  original_idea: string;
  enhanced_prompt: string;
  negative_prompt: string;
  style: string;
  url: string;
  variations?: string[]; // up to 3 variation URLs
}
```

### Frontend Components

* `PromptEnhancerView` — shows original → enhanced prompt with diff
* `ImageCanvas` — full-width image display with zoom
* `VariationGrid` — 2x2 grid of variations
* `StylePresets` — quick buttons: Cinematic / Anime / Oil Painting / Photorealistic
* `GalleryPanel` — session history of all generated images
* `DownloadButton` — save image locally

---

## 11. Persona 6 — Academic Tutor

**Role:** AI tutor with access to real academic papers. Teaches, explains, quizzes, cites research.

### System Prompt

```
You are Academic Tutor — a world-class educator who adapts to any student's level.
You search for real academic papers when explaining concepts with research backing.
You can execute code for math proofs, algorithms, and data science concepts.
You teach in layers: simple explanation first, then deeper if asked.
You ask "Want me to quiz you on this?" after every major concept.
You cite papers with author, year, and a direct quote of the key finding.
You adapt your language: ask the student's level if unclear.
```

### Tools

* `search_papers` — Semantic Scholar + ArXiv
* `web_search` — for non-academic topics, tutorials
* `execute_code` — math proofs, algorithm demos, data visualizations

### Workflow

```
1. Receive topic/question
2. Classify: [conceptual | problem-solving | research | quiz]
3. Conceptual: explain simply → search_papers for backing research → cite
4. Problem-solving: work through step by step → execute_code if math/code
5. Research: search_papers(advanced) → summarize findings → suggest further reading
6. Quiz mode: generate 3 questions → evaluate answers → explain mistakes
7. Always end with: "Go deeper?" / "Try a practice problem?" / "See a real paper?"
```

### Frontend Components

* `ConceptCard` — expandable explanation with simple/deep toggle
* `PaperCard` — title, authors, year, abstract snippet, PDF link
* `QuizWidget` — multiple choice or open answer with feedback
* `MathRenderer` — KaTeX for equations
* `CodePlayground` — live code with execute button and output
* `StudyPath` — suggested next topics

---

## 12. Persona 7 — Medical Assistant

**Role:** Fact-based medical information assistant. Always searches current medical literature. Always disclaims.

### System Prompt

```
You are Medical Assistant — a fact-based medical information provider.
You provide accurate, evidence-based medical information from reputable sources.
You ALWAYS include: "This is educational information only. Consult a qualified healthcare provider for medical advice."
You NEVER diagnose. You NEVER prescribe. You provide information about conditions, symptoms, and treatments.
You search for current medical guidelines from WHO, NIH, Mayo Clinic, WebMD.
When symptoms are mentioned, you always ask about severity and urgency.
If symptoms suggest emergency: immediately say "This may require emergency care. Call emergency services."
You cite medical sources with publication year — medicine changes, recency matters.
```

### Tools

* `web_search` — with site filters:** **`site:nih.gov OR site:mayoclinic.org OR site:who.int OR site:pubmed.ncbi.nlm.nih.gov`

### Workflow

```
1. Receive medical question/symptom description
2. Emergency check: does this describe potential emergency symptoms?
   → YES: immediately flag + emergency guidance FIRST
   → NO: continue
3. Search: web_search with medical authority site filters
4. Synthesize: information from reputable sources only
5. Structure response: [What it is] → [Common causes] → [When to see a doctor] → [Source citations]
6. ALWAYS append disclaimer
7. NEVER speculate beyond search results
```

### Safety Rules (hard-coded, not AI-decided)

```typescript
const EMERGENCY_KEYWORDS = ['chest pain', 'can\'t breathe', 'stroke', 'unconscious', 
                             'severe bleeding', 'overdose', 'suicidal'];

function checkEmergency(message: string): boolean {
  return EMERGENCY_KEYWORDS.some(kw => message.toLowerCase().includes(kw));
}

// If true → prepend emergency banner to response BEFORE any LLM call
```

### Output Schema

```typescript
interface MedicalResponse {
  emergency_flag: boolean;
  emergency_message?: string;
  topic: string;
  overview: string;
  key_points: string[];
  when_to_see_doctor: string;
  sources: Array<{ title: string; url: string; organization: string }>;
  disclaimer: string; // always present
}
```

### Frontend Components

* `EmergencyBanner` — red, prominent, always first if triggered
* `MedicalCard` — structured info with source badges
* `DisclaimerFooter` — always visible at bottom of every response
* `SeverityChecker` — "How severe are your symptoms?" quick-select

---

## 13. Persona 8 — Cinephile Expert

**Role:** Expert movie/TV recommender, analyst, and guide. Real ratings, cast, streaming availability.

### System Prompt

```
You are Cinephile Expert — a passionate, knowledgeable film critic and movie companion.
You have seen everything. You know directors, cinematographers, screenwriters, scores.
You search for real ratings, cast, and streaming availability before recommending.
You recommend based on what the user actually says they like — not generic lists.
You can discuss themes, cinematography, narrative structure, and film history.
You are opinionated and enthusiastic — this is what makes you useful, not bland.
You always mention: where to watch, rating (IMDB/RT), year, director.
```

### Tools

* `search_movies` — OMDB API for ratings, cast, plot
* `web_search` — streaming availability, director filmography, reviews

### Workflow

```
1. Parse request type: [recommendation | analysis | trivia | where-to-watch | similar-to]
2. Recommendation:
   - Extract preferences: genre, mood, era, language, length, themes
   - search_movies(query) for 5 candidates
   - web_search streaming availability for top 3
   - Rank by match to preferences + quality
   - Return RecommendationJSON
3. Analysis: deep dive on themes, cinematography, context (no tools needed usually)
4. Where to watch: web_search("[movie] streaming [year]")
5. Similar-to: search_movies → filter by genre/director/era
```

### Output Schema

```typescript
interface MovieRecommendation {
  based_on: string;
  recommendations: Array<{
    title: string;
    year: number;
    director: string;
    imdb_rating: string;
    rt_score?: string;
    genre: string[];
    plot: string;
    why_recommended: string;
    streaming_on: string[];
    poster_url?: string;
    runtime: string;
  }>;
  also_consider: string[];
  cinephile_note: string; // expert commentary
}
```

### Frontend Components

* `MovieCard` — poster, title, ratings, streaming badges
* `StreamingBadge` — Netflix / Prime / AppleTV icons
* `RecommendationGrid` — 2-3 column card grid
* `CinematicNote` — styled expert commentary block
* `WatchlistButton` — save to local watchlist (SQLite)

---

## 14. Persona 9 — Legal Helper

**Role:** Legal information assistant. Fact-based. Searches public law databases. Always disclaims.

### System Prompt

```
You are Legal Helper — a legal information assistant providing fact-based legal education.
You ALWAYS include: "This is not legal advice. Consult a qualified attorney for your specific situation."
You search public legal databases: Cornell LII, CourtListener, Justia, government sites.
You explain legal concepts clearly in plain language, then provide the technical version.
You identify relevant jurisdiction — law varies by country/state.
You can: explain laws, summarize case law, explain legal processes, define legal terms.
You NEVER: predict case outcomes, tell someone to take specific legal action, draft legal documents for real use.
You always ask: "Which country/state are you in?" if jurisdiction is unclear.
```

### Tools

* `search_legal_docs` — CourtListener, Cornell LII, Justia
* `web_search` — jurisdiction-specific law, recent legal news

### Workflow

```
1. Identify jurisdiction (ask if not given)
2. Classify: [definition | process | rights | case-law | document-explanation]
3. Definition/Process: search Cornell LII + explain plainly
4. Rights question: search jurisdiction-specific → summarize rights clearly
5. Case law: search CourtListener → summarize precedent
6. Document explanation: user uploads/pastes → explain each clause in plain English
7. Always structure: [Plain English] → [Technical/Legal] → [Source] → [Disclaimer]
```

### Output Schema

```typescript
interface LegalResponse {
  jurisdiction: string;
  topic: string;
  plain_english: string;
  legal_technical: string;
  relevant_statutes: Array<{ name: string; url: string; jurisdiction: string }>;
  case_references?: Array<{ case_name: string; year: number; relevance: string; url: string }>;
  important_caveats: string[];
  disclaimer: string; // always present
  next_steps: string; // what to do next (always: talk to a lawyer)
}
```

### Frontend Components

* `LegalCard` — plain English / technical toggle
* `StatuteReference` — clickable statute with source link
* `CaseCard` — case name, year, court, relevance
* `DisclaimerBanner` — always visible
* `JurisdictionSelector` — quick country/state picker
* `DocumentUpload` — paste or upload legal text for explanation

---

## 15. Frontend Agent UI Components

### AgentActivityPanel (global — all personas)

```tsx
// client/src/components/AgentActivityPanel.tsx
// Shows live tool events while the agent is working

function AgentActivityPanel({ events }: { events: ToolEvent[] }) {
  if (!events.length) return null;
  
  return (
    <div className="agent-activity flex flex-col gap-1.5 px-4 py-3 
                    bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 
                    dark:border-zinc-700 rounded-xl mb-3">
      {events.map((event, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          {event.status === 'running' 
            ? <Spinner className="w-3.5 h-3.5 text-blue-500" />
            : <CheckIcon className="w-3.5 h-3.5 text-green-500" />
          }
          <span className="text-zinc-500">{getToolLabel(event.tool)}</span>
          {event.input?.query && (
            <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-xs">
              "{event.input.query}"
            </span>
          )}
          {event.durationMs && (
            <span className="text-zinc-400 text-xs ml-auto">{event.durationMs}ms</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### StructuredRenderer (routes to right component based on schema)

```tsx
// client/src/components/StructuredRenderer.tsx

function StructuredRenderer({ schema, data }: { schema: string; data: unknown }) {
  switch (schema) {
    case 'itinerary':    return <ItineraryCard data={data as ItineraryOutput} />;
    case 'research':     return <ResearchReport data={data as ResearchReport} />;
    case 'image':        return <ImageCanvas data={data as ImageOutput} />;
    case 'medical':      return <MedicalCard data={data as MedicalResponse} />;
    case 'legal':        return <LegalCard data={data as LegalResponse} />;
    case 'movies':       return <RecommendationGrid data={data as MovieRecommendation} />;
    default:             return <JsonDebug data={data} />;
  }
}
```

---

## 16. Environment Configuration

```bash
# server/.env
OPENROUTER_API_KEY=sk-or-...
HF_API_TOKEN=hf_...
WEB_SEARCH_KEY=tvly-...          # Tavily
OMDB_API_KEY=...                 # OMDB free (1000 req/day)
VECTOR_DB_URL=http://localhost:8000
PORT=3001
NODE_ENV=development

# Saar (Ollama local model) config
SAAR_ENABLED=false               # Set true when Saar is ready
SAAR_BASE_URL=http://localhost:11434
SAAR_MODEL=saar

# Per-persona model config (all OpenRouter free tier)
MODEL_NEXUS_ASSISTANT=meta-llama/llama-3.3-70b-instruct:free
MODEL_VOYAGE_ARCHITECT=google/gemini-2.0-flash-exp:free
MODEL_DEEP_SEARCH=deepseek/deepseek-r1:free
MODEL_SUPPORT_DESK=mistralai/mistral-7b-instruct:free
MODEL_VISION_CANVAS=meta-llama/llama-3.3-70b-instruct:free
MODEL_ACADEMIC_TUTOR=deepseek/deepseek-r1:free
MODEL_MEDICAL_ASSISTANT=google/gemini-2.0-flash-exp:free
MODEL_CINEPHILE_EXPERT=meta-llama/llama-3.3-70b-instruct:free
MODEL_LEGAL_HELPER=google/gemini-2.0-flash-exp:free

# Image generation
HF_IMAGE_MODEL=black-forest-labs/FLUX.1-schnell

# client/.env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=NEXUS
```

---

## 17. Folder Structure

```
nexus/
├── client/
│   ├── src/
│   │   ├── personas/
│   │   │   ├── nexus-assistant/
│   │   │   │   └── NexusAssistant.tsx
│   │   │   ├── voyage-architect/
│   │   │   │   ├── VoyageArchitect.tsx
│   │   │   │   ├── ItineraryCard.tsx
│   │   │   │   ├── BudgetChart.tsx
│   │   │   │   └── WeatherWidget.tsx
│   │   │   ├── deep-search/
│   │   │   │   ├── DeepSearch.tsx
│   │   │   │   └── ResearchReport.tsx
│   │   │   ├── support-desk/
│   │   │   │   ├── SupportDesk.tsx
│   │   │   │   ├── TicketCreator.tsx
│   │   │   │   └── AdminUploader.tsx
│   │   │   ├── vision-canvas/
│   │   │   │   ├── VisionCanvas.tsx
│   │   │   │   ├── ImageCanvas.tsx
│   │   │   │   └── GalleryPanel.tsx
│   │   │   ├── academic-tutor/
│   │   │   │   ├── AcademicTutor.tsx
│   │   │   │   ├── PaperCard.tsx
│   │   │   │   └── QuizWidget.tsx
│   │   │   ├── medical-assistant/
│   │   │   │   ├── MedicalAssistant.tsx
│   │   │   │   └── MedicalCard.tsx
│   │   │   ├── cinephile-expert/
│   │   │   │   ├── CinephileExpert.tsx
│   │   │   │   └── MovieCard.tsx
│   │   │   └── legal-helper/
│   │   │       ├── LegalHelper.tsx
│   │   │       └── LegalCard.tsx
│   │   ├── components/
│   │   │   ├── AgentActivityPanel.tsx   ← global
│   │   │   ├── StructuredRenderer.tsx   ← global
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── PersonaSidebar.tsx
│   │   │   └── EmergencyBanner.tsx
│   │   ├── hooks/
│   │   │   ├── useAgentStream.ts
│   │   │   ├── usePersona.ts
│   │   │   └── useMemory.ts
│   │   └── stores/
│   │       ├── persona.store.ts         ← Zustand
│   │       ├── chat.store.ts
│   │       └── gallery.store.ts
│   └── .env
│
├── server/
│   ├── src/
│   │   ├── core/
│   │   │   ├── agent-loop.ts            ← THE core engine
│   │   │   ├── sse-emitter.ts
│   │   │   └── persona-router.ts
│   │   ├── agents/
│   │   │   ├── nexus-assistant.agent.ts
│   │   │   ├── voyage-architect.agent.ts
│   │   │   ├── deep-search.agent.ts
│   │   │   ├── support-desk.agent.ts
│   │   │   ├── vision-canvas.agent.ts
│   │   │   ├── academic-tutor.agent.ts
│   │   │   ├── medical-assistant.agent.ts
│   │   │   ├── cinephile-expert.agent.ts
│   │   │   └── legal-helper.agent.ts
│   │   ├── tools/
│   │   │   └── registry.ts              ← all tools here
│   │   ├── services/
│   │   │   ├── llm-router.ts            ← OpenRouter + Ollama
│   │   │   ├── memory.ts                ← SQLite session memory
│   │   │   ├── vector-store.ts          ← ChromaDB
│   │   │   ├── document-ingestor.ts     ← Support Desk docs
│   │   │   └── embeddings.ts            ← HF embeddings
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── rate-limit.ts
│   │   │   └── emergency-check.ts       ← Medical safety
│   │   └── index.ts                     ← Hono app entry
│   ├── public/
│   │   └── generated/                   ← Vision Canvas images
│   ├── nexus.db                         ← SQLite (auto-created)
│   └── .env
│
└── shared/
    ├── types.ts
    ├── schemas/
    │   ├── itinerary.schema.ts
    │   ├── research.schema.ts
    │   ├── medical.schema.ts
    │   ├── legal.schema.ts
    │   └── movies.schema.ts
    └── prompts/
        ├── nexus-assistant.prompt.ts
        ├── voyage-architect.prompt.ts
        ├── deep-search.prompt.ts
        ├── support-desk.prompt.ts
        ├── vision-canvas.prompt.ts
        ├── academic-tutor.prompt.ts
        ├── medical-assistant.prompt.ts
        ├── cinephile-expert.prompt.ts
        └── legal-helper.prompt.ts
```

---

## 18. Implementation Priority Order

### Phase 1 — Core Engine (do this first, everything depends on it)

* [ ]** **`server/src/core/agent-loop.ts` — the agentic loop
* [ ]** **`server/src/core/sse-emitter.ts` — event streaming
* [ ]** **`server/src/core/persona-router.ts` — route X-Persona header
* [ ]** **`server/src/tools/registry.ts` —** **`web_search` tool first
* [ ]** **`server/src/services/memory.ts` — SQLite session memory
* [ ]** **`client/src/hooks/useAgentStream.ts` — consume SSE events
* [ ]** **`client/src/components/AgentActivityPanel.tsx` — show tool events

### Phase 2 — Text-Based Personas (easy wins, no external services needed)

* [ ] Nexus Assistant —** **`web_search` +** **`execute_code`
* [ ] Deep Search — multi-step web search + ResearchReport UI
* [ ] Cinephile Expert — OMDB tool + MovieCard UI (get free OMDB key)
* [ ] Academic Tutor — Semantic Scholar tool + QuizWidget

### Phase 3 — Structured Output Personas

* [ ] Voyage Architect — weather tool + ItineraryCard + BudgetChart + MapEmbed
* [ ] Medical Assistant — search filters + EmergencyBanner + hard-coded safety checks
* [ ] Legal Helper — legalSearch tool + LegalCard + disclaimer system

### Phase 4 — Infrastructure-Dependent

* [ ] Support Desk — ChromaDB setup + document ingestor + ticket system + AdminUploader
* [ ] Vision Canvas — HuggingFace image gen + GalleryPanel + PromptEnhancerView

### Phase 5 — Saar Integration

* [ ]** **`server/src/services/llm-router.ts` — Ollama fallback
* [ ] Test each persona with Saar model
* [ ] Set** **`SAAR_ENABLED=true` + per-persona flags
* [ ] Monitor quality vs OpenRouter, adjust system prompts

---

## Quick Reference — External APIs Needed

| Service               | Used By                    | Cost             | Key Needed             |
| --------------------- | -------------------------- | ---------------- | ---------------------- |
| Tavily Search         | All personas               | Free 1000/mo     | `WEB_SEARCH_KEY`     |
| Open-Meteo            | Voyage Architect           | 100% free        | None                   |
| OpenStreetMap/Leaflet | Voyage Architect           | 100% free        | None                   |
| ChromaDB              | Support Desk               | Free self-hosted | None                   |
| HuggingFace Inference | Vision Canvas + embeddings | Free tier        | `HF_API_TOKEN`       |
| OMDB API              | Cinephile Expert           | Free 1000/day    | `OMDB_API_KEY`       |
| Semantic Scholar      | Academic Tutor             | Free, no key     | None                   |
| ArXiv API             | Academic Tutor             | Free, no key     | None                   |
| CourtListener         | Legal Helper               | Free, no key     | None                   |
| OpenRouter            | All LLMs                   | Free tier models | `OPENROUTER_API_KEY` |
| Ollama                | Saar (future)              | Free local       | None                   |

---

*NEXUS V2 — Built to be the last AI platform you need.*
