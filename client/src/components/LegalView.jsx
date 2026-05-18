import { useState, useRef, useEffect } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStream } from '../hooks/useStream';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function LegalView() {
  const { activePersona, theme } = usePersonaStore();
  const { sendMessage, messages, isStreaming, activity, clearMessages } = useStream(activePersona.id);
  const [inquiry, setInquiry] = useState('');
  const endRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (activePersona.id !== 'legal') return null;

  const handleLegalCheck = async (e) => {
    e.preventDefault();
    if (!inquiry.trim() || isStreaming) return;
    
    const prompt = `Analyze this legal situation/concept under Indian Law, specifically referencing the Bhartiya Nyaya Samhita (BNS) where applicable:
    
    "${inquiry}"
    
    Please provide:
    1. PLAIN ENGLISH EXPLANATION
    2. TECHNICAL STATUTORY REFERENCE (BNS/IPC/CrPC/BNSS)
    3. RELEVANT PRECEDENTS (if any)
    4. DISCLAIMER (as per protocol)`;
    
    await sendMessage(prompt);
    setInquiry('');
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-500 rounded-[32px] overflow-hidden shadow-2xl relative border ${isDark ? 'glass border-white/5 bg-black/20 font-serif' : 'bg-white border-black/5 font-serif'}`}>
      {/* Disclaimer Banner */}
      <div className={`px-6 py-2 flex items-center justify-center gap-3 border-b transition-colors ${isDark ? 'bg-slate-900 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
        <LucideIcons.ShieldAlert className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Disclaimer: Not legal advice. Consult a certified advocate. Information is for educational purposes.
        </span>
      </div>

      <div className={`p-6 border-b z-20 flex justify-between items-center font-sans transition-colors ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${isDark ? 'bg-slate-500/10 text-slate-400 border-slate-500/20 shadow-[0_0_40px_rgba(148,163,184,0.2)]' : 'bg-slate-50 text-slate-700 border-slate-200 shadow-sm'}`}>
            <LucideIcons.Scale className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`font-black text-2xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{activePersona.label}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Indian Legal Intelligence • BNS 2024 Ready</p>
          </div>
        </div>
        <button onClick={clearMessages} className={`p-3 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-white' : 'bg-black/5 border-black/5 text-black/40 hover:text-black'}`}>
          <LucideIcons.RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row font-sans">
        {/* Input Sidebar */}
        <div className={`w-full lg:w-[400px] border-r p-8 overflow-y-auto no-scrollbar transition-colors ${isDark ? 'bg-black/20 border-white/5' : 'bg-[#fcfcfb] border-black/5'}`}>
          <form onSubmit={handleLegalCheck} className="space-y-8">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Legal Inquiry</label>
              <textarea 
                required
                value={inquiry}
                onChange={e => setInquiry(e.target.value)}
                placeholder="Describe a legal concept or situation (e.g., 'What are the bailable offenses under BNS Section 113?') ..."
                className={`w-full border rounded-2xl p-5 transition-all placeholder:text-opacity-30 outline-none focus:ring-4 focus:ring-slate-500/10 h-32 resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-white border-black/10 text-black placeholder:text-black/30'}`}
              />
            </div>
            <button 
              type="submit" 
              disabled={isStreaming}
              className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98] ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/50' : 'bg-black hover:bg-slate-800 text-white shadow-black/10'}`}
            >
              {isStreaming ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.FileSearch className="w-6 h-6" />}
              {isStreaming ? 'RESEARCHING...' : 'INITIATE ANALYSIS'}
            </button>

            {/* Quick References */}
            <div className="space-y-4 pt-8 border-t border-black/5 dark:border-white/5">
               <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-black/30'}`}>Statutory Reference</h4>
               <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'BNS 2024 Key Changes', query: 'What are the main changes in Bhartiya Nyaya Samhita (BNS) 2024 vs IPC?' },
                    { label: 'Bail Provisions (BNSS)', query: 'Explain the new bail provisions under Bhartiya Nagarik Suraksha Sanhita (BNSS).' },
                    { label: 'Consumer Rights India', query: 'What are the key rights under the Consumer Protection Act, 2019?' }
                  ].map((ref, idx) => (
                    <button key={idx} type="button" onClick={() => sendMessage(ref.query)} className={`text-left p-4 rounded-xl border text-[11px] font-bold transition-all ${isDark ? 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white' : 'bg-white border-black/5 text-black/40 hover:bg-slate-50 hover:text-slate-900'}`}>
                      {ref.label}
                    </button>
                  ))}
               </div>
            </div>
          </form>
        </div>

        {/* Results Area */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar font-serif transition-colors ${isDark ? 'bg-black/40' : 'bg-white'}`}>
           <div className="max-w-3xl mx-auto space-y-8 pb-20">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center font-sans mt-20">
                  <LucideIcons.Scale className={`w-16 h-16 mb-8 transition-colors ${isDark ? 'text-white/10' : 'text-black/5'}`} />
                  <h3 className={`text-2xl font-black mb-2 uppercase tracking-tighter transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Legal Intelligence Node</h3>
                  <p className={`max-w-xs text-sm transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Analyze legal concepts under the updated Indian Penal Framework.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isUser = msg.role === 'user';
                  if (isUser) return null; // We hide user messages to keep it clean like a "Report"
                  
                  return (
                    <div key={i} className={`border p-8 md:p-10 rounded-[40px] shadow-2xl relative transition-all duration-700 animate-in fade-in slide-in-from-bottom-4 ${isDark ? 'bg-[#0f172a] border-white/5' : 'bg-[#fdfdfc] border-black/5'}`}>
                       <div className={`absolute top-0 left-0 w-full h-1 transition-colors ${isDark ? 'bg-slate-500' : 'bg-slate-700'}`} />
                       <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                       </div>
                       
                       {/* Activity Chips during stream */}
                       {isStreaming && i === messages.length - 1 && activity.length > 0 && (
                         <div className="mt-8 flex flex-wrap gap-2">
                           {activity.map((act, idx) => (
                             <div key={idx} className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-black/5 border-black/5 text-black/40'}`}>
                                {act.status === 'running' ? <LucideIcons.Loader2 className="w-3 h-3 animate-spin" /> : <LucideIcons.Check className="w-3 h-3 text-emerald-500" />}
                                {act.tool.replace(/_/g, ' ')}
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
           </div>
        </div>
      </div>
    </div>
  );
}
