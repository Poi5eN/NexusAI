import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LegalView() {
  const { activePersona, theme } = usePersonaStore();
  const [inquiry, setInquiry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [legalAnalysis, setLegalAnalysis] = useState(null);
  const isDark = theme === 'dark';

  if (activePersona.id !== 'legal') return null;

  const handleLegalCheck = (e) => {
    e.preventDefault();
    if (!inquiry.trim()) return;
    setIsLoading(true);
    setLegalAnalysis(null);
    
    setTimeout(() => {
      setLegalAnalysis({
        summary: "Based on general legal principles and public records, the following information relates to your inquiry regarding common statutes and documented precedents.",
        clauses: [
          { title: "Statutory Basis", content: "General statutes governing this area typically require documented intent and verifiable action." },
          { title: "Precedent Note", content: "Similar cases in many jurisdictions emphasize the importance of disclosure and fair-use principles." },
          { title: "Fact Note", content: "Public records indicate that regulatory bodies have recently updated their guidelines for this sector." }
        ]
      });
      setIsLoading(false);
    }, 2500);
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-500 rounded-[32px] overflow-hidden shadow-2xl relative border ${isDark ? 'glass border-white/5 bg-black/20 font-serif' : 'bg-white border-black/5 font-serif'}`}>
      {/* Disclaimer Banner */}
      <div className={`px-6 py-2 flex items-center justify-center gap-3 border-b transition-colors ${isDark ? 'bg-slate-900 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
        <LucideIcons.ShieldAlert className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Disclaimer: Not legal advice. Consult a certified attorney. Information is for educational purposes only.
        </span>
      </div>

      <div className={`p-6 border-b z-20 flex justify-between items-center font-sans transition-colors ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${isDark ? 'bg-slate-500/10 text-slate-400 border-slate-500/20 shadow-[0_0_40px_rgba(148,163,184,0.2)]' : 'bg-slate-50 text-slate-700 border-slate-200 shadow-sm'}`}>
            <LucideIcons.Scale className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`font-black text-2xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{activePersona.label}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Legal Assistant • Fact-Based Assistance</p>
          </div>
        </div>
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
                placeholder="Describe a legal concept or situation for factual research..."
                className={`w-full border rounded-2xl p-5 transition-all placeholder:text-opacity-30 outline-none focus:ring-4 focus:ring-slate-500/10 h-32 resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white' : 'bg-white border-black/10 text-black placeholder:text-black'}`}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98] ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/50' : 'bg-black hover:bg-slate-800 text-white shadow-black/10'}`}
            >
              {isLoading ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.FileText className="w-6 h-6" />}
              {isLoading ? 'ANALYZING RECORDS...' : 'PERFORM FACT CHECK'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className={`flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar font-serif transition-colors ${isDark ? 'bg-black/40' : 'bg-white'}`}>
          <AnimatePresence mode="wait">
            {!legalAnalysis && !isLoading ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center font-sans">
                <LucideIcons.Gavel className={`w-16 h-16 mb-8 transition-colors ${isDark ? 'text-white/20' : 'text-black/10'}`} />
                <h3 className={`text-2xl font-black mb-2 uppercase tracking-tighter transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Legal Intelligence Node</h3>
                <p className={`max-w-xs text-sm transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Analyze legal concepts and retrieve relevant public documentation.</p>
              </motion.div>
            ) : isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center font-sans">
                <LucideIcons.FileSearch className={`w-12 h-12 animate-pulse mb-6 transition-colors ${isDark ? 'text-slate-500/30' : 'text-slate-700/20'}`} />
                <p className={`font-black tracking-widest text-xs animate-pulse transition-colors ${isDark ? 'text-slate-500/50' : 'text-slate-700/50'}`}>SEARCHING STATUTORY DATABASES...</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-12">
                <div className={`border p-8 md:p-12 rounded-[40px] shadow-2xl relative group transition-all duration-700 ${isDark ? 'bg-[#0f172a] border-white/5' : 'bg-[#fdfdfc] border-black/5'}`}>
                   <div className={`absolute top-0 left-0 w-full h-1 transition-colors ${isDark ? 'bg-slate-500' : 'bg-slate-700'}`} />
                   <h3 className={`text-3xl font-black mb-8 border-b pb-8 transition-colors ${isDark ? 'text-white border-white/5' : 'text-black border-black/5'}`}>Research Synthesis</h3>
                   <div className="space-y-10">
                     <p className={`text-lg leading-relaxed italic transition-colors ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                       {legalAnalysis.summary}
                     </p>
                     
                     <div className="space-y-8">
                       {legalAnalysis.clauses.map((c, i) => (
                         <div key={i} className={`border-l-4 pl-8 transition-colors ${isDark ? 'border-slate-500' : 'border-slate-700'}`}>
                           <h4 className={`text-[10px] font-black uppercase tracking-widest mb-2 font-sans transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{c.title}</h4>
                           <p className={`text-base leading-relaxed transition-colors ${isDark ? 'text-white/50' : 'text-black/60'}`}>{c.content}</p>
                         </div>
                       ))}
                     </div>
                   </div>
                   
                   <div className={`mt-16 pt-8 border-t flex items-center justify-between font-sans transition-colors ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                     <div className={`flex items-center gap-3 transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                       <LucideIcons.Lock className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Confidential Synthesis</span>
                     </div>
                     <button className={`text-[10px] font-black tracking-widest uppercase px-6 py-3 rounded-2xl transition-all ${isDark ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}>Download Report</button>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
