This is a genuinely ambitious project — let me think through it carefully and give you a proper architectural plan before we write a single line of code.Here's the full architectural plan — think of this as the blueprint before we touch any code.

---

## Project: NEXUS — Multi-Persona AI Agent Platform

### The 5 Personas

**1. Travel Planner** — Trip builder with real-time pricing via web search, hotel/flight suggestions, day-by-day itinerary generation, local guide knowledge, and map embed support. Uses OpenRouter LLM + web search tool.

**2. Genius Friend (Chatbot)** — Casual, warm, highly capable companion. Always searches before answering time-sensitive questions. Remembers conversation context. Uses streaming responses for a natural feel.

**3. Customer Support Agent** — RAG-powered agent that operates on custom uploaded documents/FAQs. Uses vector embeddings (ChromaDB or Qdrant) for semantic search, can create/escalate tickets, handles structured workflows. This is the most complex persona.

**4. Image Studio** — Prompt engineering layer + HuggingFace Inference API. Free models: FLUX.1-schnell, SDXL-turbo, Stable Diffusion 3.5. Handles prompt refinement, style suggestions, and gallery management.

**5. Research Analyst** *(the added persona)* — Deep multi-step research: pulls from multiple web sources, synthesizes, cites, generates structured reports (markdown/PDF-ready). Think Perplexity-style but with your custom branding. Extremely valuable for professional users.

---

### Stack Decisions

**Server (`server/`)** — Bun.js with Hono (lightweight, fast, Bun-native router). Each persona is a Hono route group. SSE streaming. File upload handling built-in. Vector DB client runs server-side only.

**Client (`client/`)** — Vite + React + Tailwind CSS. Zustand for global state (active persona, chat history, settings). React Query for API calls. The persona switcher is a top-level UI concern.

**Shared (`shared/`)** — TypeScript types for messages, persona configs, and API contracts. Prompt templates live here so both sides can reference them.

---

### Key Architecture Decisions

**Persona switching** — The frontend sends an** **`X-Persona` header with every request. The router loads the right agent module, system prompt, and tool set. No persona bleeds into another's context.

**OpenRouter flexibility** — Every persona can have its own model in** **`.env`. Support agent might run on a cheaper fast model; Research Analyst on a smarter slower one. Change without touching code.

**Vector store for Support Agent** — Chroma (local, zero infra) for dev; Qdrant Cloud (free tier) for production. Documents chunked and embedded on upload. Semantic search at query time.

**Image generation** — HuggingFace Inference API (free tier): use** **`@huggingface/inference` npm package. FLUX.1-schnell is the fastest free option. Queue management on the server to handle rate limits gracefully.

**Streaming** — Server-Sent Events (SSE) for all LLM responses. Bun handles this natively and efficiently. The client streams token by token for a premium feel.

---

### `.env` Structure (both sides)

```
# server/.env
OPENROUTER_API_KEY=
HF_API_TOKEN=
VECTOR_DB_URL=http://localhost:8000
WEB_SEARCH_KEY=          # Brave Search API (free tier available)
PORT=3001

# Per-persona model overrides
MODEL_TRAVEL=google/gemini-2.0-flash-exp:free
MODEL_CHATBOT=meta-llama/llama-3.3-70b-instruct:free
MODEL_SUPPORT=mistralai/mistral-7b-instruct:free
MODEL_RESEARCH=deepseek/deepseek-r1:free
MODEL_IMAGE_PROMPT=google/gemini-2.0-flash-exp:free

# client/.env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=NEXUS
```

---

### Folder Structure

```
nexus/
├── client/                    # Vite + React + Tailwind
│   ├── src/
│   │   ├── personas/          # One component folder per persona
│   │   │   ├── travel/
│   │   │   ├── chatbot/
│   │   │   ├── support/
│   │   │   ├── image-studio/
│   │   │   └── research/
│   │   ├── components/        # Shared UI (PersonaSwitcher, ChatBubble, etc.)
│   │   ├── stores/            # Zustand stores
│   │   └── hooks/             # useStream, usePersona, useChat
│   └── .env
│
├── server/                    # Bun.js + Hono
│   ├── src/
│   │   ├── agents/            # One agent file per persona
│   │   │   ├── travel.agent.ts
│   │   │   ├── chatbot.agent.ts
│   │   │   ├── support.agent.ts
│   │   │   ├── image.agent.ts
│   │   │   └── research.agent.ts
│   │   ├── services/
│   │   │   ├── openrouter.ts  # LLM client
│   │   │   ├── vectorstore.ts # Embedding + search
│   │   │   ├── websearch.ts   # Brave Search wrapper
│   │   │   └── huggingface.ts # Image inference
│   │   ├── middleware/        # Auth, rate limit, CORS
│   │   └── router.ts          # Hono persona routing
│   └── .env
│
└── shared/
    ├── types.ts               # Message, Persona, APIResponse
    └── prompts/               # System prompt templates
        ├── travel.prompt.ts
        ├── chatbot.prompt.ts
        ├── support.prompt.ts
        ├── image.prompt.ts
        └── research.prompt.ts
```

---

### World-Class UI Vision

The persona switcher should feel like switching between apps — each persona has its own color theme, icon, and layout. The chat interface should be a premium streaming chat with message reactions, copy buttons, and source citations for Research/Support. The Image Studio gets a gallery grid. The Travel Planner gets a split-pane with chat on one side and a live itinerary/map on the other.

---

### What to Build First (Suggested Order)

1. Scaffold monorepo — Bun server + Vite client + shared types
2. OpenRouter service + streaming SSE pipeline
3. Persona router + Chatbot persona (simplest, proves the stack)
4. Persona switcher UI + design system
5. Travel Planner (adds web search tool)
6. Research Analyst (multi-step search + synthesis)
7. Support Agent (vector store, document upload, RAG)
8. Image Studio (HuggingFace + gallery UI)

---

Ready to start coding? I'd suggest we begin with the monorepo scaffold and the core streaming pipeline — that's the foundation everything else sits on. Want me to generate the full initial scaffold for both** **`server/` and** **`client/`?
