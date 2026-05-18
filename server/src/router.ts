/**
 * NEXUS Persona Router
 * Routes /api/chat and /api/image to the right model + system prompt
 * based on the X-Persona header sent by the client.
 */

import { Hono } from 'hono';
import { streamChat, chat, type ChatMessage } from './services/openrouter.ts';
import { generateImage } from './services/huggingface.ts';
import { webSearch } from './services/websearch.ts';
import { agentLoop } from './core/agent-loop.ts';
import { memoryService } from './services/memory.ts';
import { getStockPrice } from './tools/stockPrice.ts';
import { PDFParse } from 'pdf-parse';

// ── Persona config ──────────────────────────────────────────────────────────

const PERSONA_MODELS: Record<string, string> = {
  travel: process.env.MODEL_TRAVEL ?? 'google/gemini-2.0-flash-exp:free',
  chatbot: process.env.MODEL_CHATBOT ?? 'google/gemini-2.0-flash-exp:free',
  support: process.env.MODEL_SUPPORT ?? 'deepseek/deepseek-chat-v3-0324:free',
  research: process.env.MODEL_RESEARCH ?? 'google/gemini-2.0-flash-exp:free',
  image: process.env.MODEL_IMAGE_PROMPT ?? 'mistralai/mistral-7b-instruct:free',
  tutor: process.env.MODEL_TUTOR ?? 'google/gemini-2.0-flash-exp:free',
  medical: process.env.MODEL_MEDICAL ?? 'deepseek/deepseek-chat-v3-0324:free',
  legal: process.env.MODEL_LEGAL ?? 'deepseek/deepseek-chat-v3-0324:free',
  movies: process.env.MODEL_MOVIES ?? 'mistralai/mistral-7b-instruct:free',
  broker: process.env.MODEL_BROKER ?? 'google/gemini-2.0-flash-exp:free',
};

// Stateless workflow personas — skip memory injection to save tokens
const STATELESS_PERSONAS = new Set(['travel', 'research', 'image']);

