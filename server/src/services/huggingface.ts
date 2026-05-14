/**
 * Hugging Face Inference Service
 * All image generation goes through here.
 */

const HF_BASE = 'https://router.huggingface.co/hf-inference/models';

function getApiKey(): string {
  const key = process.env.HF_API_TOKEN;
  if (!key) throw new Error('HF_API_TOKEN is not set in server/.env');
  return key;
}

export interface ImageOptions {
  prompt: string;
  model?: string;
  negative_prompt?: string;
  num_inference_steps?: number;
}

/**
 * Generates an image and returns it as a base64 data URL string.
 * e.g. "data:image/jpeg;base64,/9j/4AAQ..."
 */
export async function generateImage(options: ImageOptions): Promise<string> {
  const model = options.model ?? process.env.HF_IMAGE_MODEL ?? 'black-forest-labs/FLUX.1-schnell';

  const res = await fetch(`${HF_BASE}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: options.prompt,
      parameters: {
        negative_prompt: options.negative_prompt,
        num_inference_steps: options.num_inference_steps ?? 4,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HF API ${res.status}: ${text}`);
  }

  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:image/jpeg;base64,${base64}`;
}
