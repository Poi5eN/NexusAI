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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const payload = line.replace(/^data: /, '').trim();
        if (!payload || payload === '[DONE]') continue;

        try {
          const chunk = JSON.parse(payload);
          const delta = chunk.choices?.[0]?.delta;

          if (!delta) continue;

          // 1. Handle Tool Calls
          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              if (tc.index !== undefined) {
                if (!toolCalls[tc.index]) {
                  toolCalls[tc.index] = { 
                    id: tc.id, 
                    function: { name: "", arguments: "" } 
                  };
                }
                if (tc.function?.name) toolCalls[tc.index].function.name += tc.function.name;
                if (tc.function?.arguments) toolCalls[tc.index].function.arguments += tc.function.arguments;
              }
            }
          }

          // 2. Handle Text Content
          if (delta.content) {
            assistantMessageContent += delta.content;
            yield { type: 'token', content: delta.content };
          }
        } catch (e) {
          // Skip malformed chunks
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

      for (const tc of toolCalls) {
        const toolName = tc.function.name;
        const toolArgs = JSON.parse(tc.function.arguments || "{}");
        const toolDef = tools.find(t => t.schema.name === toolName);

        yield { type: 'tool_start', tool: toolName, input: toolArgs };

        if (toolDef) {
          try {
            const result = await toolDef.execute(toolArgs);
            yield { type: 'tool_result', tool: toolName, result };
            messages.push({
              role: "tool",
              tool_call_id: tc.id,
              name: toolName,
              content: result
            });
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            messages.push({
              role: "tool",
              tool_call_id: tc.id,
              name: toolName,
              content: `Error: ${errorMsg}`
            });
          }
        } else {
          messages.push({
            role: "tool",
            tool_call_id: tc.id,
            name: toolName,
            content: "Error: Tool not found"
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