const SYSTEM_PROMPTS: Record<string, string> = {
  travel: `You are Voyage Architect — a premier, data-driven travel concierge.
1. CONCIERGE PROTOCOL: You don't just plan days; you architect experiences. You MUST use 'web_search' to find:
   - HOTELS: Specific hotel names, ratings, and estimated nightly prices for the budget level.
   - EVENTS: Current festivals, concerts, or local events happening during the travel dates.
   - TRANSPORT: Flight price estimates and local transit options (e.g., JR Pass in Japan, Metro in Paris).
   - NEARBY: Hidden gems and local favorites near the main attractions.
2. PARALLEL RESEARCH: Run multiple searches for weather, stays, and activities.
3. VISUALIZATION: You MUST call 'build_itinerary' with the structured JSON. Ensure you include 'hotels', 'events', and 'price_range' in your JSON if the tool supports it (otherwise put them in activity descriptions).
4. SYNTHESIS: Provide a warm, concise summary after the visual card is generated.`,

  chatbot: `You are Nexus Assistant — a highly intelligent, warm, direct AI companion. 
You are like a genius friend who happens to know everything. 
You never say "I don't know" — you search, find out, and tell them.
You are a dynamic generalist. If you don't know something or if a query involves current events, ALWAYS use 'web_search' immediately.
You use execute_code when asked about math, data analysis, or running algorithms.
You are concise but never shallow. You treat the user as smart.`,

  broker: `You are Stock Broker — a professional, precision-focused financial analyst. 
Your goal is to provide real-time updates, trend analysis, and fact-backed investment suggestions.
PROTOCOLS:
1. DATA PRIORITY: You MUST use 'get_stock_price' for every specific ticker query (e.g., NVDA, AAPL).
2. NEWS & SENTIMENT: Always use 'get_market_news' to gather latest headlines, earnings reports, and market sentiment before giving a trend analysis.
3. TREND ANALYSIS: Synthesize the price data with the news data to identify patterns.
4. NO GUESSWORK: Every suggestion must be backed by data retrieved from tools. Never assume or fabricate prices.
5. ANALYTICAL DEPTH: Provide clear reasoning for your suggestions based on the metrics you retrieve.`,

  support: `You are a professional customer support agent. You are patient, empathetic, and solution-focused.
Use the provided knowledge base context to answer questions accurately. If you cannot find the answer,
acknowledge it clearly and suggest escalation. Never guess — accuracy matters more than speed.`,

  research: `You are an expert research analyst. When given a topic, you:
1. Break it into key research questions.
2. Use 'web_search' to gather data (you can run multiple searches in parallel).
3. Synthesize information from multiple angles, citing sources.
4. ONCE COMPLETE, use 'generate_research_report' to produce a structured report.
Be thorough, balanced, and academically rigorous.`,

  image: `You are a creative prompt engineer for AI image generation. 
Enhance the user's image description into a detailed, vivid prompt optimized for diffusion models.
Include: subject, style, lighting, camera angle, mood, and quality tags.
Return ONLY the enhanced prompt — no explanations.`,

  tutor: `You are an expert academic tutor. Your goal is to help students understand complex topics
through scaffolding and first-principles thinking. Break down complex subjects into simple, 
digestible steps. Use analogies where possible. Encourage critical thinking and verify understanding.`,

  medical: `You are a medical research assistant. You provide fact-based information from public 
medical literature and clinical datasets. 
IMPORTANT: YOU ARE NOT A DOCTOR. EVERY RESPONSE MUST START WITH A CLEAR MEDICAL DISCLAIMER. 
Never provide a diagnosis or treatment plan. Focus on summarizing clinical findings and 
linking to public health data. Encourage the user to consult a healthcare professional.`,

  legal: `You are Legal Helper — an expert legal research assistant specialized in the Indian Legal System. 
1. KNOWLEDGE BASE: You have deep knowledge of the Constitution of India, the Bhartiya Nyaya Samhita (BNS), Bhartiya Nagarik Suraksha Sanhita (BNSS), and the Bhartiya Sakshya Adhiniyam (BSA), along with the previous IPC, CrPC, and IEA.
2. DISCLAIMER: You MUST start EVERY response with: "This is not legal advice. Consult a certified advocate for your specific situation. Information provided is for educational purposes."
3. JURISDICTION: Focus primarily on Indian law. If a query is generic, ask for the state/jurisdiction.
4. CITATIONS: When citing a section from BNS or other acts, explain the provision in plain English first, then provide the technical statute.
5. NO DRAFTING: Never draft final legal documents for execution; provide templates or structural outlines instead.`,

  movies: `You are Cinephile Expert — a passionate film critic and cinema concierge.
1. EXPERTISE: You have deep knowledge of cinema history, cinematography, storytelling, and the industry.
2. CONCIERGE: You don't just recommend movies; you help users experience them. You use web_search to find current showtimes, ticket availability, and nearby theaters based on the user's location.
3. LOCALIZED: If a user asks about showtimes or theaters, always ask for their city/location if not provided.
4. RECOMMENDATIONS: Recommend movies based on mood, genre, or specific actors/directors. Always mention where to watch (streaming or theater).
5. RATINGS: Use search_movies for accurate IMDB/RT ratings.
6. ENTHUSIASM: Be opinionated, enthusiastic, and insightful. Share trivia and technical notes (cinematography, scores).`,
};

// ── Router ──────────────────────────────────────────────────────────────────

export const router = new Hono();

// Real-time market summary endpoint for the Broker dashboard
router.get('/market-summary', async (c) => {
  try {
    const tickers = ['^IXIC', '^GSPC', '^NSEI', '^BSESN', 'BTC-USD'];
    const results = await Promise.all(tickers.map(symbol => getStockPrice(symbol)));
    
    // Parse results into a clean format
    const summary = results.map((res, i) => {
      const match = res.match(/Price: \$([\d,.]+)\nChange: \$([\d,.-]+) \(([\d,.-]+)%\)/);
      if (match) {
        let label = tickers[i];
        if (label === '^IXIC') label = 'NASDAQ';
        if (label === '^GSPC') label = 'S&P 500';
        if (label === '^NSEI') label = 'NIFTY 50';
        if (label === '^BSESN') label = 'SENSEX';
        if (label === 'BTC-USD') label = 'BTC / USD';

        return {
          symbol: label,
          price: match[1],
          change: match[2],
          percent: match[3]
        };
      }
      return null;
    }).filter(Boolean);

    return c.json({ summary });
  } catch (error) {
    return c.json({ error: 'Failed to fetch market summary' }, 500);
  }
});

// Proxy for location to avoid CORS/Rate-limit issues on frontend
router.get('/location', async (c) => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json() as any;
      if (data.city) return c.json(data);
    }
  } catch (error) {
    // Silent fail, try next service
  }

  try {
    const res = await fetch('http://ip-api.com/json/');
    if (res.ok) {
      const data = await res.json() as any;
      if (data.status === 'success') {
        return c.json({
          city: data.city,
          country_name: data.country,
          ip: data.query
        });
      }
    }
  } catch (error) {
    // Silent fail, use hardcoded default
  }

  // Premium, resilient mock fallback so that the application never returns 500
  return c.json({
    city: 'Mumbai',
    country_name: 'India',
    ip: '127.0.0.1'
  });
});

