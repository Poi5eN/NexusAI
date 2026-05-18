import { useState, useRef, useEffect } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStream } from '../hooks/useStream';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MovieView() {
  const { activePersona, theme } = usePersonaStore();
  const { sendMessage, messages, isStreaming, activity, clearMessages } = useStream(activePersona.id);
  const [mood, setMood] = useState('');
  const endRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (activePersona.id !== 'movies') return null;

  const handleSuggest = async (e) => {
    e.preventDefault();
    if (!mood.trim() || isStreaming) return;
    
    const prompt = `I'm in the following mood/situation: "${mood}". 
    
    Please provide:
    1. 3-5 MOVIE RECOMMENDATIONS with ratings
    2. WHERE TO WATCH (streaming or theater showtimes)
    3. EXPERT COMMENTARY on cinematography or trivia.`;
    
    await sendMessage(prompt);
    setMood('');
  };

  return (
    <div className={`flex flex-col h-full rounded-[32px] overflow-hidden shadow-2xl relative transition-all duration-700 ${isDark ? 'bg-[#0a0a0c] text-white' : 'bg-[#fafafa] text-black'}`}>
      
      {/* ── Top Immersive Header ── */}
      <div className={`relative h-28 flex-shrink-0 flex items-center px-8 overflow-hidden group border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
        {/* Animated Background Blur */}
        <div className={`absolute inset-0 opacity-20 group-hover:scale-110 transition-transform duration-1000 bg-gradient-to-br from-yellow-600/30 to-purple-900/30 blur-3xl`} />
        
        <div className="relative z-10 w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className={`w-20 h-20 flex items-center justify-center rounded-3xl border-2 shadow-2xl transition-all ${isDark ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-white border-amber-200 text-amber-700'}`}>
                <LucideIcons.Clapperboard className="w-10 h-10" />
             </div>
             <div>
               <h2 className={`font-black text-2xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{activePersona.label}</h2>
               <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>Theater Mode Active</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${isDark ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-amber-100 border-amber-200 text-amber-700'}`}>Concierge 2.0</span>
               </div>
             </div>
          </div>
          <button onClick={clearMessages} className={`p-4 rounded-full border transition-all hover:rotate-180 ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-white' : 'bg-black/5 border-black/5 text-black/40 hover:text-black'}`}>
            <LucideIcons.RefreshCw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ── Quick Filter Navigation ── */}
      <div className={`px-8 py-4 border-b flex items-center gap-4 overflow-x-auto no-scrollbar ${isDark ? 'border-white/5 bg-white/5' : 'border-black/5 bg-white shadow-sm'}`}>
         {[
           { icon: LucideIcons.Ticket, label: 'Showtimes', query: 'What are the current movie showtimes in Mumbai?' },
           { icon: LucideIcons.Tv, label: 'Streaming', query: 'What is trending on Netflix and Prime Video India right now?' },
           { icon: LucideIcons.Sparkles, label: 'Trivia', query: 'Tell me some mind-blowing movie trivia from cinema history.' },
           { icon: LucideIcons.Flame, label: 'Coming Soon', query: 'Which big movies are releasing in theaters this month?' },
           { icon: LucideIcons.Award, label: 'Award Winners', query: 'Recommend some Oscar-winning masterpieces across genres.' }
         ].map((item, i) => (
           <button 
             key={i} 
             onClick={() => sendMessage(item.query)}
             className={`flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${isDark ? 'bg-white/5 border-white/5 text-white/40 hover:bg-yellow-500/10 hover:border-yellow-500/30 hover:text-yellow-500' : 'bg-white border-black/5 text-black/40 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 shadow-sm'}`}
           >
             <item.icon className="w-3.5 h-3.5" />
             {item.label}
           </button>
         ))}
      </div>

      {/* ── Main Cinematic Gallery ── */}
      <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-gradient-to-b from-transparent to-black/20">
         <div className="max-w-4xl mx-auto space-y-12 pb-32">
            {messages.length === 0 ? (
              <div className="h-[40vh] flex flex-col items-center justify-center text-center">
                 <div className="relative mb-12">
                   <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 animate-pulse" />
                   <LucideIcons.Ghost className={`w-24 h-24 relative ${isDark ? 'text-white/10' : 'text-black/5'}`} />
                 </div>
                 <h3 className={`text-2xl font-black mb-4 uppercase tracking-tighter ${isDark ? 'text-white/30' : 'text-black/20'}`}>The Gallery is Empty</h3>
                 <p className={`max-w-xs text-sm font-medium italic ${isDark ? 'text-white/20' : 'text-black/20'}`}>"Cinema is a matter of what's in the frame and what's out." — Martin Scorsese</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                if (msg.role === 'user') return null;
                return (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative p-10 rounded-[48px] border shadow-2xl overflow-hidden group ${isDark ? 'bg-[#121214] border-white/5' : 'bg-white border-black/5'}`}
                  >
                     {/* Decorative Elements */}
                     <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-10 transition-opacity group-hover:opacity-20 bg-yellow-500`} />
                     <div className={`absolute top-10 left-10 text-[80px] font-black opacity-[0.03] select-none leading-none ${isDark ? 'text-white' : 'text-black'}`}>{String(i).padStart(2, '0')}</div>

                     <div className="relative z-10 prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                     </div>

                     {/* Live Activity */}
                     {isStreaming && i === messages.length - 1 && activity.length > 0 && (
                       <div className="mt-12 flex flex-wrap gap-3">
                          {activity.map((act, idx) => (
                            <div key={idx} className={`px-4 py-2 rounded-2xl border flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-pulse ${isDark ? 'bg-white/5 border-white/10 text-yellow-500' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                               {act.status === 'running' ? <LucideIcons.Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LucideIcons.Check className="w-3.5 h-3.5" />}
                               {act.tool.replace(/_/g, ' ')}
                            </div>
                          ))}
                       </div>
                     )}
                  </motion.div>
                );
              })
            )}
            <div ref={endRef} />
         </div>
      </div>

      {/* ── Floating Cinematic Search ── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
         <form onSubmit={handleSuggest} className="relative group">
            <div className={`absolute inset-0 blur-2xl opacity-40 transition-all group-focus-within:opacity-70 group-focus-within:scale-105 bg-yellow-500`} />
            <div className={`relative flex items-center rounded-[32px] border p-2 backdrop-blur-2xl transition-all ${isDark ? 'bg-black/60 border-white/10 focus-within:border-yellow-500/50' : 'bg-white/90 border-black/10 focus-within:border-amber-500/50 shadow-2xl'}`}>
               <div className="p-4">
                  <LucideIcons.Search className={`w-5 h-5 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
               </div>
               <input 
                  type="text"
                  value={mood}
                  onChange={e => setMood(e.target.value)}
                  placeholder="Tell me a mood, a movie, or a city for showtimes..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:text-opacity-30 placeholder:italic pr-4"
               />
               <button 
                  type="submit" 
                  disabled={isStreaming}
                  className={`p-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 ${isDark ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-black text-white hover:bg-amber-700'}`}
               >
                  {isStreaming ? <LucideIcons.Loader2 className="w-5 h-5 animate-spin" /> : <LucideIcons.ArrowUpRight className="w-5 h-5" />}
               </button>
            </div>
         </form>
      </div>

    </div>
  );
}
