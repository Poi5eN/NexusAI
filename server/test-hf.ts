import { chatHF } from './src/services/huggingface.ts';
async function test() {
  try {
    const res = await chatHF([{ role: 'user', content: 'Hello' }]);
    console.log('HF Success:', res);
  } catch (err) {
    console.error('HF Error:', err);
  }
}
test();
