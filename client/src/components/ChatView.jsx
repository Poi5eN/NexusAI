import usePersonaStore from '../stores/personaStore';
import { useStream } from '../hooks/useStream';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as LucideIcons from 'lucide-react';

export default function ChatView() {
  const { activePersona, theme } = usePersonaStore();
  const { messages, sendMessage, isStreaming, clearMessages } = useStream(activePersona.id);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const isDark = theme === 'dark';

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

  return (
    <div className={`flex flex-col h-full transition-all duration-500 rounded-[32px] overflow-hidden relative shadow-2xl border ${isDark ? 'glass border-white/5' : 'bg-white border-black/5'}`} style={{ '--persona-color': activePersona.color }}>
      {/* Header */}
      <div className={`p-5 border-b flex items-center justify-between backdrop-blur-md z-10 sticky top-0 transition-colors ${isDark ? 'bg-black/40 border-white/5' : 'bg-white/80 border-black/5'}`}>
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 flex items-center justify-center rounded-xl shadow-lg"
            style={{ 
              backgroundColor: `${activePersona.color}${isDark ? '20' : '11'}`,
              color: activePersona.color,
              boxShadow: isDark ? `0 0 30px ${activePersona.color}30` : 'none'
            }}
          >
            <IconComponent className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`font-extrabold text-xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>{activePersona.label}</h2>
            <p className={`text-[10px] uppercase tracking-widest mt-0.5 transition-colors ${isDark ? 'text-white/50' : 'text-black/30'}`}>{activePersona.description}</p>
          </div>
        </div>
        <button 
          onClick={clearMessages} 
          className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all border flex items-center gap-2 ${isDark ? 'bg-white/5 border-white/5 text-white/70 hover:text-white' : 'bg-black/5 border-black/5 text-black/50 hover:bg-black/10 hover:text-black'}`}
        >
          <LucideIcons.Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth no-scrollbar">
        {messages.length === 0 ? (
          <div className={`h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700`}>
            <div 
              className="w-24 h-24 mb-6 rounded-3xl flex items-center justify-center opacity-50"
              style={{ backgroundColor: `${activePersona.color}${isDark ? '10' : '08'}`, color: activePersona.color }}
            >
              <IconComponent className="w-12 h-12" strokeWidth={1.5} />
            </div>
            <p className={`text-xl font-medium transition-colors ${isDark ? 'text-white/50' : 'text-black/30'}`}>How can I assist you today?</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            
            if (!isUser && msg.content === '' && isStreaming) {
              return (
                <div key={i} className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                  <div className={`max-w-[85%] rounded-3xl p-5 border flex items-center gap-3 rounded-tl-sm transition-colors ${isDark ? 'bg-white/5 border-white/5 text-white/60' : 'bg-black/5 border-black/5 text-black/60'}`}>
                    <LucideIcons.Loader2 className="w-5 h-5 animate-spin" style={{ color: activePersona.color }} />
                    <span className="text-sm font-medium animate-pulse">Thinking...</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div 
                  className={`max-w-[85%] rounded-3xl p-5 md:p-6 shadow-sm border transition-all ${
                    isUser 
                      ? (isDark ? 'bg-white/10 text-white rounded-tr-sm border-white/5 backdrop-blur-sm' : 'bg-black/5 text-black rounded-tr-sm border-black/5 font-medium') 
                      : (isDark ? 'bg-black/40 border-white/5 rounded-tl-sm text-white/90 prose prose-invert' : 'bg-white border-black/5 rounded-tl-sm text-black/80 prose prose-slate')
                  }`}
                  style={isUser ? {} : { borderLeft: `4px solid ${activePersona.color}` }}
                >
                  <div className="prose max-w-none prose-sm md:prose-base dark:prose-invert">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({node, ...props}) => <a {...props} className="text-[var(--persona-color)] hover:underline" target="_blank" rel="noreferrer" />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className={`p-4 md:p-6 transition-colors duration-700 ${isDark ? 'bg-gradient-to-t from-black/80 to-transparent' : 'bg-gradient-to-t from-black/[0.02] to-transparent'}`}>
        <form onSubmit={handleSubmit} className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder={`Message ${activePersona.label}...`}
            className={`w-full border rounded-2xl py-4 pl-6 pr-16 focus:outline-none transition-all disabled:opacity-50 shadow-xl ${isDark ? 'bg-[#1A1A1A] border-white/10 text-white/90 placeholder:text-white/30 focus:ring-1 focus:ring-white/20' : 'bg-[#f3f3f2] border-black/5 text-black/90 placeholder:text-black/30 focus:ring-1 focus:ring-black/10'}`}
          />
          <button 
            type="submit" 
            disabled={isStreaming || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl disabled:opacity-50 transition-all flex items-center justify-center group"
            style={{ 
              backgroundColor: input.trim() && !isStreaming ? activePersona.color : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
              color: input.trim() && !isStreaming ? (isDark ? '#000' : '#fff') : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)')
            }}
          >
            <LucideIcons.Send className={`w-4 h-4 ${input.trim() && !isStreaming ? 'group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
}
