import { useState, useRef, useEffect } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { useStream } from '../hooks/useStream';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─────────────────────────────────────────────────────────────
// Sub-component: Tool Result Handler (Leaked JSON Fix)
// ─────────────────────────────────────────────────────────────
function ToolCallCard({ tool, input, status = 'Running', isDark }) {
  const isCompleted = status === 'Completed' || status === 'done';
  return (
    <div className={`my-4 rounded-xl border overflow-hidden shadow-sm transition-all ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
      <div className={`flex items-center justify-between px-3 py-2 border-b ${isDark ? 'border-blue-500/10' : 'border-blue-200/50'}`}>
        <div className="flex items-center gap-2">
          <LucideIcons.Terminal className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>System</span>
        </div>
        <div className="flex items-center gap-2">
           {isCompleted ? (
             <LucideIcons.CheckCircle2 className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
           ) : (
             <LucideIcons.Loader2 className={`w-3 h-3 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
           )}
        </div>
      </div>
      <div className="p-3">
        <div className={`font-mono text-xs font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>{tool}</div>
        <pre className={`rounded-lg border p-2 overflow-x-auto font-mono text-[10px] ${isDark ? 'bg-black/40 border-white/5 text-emerald-400' : 'bg-white border-black/5 text-emerald-600'}`}>
          {JSON.stringify(input, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Broker Component
// ─────────────────────────────────────────────────────────────
export default function BrokerView() {
  const { activePersona, theme } = usePersonaStore();
  const { sendMessage, messages, isStreaming, clearMessages } = useStream(activePersona.id);
  const [input, setInput] = useState('');
  const [marketData, setMarketData] = useState([]);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const endRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time market summary
  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/market-summary');
        const data = await res.json();
        if (data.summary) setMarketData(data.summary);
        
        const now = new Date();
        const day = now.getUTCDay();
        const hour = now.getUTCHours();
        const totalMin = hour * 60 + now.getUTCMinutes();
        setIsMarketOpen(day >= 1 && day <= 5 && totalMin >= 870 && totalMin <= 1260);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMarket();
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className={`flex flex-col h-full rounded-[32px] overflow-hidden shadow-2xl border ${isDark ? 'bg-[#050507] border-white/5' : 'bg-white border-black/5'}`}>
      
      {/* ── Header ── */}
      <div className={`p-4 border-b flex items-center justify-between backdrop-blur-xl z-20 ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20`}>
            <LucideIcons.TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>{activePersona.label}</h2>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-black/40'}`}>Market {isMarketOpen ? 'Open' : 'Closed'}</span>
            </div>
          </div>
        </div>
        <button onClick={clearMessages} className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-white' : 'bg-black/5 border-black/5 text-black/40 hover:text-black'}`}>
          <LucideIcons.Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* ── Main Chat Area ── */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 no-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <LucideIcons.LineChart className={`w-16 h-16 mb-6 ${isDark ? 'text-cyan-500/20' : 'text-cyan-500/10'}`} />
                <h3 className={`text-xl font-black mb-2 ${isDark ? 'text-white/30' : 'text-black/30'}`}>Financial Intelligence Ready</h3>
                <p className={`text-xs max-w-xs ${isDark ? 'text-white/20' : 'text-black/20'}`}>Enter a ticker symbol or ask for latest market news to begin analysis.</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] rounded-2xl p-4 shadow-sm ${isUser 
                      ? (isDark ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/20' : 'bg-cyan-600 text-white')
                      : (isDark ? 'bg-white/5 text-white/90 border border-white/5' : 'bg-gray-50 text-black border border-black/5')}`}>
                      
                      {msg.tool && <ToolCallCard tool={msg.tool} input={msg.input} status="Completed" isDark={isDark} />}
                      
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {msg.result && (
                        <div className={`mt-4 p-3 rounded-xl border font-mono text-[10px] overflow-x-auto ${isDark ? 'bg-black/40 border-white/5 text-cyan-400' : 'bg-white border-black/5 text-cyan-600'}`}>
                          {typeof msg.result === 'string' ? msg.result : JSON.stringify(msg.result, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-black/5'}`}>
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Analyze stock, get news, or track prices..."
                className={`w-full rounded-2xl py-4 pl-5 pr-14 text-sm outline-none transition-all ${isDark ? 'bg-white/5 border border-white/10 text-white focus:border-cyan-500/50' : 'bg-gray-100 border border-transparent text-black focus:bg-white focus:border-cyan-500/30'}`}
              />
              <button type="submit" disabled={isStreaming} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50">
                {isStreaming ? <LucideIcons.Loader2 className="w-5 h-5 animate-spin" /> : <LucideIcons.ArrowUp className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>

        {/* ── Sidebar (Right) ── */}
        <div className={`w-full lg:w-72 shrink-0 border-l p-4 space-y-6 overflow-y-auto no-scrollbar ${isDark ? 'bg-black/20 border-white/5' : 'bg-[#fcfcfb] border-black/5'}`}>
          
          {/* Market Summary */}
          <div className="space-y-3">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/30' : 'text-black/30'}`}>Market Pulse</h4>
            <div className="space-y-2">
              {marketData.length > 0 ? marketData.map((m, idx) => (
                <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>{m.symbol}</span>
                  <div className="text-right">
                    <div className={`text-xs font-mono font-bold ${isDark ? 'text-white' : 'text-black'}`}>{m.price}</div>
                    <div className={`text-[9px] font-bold text-emerald-500`}>{m.percent}%</div>
                  </div>
                </div>
              )) : (
                <div className="py-10 flex flex-col items-center gap-2 opacity-20">
                  <LucideIcons.RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Syncing Data</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/30' : 'text-black/30'}`}>Quick Insights</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'NVDA Analysis', prompt: 'Give me a deep dive trend analysis for NVIDIA (NVDA) stock' },
                { label: 'Market Sentiment', prompt: 'What is the current market sentiment based on latest news?' },
                { label: 'Trending Stocks', prompt: 'Which stocks are currently trending and why?' },
                { label: 'Tech Sector News', prompt: 'Fetch the latest technology sector financial news' }
              ].map((btn, i) => (
                <button key={i} onClick={() => sendMessage(btn.prompt)} className={`w-full text-left p-3 rounded-xl border text-[10px] font-bold transition-all ${isDark ? 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white' : 'bg-white border-black/5 text-black/60 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700'}`}>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Indicators */}
          <div className={`p-4 rounded-2xl border space-y-4 ${isDark ? 'bg-cyan-500/5 border-cyan-500/10' : 'bg-cyan-50 border-cyan-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-cyan-400/60' : 'text-cyan-700/60'}`}>Volatility Index</span>
              <LucideIcons.Info className="w-3 h-3 opacity-20" />
            </div>
            <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 w-[65%]" />
            </div>
            <p className={`text-[8px] font-medium italic ${isDark ? 'text-cyan-400/40' : 'text-cyan-700/40'}`}>VIX is currently moderate. Standard trading risk applies.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
