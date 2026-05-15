import { streamChat } from './src/services/openrouter.ts';

// Force the catch block by mocking an invalid model
async function test() {
  const res = await streamChat({
    model: 'invalid-model-name-to-force-fallback',
    messages: [{ role: 'user', content: 'Hi' }]
  } as any);

  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
  }
  console.log("Stream Output:");
  console.log(buffer);
}

test();
