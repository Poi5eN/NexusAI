/**
 * useStream — SSE streaming hook for chat messages.
 * Usage: const { sendMessage, messages, isStreaming } = useStream(personaId);
 */
import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export function useStream(personaId) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (userContent) => {
    const userMessage = { role: 'user', content: userContent };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsStreaming(true);

    // Placeholder for the assistant reply
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Persona': personaId,
        },
        body: JSON.stringify({ messages: updatedMessages, stream: true }),
      });

      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE chunks: "data: {...}\n\n"
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed?.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  role: 'assistant',
                  content: (copy[copy.length - 1]?.content ?? '') + delta,
                };
                return copy;
              });
            }
          } catch {
            // Ignore malformed SSE chunks
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: 'assistant',
          content: `⚠️ Error: ${err instanceof Error ? err.message : 'Something went wrong'}`,
        };
        return copy;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [messages, personaId]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, sendMessage, isStreaming, clearMessages };
}
