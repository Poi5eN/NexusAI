import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { router } from './src/router.ts';

// Load server/.env (Bun reads .env automatically in the working directory)
const app = new Hono();

app.use('*', cors({ origin: '*' }));

// Health check
app.get('/', (c) =>
  c.json({
    status: 'ok',
    app: 'NEXUS API',
    version: '0.1.0',
    personas: ['travel', 'chatbot', 'support', 'research', 'image'],
  })
);

// Mount persona router at /api
app.route('/api', router);

export default {
  port: Number(process.env.PORT ?? 3001),
  fetch: app.fetch,
  // Disable idle timeout so long-running SSE streams (LLM + tool calls)
  // are never cut short by Bun's default 10-second timeout.
  idleTimeout: 0,
};