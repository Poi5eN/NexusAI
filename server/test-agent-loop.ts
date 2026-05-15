import { agentLoop } from './src/core/agent-loop.ts';

async function test() {
  try {
    const loop = agentLoop('chatbot', [{ role: 'user', content: 'Hello' }], 'google/gemini-2.0-flash-exp:free');
    for await (const event of loop) {
      console.log('Event:', event);
    }
    console.log('Finished loop');
  } catch (err) {
    console.error('Loop Error:', err);
  }
}
test();
