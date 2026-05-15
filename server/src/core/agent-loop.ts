import { TOOLS_BY_PERSONA } from '../tools/registry.ts';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export interface AgentEvent {
  type: 'token' | 'tool_start' | 'tool_result' | 'error' | 'done';
  content?: string;
  tool?: string;
  input?: any;
  result?: any;
}

/**
 * Agentic Loop implementation.
 * Drives the LLM through multiple reasoning/tool-execution steps.
 */
export async function* agentLoop(
  personaId: string, 
  messages: any[], 
  model: string
): AsyncGenerator<AgentEvent> {
  const tools = TOOLS_BY_PERSONA[personaId] || [];
  let loopCount = 0;
  const maxLoops = 5;

  while (loopCount < maxLoops) {
    loopCount++;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nexus.dev',
        'X-Title': 'NEXUS Agent Engine',
      },
      body: JSON.stringify({
        model,
        messages,
        tools: tools.length > 0 ? tools.map(t => ({
          type: "function",
          function: t.schema
        })) : undefined,
        tool_choice: tools.length > 0 ? "auto" : undefined,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      yield { type: 'error', content: `LLM Error: ${error}` };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let toolCalls: any[] = [];
    let assistantMessageContent = "";
    let buffer = "";

    const processChunk = (payload: string) => {
      if (!payload || payload === '[DONE]') return null;
      try {
        const chunk = JSON.parse(payload);
        return chunk.choices?.[0]?.delta;
      } catch (e) {
        return null;
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const delta = processChunk(line.replace(/^data: /, '').trim());
        if (!delta) continue;

        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            if (tc.index !== undefined) {
              if (!toolCalls[tc.index]) {
                toolCalls[tc.index] = { id: tc.id, function: { name: "", arguments: "" } };
              }
              if (tc.function?.name) toolCalls[tc.index].function.name += tc.function.name;
              if (tc.function?.arguments) toolCalls[tc.index].function.arguments += tc.function.arguments;
            }
          }
        }
        if (delta.content) {
          assistantMessageContent += delta.content;
          yield { type: 'token', content: delta.content };
        }
      }
    }

    // Final buffer check
    if (buffer) {
      const delta = processChunk(buffer.replace(/^data: /, '').trim());
      if (delta) {
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            if (tc.index !== undefined) {
              if (!toolCalls[tc.index]) {
                toolCalls[tc.index] = { id: tc.id, function: { name: "", arguments: "" } };
              }
              if (tc.function?.name) toolCalls[tc.index].function.name += tc.function.name;
              if (tc.function?.arguments) toolCalls[tc.index].function.arguments += tc.function.arguments;
            }
          }
        }
        if (delta.content) {
          assistantMessageContent += delta.content;
          yield { type: 'token', content: delta.content };
        }
      }
    }

    // Process finished tool calls
    if (toolCalls.length > 0) {
      const finalAssistantMessage = {
        role: "assistant",
        content: assistantMessageContent || null,
        tool_calls: toolCalls.map(tc => ({
          id: tc.id,
          type: "function",
          function: tc.function
        }))
      };
      messages.push(finalAssistantMessage);

      // Prepare parallel execution
      const toolPromises = toolCalls.map(async (tc) => {
        const toolName = tc.function.name;
        let toolArgs = {};
        try {
          toolArgs = JSON.parse(tc.function.arguments || "{}");
        } catch (e) {
          console.error(`Error parsing tool arguments for ${toolName}:`, e);
        }
        
        const toolDef = tools.find(t => t.schema.name === toolName);
        if (!toolDef) {
           return { id: tc.id, name: toolName, error: "Tool not found" };
        }

        try {
          const result = await toolDef.execute(toolArgs);
          return { id: tc.id, name: toolName, result, input: toolArgs };
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          return { id: tc.id, name: toolName, error: errorMsg, input: toolArgs };
        }
      });

      // Yield "start" for all tools before executing
      for (const tc of toolCalls) {
        let toolArgs = {};
        try { toolArgs = JSON.parse(tc.function.arguments || "{}"); } catch(e) {}
        yield { type: 'tool_start', tool: tc.function.name, input: toolArgs };
      }

      const results = await Promise.all(toolPromises);

      // Yield results and push to messages
      for (const res of results) {
        if ('error' in res) {
          messages.push({
            role: "tool",
            tool_call_id: res.id,
            name: res.name,
            content: `Error: ${res.error}`
          });
        } else {
          yield { type: 'tool_result', tool: res.name, result: res.result };
          messages.push({
            role: "tool",
            tool_call_id: res.id,
            name: res.name,
            content: res.result
          });
        }
      }

      // Loop again to give LLM the tool results
      continue;
    } else {
      // No more tool calls, we're done
      yield { type: 'done' };
      break;
    }
  }
}
