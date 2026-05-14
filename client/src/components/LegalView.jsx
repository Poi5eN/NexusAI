import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LegalView() {
  const { activePersona } = usePersonaStore();
  const [inquiry, setInquiry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [legalAnalysis, setLegalAnalysis] = useState(null);

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
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 bg-black/20 font-serif">
      {/* Disclaimer Banner */}
      <div className="bg-slate-900 border-b border-white/10 px-6 py-2 flex items-center justify-center gap-3">
        <LucideIcons.ShieldAlert className="w-4 h-4 text-slate-400" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
          Disclaimer: Not legal advice. Consult a certified attorney. Information is for educational purposes only.
        </span>
      </div>

      <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl z-20 flex justify-between items-center font-sans">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-500/10 text-slate-400 shadow-[0_0_40px_rgba(148,163,184,0.2)] border border-slate-500/20">
            <LucideIcons.Scale className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-black text-2xl tracking-tight text-white">{activePersona.label}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Legal Assistant • Fact-Based Assistance</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row font-sans">
        <div className="w-full lg:w-[400px] border-r border-white/5 p-8 bg-black/20 overflow-y-auto no-scrollbar">
          <form onSubmit={handleLegalCheck} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Legal Inquiry</label>
              <textarea 
                required
                value={inquiry}
                onChange={e => setInquiry(e.target.value)}
                placeholder="Describe a legal concept or situation for factual research..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-slate-500/50 focus:ring-4 focus:ring-slate-500/10 transition-all placeholder:text-white/20 h-32 resize-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-black py-5 rounded-2xl transition-all shadow-[0_20px_40px_rgba(15,23,42,0.5)] disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98]"
            >
              {isLoading ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.FileText className="w-6 h-6" />}
              {isLoading ? 'ANALYZING RECORDS...' : 'PERFORM FACT CHECK'}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-black/40 no-scrollbar font-serif">
          <AnimatePresence mode="wait">
            {!legalAnalysis && !isLoading ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-white/20 text-center font-sans">
                <LucideIcons.Gavel className="w-16 h-16 mb-8 opacity-30" />
                <h3 className="text-2xl font-black text-white/40 mb-2 uppercase tracking-tighter">Legal Intelligence Node</h3>
                <p className="max-w-xs text-sm">Analyze legal concepts and retrieve relevant public documentation.</p>
              </motion.div>
            ) : isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center font-sans">
                <LucideIcons.FileSearch className="w-12 h-12 animate-pulse text-slate-500/30 mb-6" />
                <p className="font-black tracking-widest text-slate-500/50 text-xs">SEARCHING STATUTORY DATABASES...</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-12">
                <div className="bg-[#0f172a] border border-white/5 p-12 rounded-[40px] shadow-2xl relative group">
                   <div className="absolute top-0 left-0 w-full h-1 bg-slate-500" />
                   <h3 className="text-3xl font-black text-white mb-8 border-b border-white/5 pb-8">Research Synthesis</h3>
                   <div className="space-y-10">
                     <p className="text-white/70 text-lg leading-relaxed italic">
                       {legalAnalysis.summary}
                     </p>
                     
                     <div className="space-y-8">
                       {legalAnalysis.clauses.map((c, i) => (
                         <div key={i} className="border-l-4 border-slate-500 pl-8">
                           <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 font-sans">{c.title}</h4>
                           <p className="text-white/50 text-base leading-relaxed">{c.content}</p>
                         </div>
                       ))}
                     </div>
                   </div>
                   
                   <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between font-sans">
                     <div className="flex items-center gap-3 text-slate-500">
                       <LucideIcons.Lock className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Confidential Synthesis</span>
                     </div>
                     <button className="text-[10px] font-black tracking-widest uppercase bg-white/5 text-white/40 px-6 py-3 rounded-2xl hover:bg-white/10 transition-all">Download Report</button>
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
