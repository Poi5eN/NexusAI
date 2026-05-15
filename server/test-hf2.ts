import { generateImage } from './src/services/huggingface.ts';

async function test() {
  try {
    const res = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: "Hello, who are you?",
      })
    });
    console.log(res.status, await res.text());
  } catch (err) {
    console.error('HF Error:', err);
  }
}
test();
