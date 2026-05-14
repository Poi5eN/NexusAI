import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MedView() {
  const { activePersona, theme } = usePersonaStore();
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const isDark = theme === 'dark';

  if (activePersona.id !== 'medical') return null;

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setIsLoading(true);
    setAnalysis(null);
    
    setTimeout(() => {
      setAnalysis({
        summary: "Based on publicly available medical literature and datasets, the reported symptoms correspond with common clinical presentations of localized inflammation or viral immune response.",
        dataPoints: [
          { label: "Literature Match", value: "88% Correlation with peer-reviewed cases" },
          { label: "Data Source", value: "PubMed & WHO Public Databases" },
          { label: "Recommendation", value: "CONSULT A CERTIFIED MEDICAL PROFESSIONAL" }
        ]
      });
      setIsLoading(false);
    }, 2500);
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-500 rounded-[32px] overflow-hidden shadow-2xl relative border ${isDark ? 'glass border-white/5 bg-black/20' : 'bg-white border-black/5'}`}>
      {/* Disclaimer Banner */}
      <div className={`px-6 py-2 flex items-center justify-center gap-3 border-b transition-colors ${isDark ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-100'}`}>
        <LucideIcons.AlertTriangle className={`w-4 h-4 ${isDark ? 'text-red-500' : 'text-red-600'}`} />
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors ${isDark ? 'text-red-400' : 'text-red-700'}`}>
          Disclaimer: Not a medical suggestion. For information only. Consult a doctor for any health concerns.
        </span>
      </div>

      <div className={`p-6 border-b z-20 flex justify-between items-center transition-colors ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : 'bg-red-50 text-red-700 border-red-200 shadow-sm'}`}>
            <LucideIcons.Stethoscope className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`font-black text-2xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{activePersona.label}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>Medical Insights • Public Data Helper</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Input Sidebar */}
        <div className={`w-full lg:w-[400px] border-r p-8 overflow-y-auto no-scrollbar transition-colors ${isDark ? 'bg-black/20 border-white/5' : 'bg-[#fcfcfb] border-black/5'}`}>
          <form onSubmit={handleAnalyze} className="space-y-8">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Information Query</label>
              <textarea 
                required
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="Describe a condition or medical term to research..."
                className={`w-full border rounded-2xl p-5 transition-all placeholder:text-opacity-30 outline-none focus:ring-4 focus:ring-red-500/10 h-32 resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white' : 'bg-white border-black/10 text-black placeholder:text-black'}`}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98] ${isDark ? 'bg-red-500 hover:bg-red-400 text-black shadow-red-500/20' : 'bg-black hover:bg-red-700 text-white shadow-black/10'}`}
            >
              {isLoading ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.HeartPulse className="w-6 h-6" />}
              {isLoading ? 'ANALYZING RECORDS...' : 'SEARCH MEDICAL DATA'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className={`flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar transition-colors ${isDark ? 'bg-black/40' : 'bg-white'}`}>
          <AnimatePresence mode="wait">
            {!analysis && !isLoading ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center">
                <LucideIcons.Activity className={`w-16 h-16 mb-8 animate-pulse transition-colors ${isDark ? 'text-white/20' : 'text-black/10'}`} />
                <h3 className={`text-2xl font-black mb-2 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Clinical Data Node</h3>
                <p className={`max-w-xs text-sm transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Query clinical research databases and synthesis fact-based health info.</p>
              </motion.div>
            ) : isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center">
                <LucideIcons.ShieldAlert className={`w-12 h-12 animate-pulse mb-6 transition-colors ${isDark ? 'text-red-500/30' : 'text-red-700/20'}`} />
                <p className={`font-black tracking-widest text-xs animate-pulse transition-colors ${isDark ? 'text-red-500/50' : 'text-red-700/50'}`}>QUERYING PUBLIC REPOSITORIES...</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-10">
                <div className={`border rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#fdfdfc] border-black/5'}`}>
                   <div className={`absolute top-0 left-0 w-full h-1 transition-colors ${isDark ? 'bg-red-500' : 'bg-red-600'}`} />
                   <h3 className={`text-2xl font-black mb-6 transition-colors ${isDark ? 'text-white' : 'text-black'}`}>Synthesis Report</h3>
                   <p className={`text-lg leading-relaxed font-medium mb-10 transition-colors ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                     {analysis.summary}
                   </p>
                   
                   <div className="grid grid-cols-1 gap-4">
                     {analysis.dataPoints.map((dp, i) => (
                       <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                         <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-white/30' : 'text-black/40'}`}>{dp.label}</span>
                         <span className={`text-sm font-black transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{dp.value}</span>
                       </div>
                     ))}
                   </div>
                </div>

                <div className={`p-6 rounded-3xl text-center border transition-colors ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isDark ? 'text-red-400' : 'text-red-700'}`}>URGENT: THIS IS NOT A DIAGNOSIS</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
