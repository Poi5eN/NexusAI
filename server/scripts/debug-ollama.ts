const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';
const MODEL = 'qwen3.5:9b';

async function debugOllama() {
  console.log(`\n🔍 Debugging Ollama Tool Result Flow with ${MODEL}...`);
  
  // Simulation: User asks for weather -> Assistant calls tool -> Tool returns result
  const messages = [
    { role: 'user', content: 'What is the weather in London?' },
    { 
      role: 'assistant', 
      // content: "", 
      tool_calls: [
        { 
          id: 'call_abc123', 
          type: 'function', 
          function: { name: 'get_weather', arguments: { location: "London" } } 
        }
      ] 
    },
    { 
      role: 'tool', 
      tool_call_id: 'call_abc123', 
      content: JSON.stringify({ temperature: 15, condition: 'Cloudy' }) 
    }
  ];

  const body = {
    model: MODEL,
    messages: messages.map(m => {
      const msg: any = { role: m.role };
      if (m.content !== undefined) msg.content = m.content;
      if (m.role === 'assistant' && m.tool_calls) msg.tool_calls = m.tool_calls;
      if (m.role === 'tool') msg.tool_call_id = m.tool_call_id;
      return msg;
    }),
    stream: false,
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_weather',
          description: 'Get weather',
          parameters: { type: 'object', properties: { location: { type: 'string' } } }
        }
      }
    ]
  };

  console.log('📦 Sending Request Body:', JSON.stringify(body, null, 2));

  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const text = await res.text();
    console.log(`\n📥 Response (${res.status}):`, text);
  } catch (error) {
    console.error('💥 Fetch Error:', error);
  }
}

debugOllama();
