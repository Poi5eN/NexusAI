/**
 * NEXUS Persona Router
 * Routes /api/chat and /api/image to the right model + system prompt
 * based on the X-Persona header sent by the client.
 */

import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { streamChat, chat, type ChatMessage } from './services/openrouter.ts';
import { generateImage } from './services/huggingface.ts';
import { webSearch } from './services/websearch.ts';

// ── Persona config ──────────────────────────────────────────────────────────

const PERSONA_MODELS: Record<string, string> = {
  travel:   process.env.MODEL_TRAVEL        ?? 'deepseek/deepseek-v4-flash:free',
  chatbot:  process.env.MODEL_CHATBOT       ?? 'openai/gpt-oss-120b:free',
  support:  process.env.MODEL_SUPPORT       ?? 'arcee-ai/trinity-large-thinking:free',
  research: process.env.MODEL_RESEARCH      ?? 'deepseek/deepseek-v4-flash:free',
  image:    process.env.MODEL_IMAGE_PROMPT  ?? 'openai/gpt-oss-120b:free',
  tutor:    process.env.MODEL_TUTOR         ?? 'deepseek/deepseek-v4-flash:free',
  medical:  process.env.MODEL_MEDICAL       ?? 'deepseek/deepseek-v4-flash:free',
  legal:    process.env.MODEL_LEGAL         ?? 'deepseek/deepseek-v4-flash:free',
  movies:   process.env.MODEL_MOVIES        ?? 'deepseek/deepseek-v4-flash:free',
};

const SYSTEM_PROMPTS: Record<string, string> = {
  travel: `You are a warm, expert travel planner. You help users plan trips with detailed 
day-by-day itineraries, local tips, and practical advice. Always ask for dates, budget, 
and interests before planning. Format itineraries with clear headings and emoji.`,

  chatbot: `You are Nexus, a genius friend — brilliant, warm, and direct. You give real answers, 
not corporate fluff. You explain complex topics simply, you're honest about what you don't know, 
and you make every conversation feel natural and engaging.`,

  support: `You are a professional customer support agent. You are patient, empathetic, and solution-focused.
Use the provided knowledge base context to answer questions accurately. If you cannot find the answer,
acknowledge it clearly and suggest escalation. Never guess — accuracy matters more than speed.`,

  research: `You are an expert research analyst. When given a topic, you:
1. Break it into key research questions
2. Synthesize information from multiple angles
3. Cite sources and flag uncertainties
4. Produce structured, markdown-formatted reports
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

  // Prepend system prompt + optional RAG context
  const messages: ChatMessage[] = [
    { role: 'system', content: body.context
        ? `${systemPrompt}\n\n---\nContext:\n${body.context}`
        : systemPrompt
    },
    ...body.messages,
  ];

  try {
    if (body.stream) {
      const upstreamRes = await streamChat({ model, messages, stream: true });
      if (!upstreamRes.body) return c.json({ error: 'No stream body' }, 502);

      return stream(c, async (s) => {
        const reader = upstreamRes.body!.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await s.write(value);
        }
      });
    }

    const content = await chat({ model, messages });
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
