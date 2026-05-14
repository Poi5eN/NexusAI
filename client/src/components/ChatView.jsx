import usePersonaStore from '../stores/personaStore';
import { useStream } from '../hooks/useStream';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as LucideIcons from 'lucide-react';

export default function ChatView() {
  const { activePersona } = usePersonaStore();
  const { messages, sendMessage, isStreaming, clearMessages } = useStream(activePersona.id);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  // Fallback to a generic icon if the specific one is missing
  const IconComponent = LucideIcons[activePersona.icon] || LucideIcons.Bot;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  // The Assistant is only the 'chatbot' persona. If others are selected, they should render their own Views
  // We'll enforce this routing in App.jsx, but for now ChatView handles 'chatbot'.

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden relative shadow-2xl" style={{ '--persona-color': activePersona.color }}>
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 flex items-center justify-center rounded-xl shadow-lg"
            style={{ 
              backgroundColor: `${activePersona.color}20`,
              color: activePersona.color,
              boxShadow: `0 0 30px ${activePersona.color}30`
            }}
          >
            <IconComponent className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-extrabold text-xl tracking-tight">{activePersona.label}</h2>
            <p className="text-xs text-white/50 uppercase tracking-widest mt-0.5">{activePersona.description}</p>
          </div>
        </div>
        <button 
          onClick={clearMessages} 
          className="text-xs font-semibold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-white/5 flex items-center gap-2 text-white/70 hover:text-white"
        >
          <LucideIcons.Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30 text-center animate-in fade-in zoom-in duration-700">
            <div 
              className="w-24 h-24 mb-6 rounded-3xl flex items-center justify-center opacity-50"
              style={{ backgroundColor: `${activePersona.color}10`, color: activePersona.color }}
            >
              <IconComponent className="w-12 h-12" strokeWidth={1.5} />
            </div>
            <p className="text-xl font-medium text-white/50">How can I assist you today?</p>
            <p className="text-sm mt-2 opacity-50 max-w-sm">I'm ready to answer questions, brainstorm, write code, or help you solve problems.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            
            // Render Loading State for empty assistant message during streaming
            if (!isUser && msg.content === '' && isStreaming) {
              return (
                <div key={i} className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                  <div className="max-w-[85%] rounded-3xl p-5 bg-white/5 border border-white/5 flex items-center gap-3 rounded-tl-sm text-white/60">
                    <LucideIcons.Loader2 className="w-5 h-5 animate-spin" style={{ color: activePersona.color }} />
                    <span className="text-sm font-medium animate-pulse">Thinking...</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div 
                  className={`max-w-[85%] rounded-3xl p-5 md:p-6 shadow-md ${
                    isUser 
                      ? 'bg-white/10 text-white font-medium rounded-tr-sm border border-white/5 backdrop-blur-sm' 
                      : 'bg-black/40 border border-white/5 rounded-tl-sm prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl max-w-none'
                  }`}
                  style={isUser ? {} : { boxShadow: `inset 2px 0 0 ${activePersona.color}` }}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({node, ...props}) => <a {...props} className="text-[var(--persona-color)] hover:underline" target="_blank" rel="noreferrer" />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent pt-10 mt-auto">
        <form onSubmit={handleSubmit} className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder={`Message ${activePersona.label}...`}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all disabled:opacity-50 shadow-xl text-white/90 placeholder:text-white/30"
          />
          <button 
            type="submit" 
            disabled={isStreaming || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl disabled:opacity-50 transition-all flex items-center justify-center group"
            style={{ 
              backgroundColor: input.trim() && !isStreaming ? activePersona.color : 'rgba(255,255,255,0.1)',
              color: input.trim() && !isStreaming ? '#000' : 'rgba(255,255,255,0.5)'
            }}
          >
            <LucideIcons.Send className={`w-4 h-4 ${input.trim() && !isStreaming ? 'group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
}
