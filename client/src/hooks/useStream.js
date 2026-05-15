/**
 * useStream — SSE streaming hook for chat messages.
 * Usage: const { sendMessage, messages, isStreaming } = useStream(personaId);
 */
import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export function useStream(personaId) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activity, setActivity] = useState([]); // Track tool execution events

  const sendMessage = useCallback(async (userContent) => {
    const userMsg = { role: 'user', content: userContent };
    
    // Reset state for new stream
    setIsStreaming(true);
    setActivity([]);
    setMessages([userMsg, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Persona': personaId,
        },
        body: JSON.stringify({ 
          messages: [userMsg], 
          stream: true 
        }),
      });

      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;

          try {
            const event = JSON.parse(payload);
            
            switch (event.type) {
              case 'token':
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'assistant') {
                    return [
                      ...prev.slice(0, -1),
                      { ...last, content: last.content + event.content }
                    ];
                  }
                  return prev;
                });
                break;

              case 'token_reset':
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'assistant') {
                    return [
                      ...prev.slice(0, -1),
                      { ...last, content: '' }
                    ];
                  }
                  return prev;
                });
                break;

              case 'tool_start':
                setActivity(prev => [...prev, { 
                  id: Date.now(), 
                  type: 'tool_start', 
                  tool: event.tool, 
                  input: event.input,
                  status: 'running' 
                }]);
                break;

              case 'tool_result':
                setActivity(prev => {
                  const copy = [...prev];
                  const toolIdx = copy.findLastIndex(a => a.tool === event.tool);
                  if (toolIdx !== -1) {
                    copy[toolIdx] = { ...copy[toolIdx], status: 'done', result: event.result };
                  }
                  return copy;
                });
                break;

              case 'error':
                throw new Error(event.content);
            }
          } catch (e) {
            console.error('SSE Error:', e);
          }
        }
      }
    } catch (err) {
      let displayError = err instanceof Error ? err.message : 'Something went wrong';
      
      // Try to parse JSON error from server if it looks like one
      try {
        if (displayError.startsWith('LLM Error: ')) {
          const jsonStr = displayError.replace('LLM Error: ', '');
          const parsed = JSON.parse(jsonStr);
          if (parsed.error?.message) {
            displayError = parsed.error.message;
          }
        }
      } catch (e) {
        // Fallback to original string
      }

      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        // Use a plain marker — no markdown so the UI can display cleanly
        const errorMsg = `⚠️ ${displayError}`;
        if (last && last.role === 'assistant' && !last.content) {
          copy[copy.length - 1] = { role: 'assistant', content: errorMsg };
        } else {
          copy.push({ role: 'assistant', content: errorMsg });
        }
        return copy;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [messages, personaId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setActivity([]);
  }, []);

  return { messages, sendMessage, isStreaming, clearMessages, activity };
}