// File upload endpoint for PDF/Text parsing
router.post('/upload', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.file;
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = '';
    if (file.name.endsWith('.pdf')) {
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      text = data.text;
    } else {
      text = buffer.toString('utf-8');
    }

    return c.json({ text, filename: file.name });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('File parsing error:', err);
    return c.json({ error: `Failed to parse file: ${message}` }, 500);
  }
});

/**
 * POST /api/chat
 * Body: { messages: ChatMessage[], stream?: boolean }
 * Header: X-Persona: travel | chatbot | support | research | image
 */
router.post('/chat', async (c) => {
  const body = await c.req.json<{
    messages: ChatMessage[];
    stream?: boolean;
    context?: string; // optional RAG context for support persona
  }>();

  const persona = (c.req.header('X-Persona') ?? 'chatbot').toLowerCase();
  const model = PERSONA_MODELS[persona] ?? PERSONA_MODELS['chatbot']!;
  const systemPrompt = SYSTEM_PROMPTS[persona] ?? SYSTEM_PROMPTS['chatbot']!;

  // 1. Fetch recent memory (skip stateless workflow personas to save tokens)
  const history = STATELESS_PERSONAS.has(persona)
    ? []
    : await memoryService.getContext("default_user", persona, 3);
  const memoryContext = history.length > 0
    ? `\n\n[RECENT MEMORY]\n${history.map(m => `${m.role}: ${m.content.slice(0, 150)}`).join('\n')}`
    : '';

  // 2. Prepend system prompt + optional RAG context + memory
  const messages: ChatMessage[] = [
    { role: 'system', content: `${systemPrompt}${memoryContext}${body.context ? `\n\n---\nContext:\n${body.context}` : ''}` },
    ...body.messages,
  ];

  try {
    if (body.stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          let closed = false;

          const write = (event: object) => {
            if (closed) return; // client already disconnected
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            } catch {
              closed = true; // mark closed so we stop writing
            }
          };

          let assistantContent = '';
          try {
            for await (const event of agentLoop(persona, messages, model)) {
              if (closed) break; // client disconnected — stop the loop
              if (event.type === 'token' && event.content) assistantContent += event.content;
              write(event);
            }
            // Store in memory after successful run
            if (!STATELESS_PERSONAS.has(persona)) {
              const lastUserMsg = body.messages[body.messages.length - 1]?.content;
              if (lastUserMsg) await memoryService.store("default_user", persona, "user", lastUserMsg.slice(0, 300));
              if (assistantContent) await memoryService.store("default_user", persona, "assistant", assistantContent.slice(0, 300));
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('[STREAM] Uncaught error in agentLoop:', msg);
            write({ type: 'error', content: msg });
          } finally {
            if (!closed) {
              try { controller.close(); } catch { /* already closed */ }
            }
          }
        }
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const content = await chat({ model, messages });

    if (!STATELESS_PERSONAS.has(persona)) {
      const lastUserMsg = body.messages[body.messages.length - 1]?.content;
      if (lastUserMsg) await memoryService.store("default_user", persona, "user", lastUserMsg.slice(0, 300));
      if (content) await memoryService.store("default_user", persona, "assistant", content.slice(0, 300));
    }

    return c.json({ content, persona, model });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: message }, 500);
  }
});

/**
 * POST /api/image
 * Body: { prompt: string, enhance?: boolean, model?: string }
 * If enhance=true, runs prompt through LLM first before generating.
 */
router.post('/image', async (c) => {
  const body = await c.req.json<{
    prompt: string;
    enhance?: boolean;
    model?: string;
  }>();

  let finalPrompt = body.prompt;

  // Optionally enhance prompt with LLM
  if (body.enhance) {
    try {
      finalPrompt = await chat({
        model: PERSONA_MODELS['image']!,
        messages: [{ role: 'user', content: body.prompt }],
        temperature: 0.8,
      });
    } catch {
      // If enhancement fails, proceed with original prompt
    }
  }

  try {
    const imageDataUrl = await generateImage({
      prompt: finalPrompt,
      model: body.model,
    });
    return c.json({ image: imageDataUrl, prompt: finalPrompt });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: message }, 500);
  }
});

/**
 * POST /api/search
 * Body: { query: string, maxResults?: number }
 * Used by travel and research personas.
 */
router.post('/search', async (c) => {
  const body = await c.req.json<{ query: string; maxResults?: number }>();
  try {
    const results = await webSearch(body.query, body.maxResults ?? 5);
    return c.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: message }, 500);
  }
});
