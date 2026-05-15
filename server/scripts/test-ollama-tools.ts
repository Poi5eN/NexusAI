import { getStockPrice } from '../src/tools/stockPrice';

const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';
const MODEL = 'qwen3.5:9b';

async function testToolCalling() {
  console.log(`\n🚀 Testing Tool Calling with ${MODEL}...`);
  
  const messages = [
    { 
      role: 'system', 
      content: 'You are a helpful assistant with access to tools. If you need a stock price, use get_stock_price.' 
    },
    { role: 'user', content: 'What is the current stock price of NVIDIA (NVDA)?' }
  ];

  const tools = [
    {
      type: 'function',
      function: {
        name: 'get_stock_price',
        description: 'Get live stock prices',
        parameters: {
          type: 'object',
          properties: {
            symbol: { type: 'string' }
          },
          required: ['symbol']
        }
      }
    }
  ];

  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages,
        tools,
        stream: false
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json() as any;
    const message = data.message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      console.log('✅ SUCCESS: Model correctly identified the tool!');
      const toolCall = message.tool_calls[0];
      console.log(`   Tool: ${toolCall.function.name}`);
      console.log(`   Args:`, toolCall.function.arguments);
      
      const args = typeof toolCall.function.arguments === 'string' 
        ? JSON.parse(toolCall.function.arguments) 
        : toolCall.function.arguments;
      console.log('📡 Executing actual tool...');
      const result = await getStockPrice(args.symbol);
      console.log('📊 Result:', result);
    } else {
      console.log('❌ FAILURE: Model did not call any tools.');
      console.log('   Response Content:', message.content);
    }
  } catch (error) {
    console.error('💥 Error during test:', error);
  }
}

testToolCalling();
