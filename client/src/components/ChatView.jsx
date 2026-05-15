import usePersonaStore from '../stores/personaStore';
import { useStream } from '../hooks/useStream';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as LucideIcons from 'lucide-react';
import AgentActivityPanel from './AgentActivityPanel';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

function ToolCallCard({ tool, input, status = 'Running', isDark }) {
  const isCompleted = status === 'Completed' || status === 'done';
  return (
    <div className={`my-6 rounded-2xl border overflow-hidden shadow-sm transition-all ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-blue-500/10' : 'border-blue-200/50'}`}>
        <div className="flex items-center gap-2">
          <LucideIcons.Terminal className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            System Tool
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <LucideIcons.CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          ) : (
            <LucideIcons.Loader2 className={`w-3.5 h-3.5 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          )}
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-blue-400' : 'text-blue-600')}`}>
            {isCompleted ? 'Completed' : status}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="mb-4">
          <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white/40' : 'text-black/40'}`}>Action</div>
          <div className={`font-mono text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{tool}</div>
        </div>
        <div>
          <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white/40' : 'text-black/40'}`}>Payload</div>
          <pre className={`rounded-xl border p-4 overflow-x-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap ${isDark ? 'bg-[#050505] border-white/10 text-emerald-400' : 'bg-white border-black/10 text-emerald-600'}`}>
            {JSON.stringify(input, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function ToolResultCard({ result, isDark }) {
  let displayResult = result;
  if (typeof result !== 'string') {
    displayResult = JSON.stringify(result, null, 2);
  } else if (result.length > 500) {
    displayResult = result.slice(0, 500) + '\n... [Content Truncated]';
  }

  return (
    <div className={`my-4 rounded-2xl border overflow-hidden shadow-sm transition-all ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
      <div className={`px-4 py-3 border-b flex items-center gap-2 ${isDark ? 'border-emerald-500/10' : 'border-emerald-200/50'}`}>
        <LucideIcons.CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
        <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
          Task Completed
        </span>
      </div>
      <div className="p-5">
        <pre className={`rounded-xl border p-4 overflow-x-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap ${isDark ? 'bg-[#050505] border-white/10 text-white/80' : 'bg-white border-black/10 text-black/80'}`}>
          {displayResult}
        </pre>
      </div>
    </div>
  );
}
export default function ChatView() {
  const { activePersona, theme } = usePersonaStore();
  const { messages, sendMessage, isStreaming, clearMessages, activity } = useStream(activePersona.id);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const isDark = theme === 'dark';

  const [marketData, setMarketData] = useState([]);
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  const IconComponent = LucideIcons[activePersona.icon] || LucideIcons.Bot;

  // Real-time market summary for Broker persona
  useEffect(() => {
    if (activePersona.id !== 'broker') return;
    
    const checkMarketStatus = () => {
      const now = new Date();
      const day = now.getUTCDay(); // 0=Sun, 6=Sat
      const hour = now.getUTCHours();
      const min = now.getUTCMinutes();
      const totalMin = hour * 60 + min;
      
      // 9:30 AM - 4:00 PM EST (approx 14:30 - 21:00 UTC)
      const open = day >= 1 && day <= 5 && totalMin >= 870 && totalMin <= 1260;
      setIsMarketOpen(open);
    };

    const fetchMarket = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/market-summary');
        const data = await res.json();
        if (data.summary) setMarketData(data.summary);
        checkMarketStatus();
      } catch (e) {
        console.error('Failed to fetch market summary:', e);
      }
    };
    
    fetchMarket();
    const interval = setInterval(fetchMarket, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [activePersona.id]);

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
    <div className={`flex flex-col h-full transition-all duration-500 rounded-[32px] overflow-hidden relative shadow-2xl border ${isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-[#FAFAFA] border-black/5'}`} style={{ '--persona-color': activePersona.color }}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between backdrop-blur-xl z-20 sticky top-0 transition-colors ${isDark ? 'bg-black/40 border-white/5' : 'bg-white/80 border-black/5'}`}>
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center rounded-2xl shadow-2xl transition-transform hover:scale-105"
            style={{
              backgroundColor: `${activePersona.color}${isDark ? '20' : '15'}`,
              color: activePersona.color,
              boxShadow: isDark ? `0 8px 32px ${activePersona.color}30` : `0 8px 32px ${activePersona.color}20`
            }}
          >
            <IconComponent className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`font-black text-xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{activePersona.label}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 transition-colors ${isDark ? 'text-white/40' : 'text-black/40'}`}>{activePersona.description}</p>
          </div>
        </div>
        <button
          onClick={clearMessages}
          className={`group text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all border flex items-center gap-2 ${isDark ? 'bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/10' : 'bg-black/5 border-black/5 text-black/50 hover:bg-black/10 hover:text-black'}`}
        >
          <LucideIcons.Trash2 className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
          Clear Chat
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 space-y-8 scroll-smooth no-scrollbar">
        {activePersona.id === 'broker' && (
          <div className={`mb-10 p-4 rounded-2xl border flex items-center justify-between gap-4 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap py-1">
              {marketData.length > 0 ? marketData.map((m, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${isDark ? 'text-white/40' : 'text-black/40'}`}>{m.symbol}</span>
                  <span className="text-sm font-mono font-bold text-emerald-500">
                    {m.price} <span className="text-[10px]">{m.percent}%</span>
                  </span>
                </div>
              )) : (
                <div className="flex items-center gap-2 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-[var(--persona-color)]"></div>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Loading Live Indices...</span>
                </div>
              )}
            </div>
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${isMarketOpen ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600') : (isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600')}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
              Market {isMarketOpen ? 'Open' : 'Closed'}
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className={`h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-1000`}>
            <div
              className="w-24 h-24 mb-8 rounded-[40px] flex items-center justify-center opacity-40 animate-pulse"
              style={{ backgroundColor: `${activePersona.color}${isDark ? '15' : '10'}`, color: activePersona.color }}
            >
              <IconComponent className="w-12 h-12" strokeWidth={1.2} />
            </div>
            <p className={`text-2xl font-light tracking-tight transition-colors ${isDark ? 'text-white/30' : 'text-black/30'}`}>
              {activePersona.id === 'broker' ? 'Ready for market analysis. Which ticker shall we track?' :
                activePersona.id === 'chatbot' ? 'I am up and ready! How can I help you today?' :
                  `How can I assist you with ${activePersona.label} today?`}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-2xl px-4">
              {activePersona.id === 'broker' ? (
                <>
                  <button onClick={() => sendMessage('Analyze NVIDIA (NVDA) stock trend')} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-black/5 border-black/10 text-black/60 hover:bg-black/10'}`}>NVDA Analysis</button>
                  <button onClick={() => sendMessage('Top 5 trending stocks today')} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-black/5 border-black/10 text-black/60 hover:bg-black/10'}`}>Market Trends</button>
                  <button onClick={() => sendMessage('Give me investment suggestions for AI sector')} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-black/5 border-black/10 text-black/60 hover:bg-black/10'}`}>AI Sector Suggestions</button>
                </>
              ) : activePersona.id === 'chatbot' ? (
                <>
                  <button onClick={() => sendMessage('What is the latest news today?')} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-black/5 border-black/10 text-black/60 hover:bg-black/10'}`}>Latest News</button>
                  <button onClick={() => sendMessage('Help me plan my day')} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-black/5 border-black/10 text-black/60 hover:bg-black/10'}`}>Plan My Day</button>
                  <button onClick={() => sendMessage('Explain quantum computing simply')} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-black/5 border-black/10 text-black/60 hover:bg-black/10'}`}>Learn Something</button>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isUser = msg.role === 'user';

            if (!isUser && msg.content === '' && isStreaming) {
              return (
                <div key={i} className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className={`max-w-[85%] rounded-3xl p-6 border flex items-center gap-4 rounded-tl-sm transition-all shadow-xl ${isDark ? 'bg-white/5 border-white/5 text-white/60' : 'bg-black/5 border-black/5 text-black/60'}`}>
                    <div className="relative">
                      <LucideIcons.Loader2 className="w-5 h-5 animate-spin" style={{ color: activePersona.color }} />
                      <div className="absolute inset-0 blur-md opacity-50 animate-pulse" style={{ backgroundColor: activePersona.color }}></div>
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest animate-pulse">Architecting...</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div
                  className={`relative max-w-[95%] md:max-w-[85%] rounded-3xl p-5 md:p-7 shadow-2xl transition-all break-words ${isUser
                    ? (isDark ? 'bg-white/10 text-white rounded-tr-none border border-white/10 backdrop-blur-md' : 'text-white rounded-tr-none border font-medium')
                    : (isDark ? 'bg-[#121214] border border-white/5 rounded-tl-none text-white/90' : 'bg-white border border-black/5 rounded-tl-none text-black/90')
                    }`}
                  style={isUser && !isDark ? { backgroundColor: activePersona.color || '#2563eb', borderColor: activePersona.color } : (!isUser ? { borderLeft: `6px solid ${activePersona.color}` } : {})}
                >
                  <div className={`prose max-w-none prose-sm md:prose-base transition-colors ${isDark ? 'prose-invert' : 'prose-slate'} ${(isUser && !isDark) ? 'text-white' : ''}`}>
                    {msg.tool && <ToolCallCard tool={msg.tool} input={msg.input} status="Completed" isDark={isDark} />}
                    {msg.result && <ToolResultCard result={msg.result} isDark={isDark} />}
                    {msg.content && (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => {
                            // Detect if this paragraph is actually raw tool call JSON
                            const text = String(children);
                            if (text.trim().startsWith('[{"name":') || text.trim().startsWith('[{"tool_calls"')) {
                              try {
                                const parsed = JSON.parse(text);
                                if (Array.isArray(parsed) && parsed[0]?.name) {
                                  const toolName = parsed[0].name;
                                  const toolArgs = typeof parsed[0].arguments === 'string' ? JSON.parse(parsed[0].arguments) : parsed[0].arguments;

                                  return (
                                    <div className="my-4 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                                      <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[var(--persona-color)] uppercase tracking-wider">
                                        <LucideIcons.Terminal className="w-4 h-4" />
                                        System Tool: {toolName}
                                      </div>
                                      <SyntaxHighlighter
                                        language={toolName === 'execute_code' ? (toolArgs.language || 'javascript') : 'json'}
                                        style={isDark ? oneDark : oneLight}
                                        customStyle={{ margin: 0, borderRadius: '8px', fontSize: '11px' }}
                                        wrapLongLines={true}
                                      >
                                        {toolName === 'execute_code' ? toolArgs.code : JSON.stringify(toolArgs, null, 2)}
                                      </SyntaxHighlighter>
                                    </div>
                                  );
                                }
                              } catch (e) {
                                // If it's partial JSON while streaming, just show a nice loading state
                                return (
                                  <div className="flex items-center gap-3 text-sm font-medium text-[var(--persona-color)] animate-pulse">
                                    <LucideIcons.Cpu className="w-4 h-4" />
                                    <span>Processing background task...</span>
                                  </div>
                                );
                              }
                            }
                            return <p className={`mb-4 last:mb-0 leading-relaxed opacity-95 ${(isUser && !isDark) ? 'text-white' : ''}`}>{children}</p>;
                          },
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider no-underline transition-all border align-middle mb-1 shadow-sm ${isUser && !isDark ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' : 'bg-[var(--persona-color)]/10 text-[var(--persona-color)] hover:bg-[var(--persona-color)]/20 border-[var(--persona-color)]/20'}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <LucideIcons.ExternalLink className="w-2.5 h-2.5" />
                              {props.children}
                            </a>
                          ),
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const lang = match ? match[1] : 'javascript';
                            const content = String(children).replace(/\n$/, '');

                            // Generate a truly unique ID for this specific block to fix the copy bug
                            const blockId = `code-${Math.random().toString(36).substring(2, 9)}`;

                            if (inline) {
                              return (
                                <code className={`px-2 py-0.5 rounded-lg font-mono text-[13px] font-bold ${isUser && !isDark ? 'bg-white/20 text-white' : (isDark ? 'bg-white/10 text-emerald-400' : 'bg-black/5 text-emerald-600')}`} {...props}>
                                  {children}
                                </code>
                              );
                            }

                            return (
                              <div className="group relative my-8 rounded-[24px] overflow-hidden border border-white/5 shadow-2xl transition-all hover:shadow-[var(--persona-color)]/5">
                                <div className={`flex items-center justify-between px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'bg-white/5 text-white/40 border-b border-white/5' : 'bg-black/5 text-black/50 border-b border-black/5'}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activePersona.color }}></div>
                                    <span>{lang || 'code'}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(content);
                                      const btn = document.getElementById(blockId);
                                      if (btn) {
                                        const originalText = btn.innerHTML;
                                        btn.innerText = 'Copied!';
                                        btn.style.color = activePersona.color;
                                        setTimeout(() => {
                                          if (btn) {
                                            btn.innerHTML = originalText;
                                            btn.style.color = '';
                                          }
                                        }, 2000);
                                      }
                                    }}
                                    id={blockId}
                                    className="hover:text-[var(--persona-color)] transition-all flex items-center gap-2 active:scale-95 font-black"
                                  >
                                    <LucideIcons.Copy className="w-3.5 h-3.5" />
                                    Copy
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  language={lang}
                                  style={isDark ? oneDark : oneLight}
                                  customStyle={{
                                    margin: 0,
                                    background: isDark ? '#050505' : '#FAFAFA',
                                    padding: '1.5rem',
                                    fontSize: '13px',
                                    lineHeight: '1.6'
                                  }}
                                  wrapLongLines={true}
                                >
                                  {content}
                                </SyntaxHighlighter>
                              </div>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Agent Activity Panel */}
        {isStreaming && (
          <div className="flex justify-start px-2">
            <AgentActivityPanel
              activity={activity}
              personaColor={activePersona.color}
              isDark={isDark}
            />
          </div>
        )}

        <div ref={endRef} className="h-12" />
      </div>

      {/* Input Area */}
      <div className={`p-4 md:p-8 backdrop-blur-3xl transition-colors duration-700 ${isDark ? 'bg-gradient-to-t from-black to-transparent border-t border-white/5' : 'bg-gradient-to-t from-white to-transparent border-t border-black/5'}`}>
        <form onSubmit={handleSubmit} className="relative flex items-center max-w-5xl mx-auto group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder={`Message ${activePersona.label}...`}
            className={`w-full border rounded-[28px] py-5 pl-8 pr-20 focus:outline-none transition-all disabled:opacity-50 shadow-2xl text-base ${isDark ? 'bg-[#151517] border-white/10 text-white/90 placeholder:text-white/20 focus:ring-2 focus:ring-[var(--persona-color)]/30' : 'bg-white border-black/10 text-black/90 placeholder:text-black/30 focus:ring-2 focus:ring-[var(--persona-color)]/20'}`}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl disabled:opacity-30 transition-all flex items-center justify-center group active:scale-90"
            style={{
              backgroundColor: input.trim() && !isStreaming ? activePersona.color : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
              color: input.trim() && !isStreaming ? '#fff' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'),
              boxShadow: input.trim() && !isStreaming ? `0 8px 24px ${activePersona.color}50` : 'none'
            }}
          >
            <LucideIcons.Send className={`w-5 h-5 ${input.trim() && !isStreaming ? 'transition-transform' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
}
