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

// ── Persona config ──────────────────────────────────────────────────────────

const PERSONA_MODELS: Record<string, string> = {
  travel:   process.env.MODEL_TRAVEL        ?? 'google/gemini-2.0-flash-exp:free',
  chatbot:  process.env.MODEL_CHATBOT       ?? 'google/gemini-2.0-flash-exp:free',
  support:  process.env.MODEL_SUPPORT       ?? 'deepseek/deepseek-chat-v3-0324:free',
  research: process.env.MODEL_RESEARCH      ?? 'google/gemini-2.0-flash-exp:free',
  image:    process.env.MODEL_IMAGE_PROMPT  ?? 'mistralai/mistral-7b-instruct:free',
  tutor:    process.env.MODEL_TUTOR         ?? 'google/gemini-2.0-flash-exp:free',
  medical:  process.env.MODEL_MEDICAL       ?? 'deepseek/deepseek-chat-v3-0324:free',
  legal:    process.env.MODEL_LEGAL         ?? 'deepseek/deepseek-chat-v3-0324:free',
  movies:   process.env.MODEL_MOVIES        ?? 'mistralai/mistral-7b-instruct:free',
};

// Stateless workflow personas — skip memory injection to save tokens
const STATELESS_PERSONAS = new Set(['travel', 'research', 'image']);

const SYSTEM_PROMPTS: Record<string, string> = {
  travel: `You are a world-class, agentic travel architect. Your goal is to build hyper-personalized, data-driven itineraries. 
When a user asks for a trip, you MUST follow this protocol strictly:
1. DATA GATHERING: Use 'web_search' to gather REAL-TIME data: current weather for the dates, upcoming festivals/events, and local transportation alerts. You can run multiple searches in parallel.
2. SYNTHESIS: Process the gathered data to create a unique plan.
3. VISUALIZATION: You MUST use the 'build_itinerary' tool to generate the structured visual plan. This is the MOST IMPORTANT STEP.
4. FINAL RESPONSE: Once 'build_itinerary' is called, give a brief, warm summary. DO NOT repeat all the raw search data in your text response — keep it clean and let the visual card do the talking.`,

  chatbot: `You are Nexus, a genius friend — brilliant, warm, and direct. You give real answers, 
not corporate fluff. You explain complex topics simply, you're honest about what you don't know, 
and you make every conversation feel natural and engaging.`,

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

  legal: `You are a legal research helper. You provide factual information based on public 
legal statutes, precedents, and public records. 
IMPORTANT: YOU ARE NOT AN ATTORNEY. EVERY RESPONSE MUST START WITH A CLEAR LEGAL DISCLAIMER. 
Focus on explaining legal concepts and summarizing public cases. Never provide legal advice 
for a specific personal situation. Encourage the user to consult a certified lawyer.`,

  movies: `You are a world-class cinephile and movie critic. You have deep knowledge of cinema 
history, cinematography, and storytelling. Recommend movies based on mood, genre, or specific 
technical interests. Give detailed critiques that explain WHY a movie fits the user's request.`,
};

// ── Router ──────────────────────────────────────────────────────────────────

export const router = new Hono();

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
