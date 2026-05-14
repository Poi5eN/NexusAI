import usePersonaStore from '../stores/personaStore';
import { useStream } from '../hooks/useStream';
import { useState, useRef, useEffect } from 'react';

export default function ChatView() {
  const { activePersona } = usePersonaStore();
  const { messages, sendMessage, isStreaming, clearMessages } = useStream(activePersona.id);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden relative" data-persona={activePersona.id}>
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-surface-glass)] flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{activePersona.icon}</span>
          <div>
            <h2 className="font-bold text-lg">{activePersona.label}</h2>
            <p className="text-xs text-white/50">{activePersona.id} agent</p>
          </div>
        </div>
        <button onClick={clearMessages} className="text-sm bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg transition-all">Clear Chat</button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30 text-center">
            <span className="text-6xl mb-4">{activePersona.icon}</span>
            <p>How can I help you today?</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-[var(--accent)] text-black font-medium' : 'bg-white/10 border border-white/5'}`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20 backdrop-blur-md border-t border-[var(--color-surface-glass)]">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder={`Message ${activePersona.label}...`}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isStreaming || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--accent)] text-black p-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
