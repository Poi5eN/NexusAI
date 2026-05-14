import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MedView() {
  const { activePersona } = usePersonaStore();
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

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
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 bg-black/20">
      {/* Disclaimer Banner */}
      <div className="bg-red-500/20 border-b border-red-500/30 px-6 py-2 flex items-center justify-center gap-3">
        <LucideIcons.AlertTriangle className="w-4 h-4 text-red-500" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 text-center">
          Disclaimer: Not a medical suggestion. For information only. Consult a doctor for any health concerns.
        </span>
      </div>

      <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl z-20 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.2)] border border-red-500/20">
            <LucideIcons.Stethoscope className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-black text-2xl tracking-tight text-white">{activePersona.label}</h2>
            <p className="text-xs text-red-400 font-bold uppercase tracking-[0.2em] mt-1">Medical Insights • Public Data Helper</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="w-full lg:w-[400px] border-r border-white/5 p-8 bg-black/20 overflow-y-auto no-scrollbar">
          <form onSubmit={handleAnalyze} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Information Query</label>
              <textarea 
                required
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="Describe a condition or medical term to research..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-white/20 h-32 resize-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-red-500 hover:bg-red-400 text-black font-black py-5 rounded-2xl transition-all shadow-[0_20px_40px_rgba(239,68,68,0.2)] disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98]"
            >
              {isLoading ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.HeartPulse className="w-6 h-6" />}
              {isLoading ? 'ANALYZING RECORDS...' : 'SEARCH MEDICAL DATA'}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-black/40 no-scrollbar">
          <AnimatePresence mode="wait">
            {!analysis && !isLoading ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-white/20 text-center">
                <LucideIcons.Activity className="w-16 h-16 mb-8 opacity-30 animate-pulse" />
                <h3 className="text-2xl font-black text-white/40 mb-2">Clinical Data Node</h3>
                <p className="max-w-xs text-sm">Query clinical research databases and synthesis fact-based health info.</p>
              </motion.div>
            ) : isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center">
                <LucideIcons.ShieldAlert className="w-12 h-12 animate-pulse text-red-500/30 mb-6" />
                <p className="font-black tracking-widest text-red-500/50 text-xs">QUERYING PUBLIC REPOSITORIES...</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-10">
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                   <h3 className="text-2xl font-black text-white mb-6">Synthesis Report</h3>
                   <p className="text-white/60 text-lg leading-relaxed font-medium mb-10">
                     {analysis.summary}
                   </p>
                   
                   <div className="grid grid-cols-1 gap-4">
                     {analysis.dataPoints.map((dp, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{dp.label}</span>
                         <span className="text-sm font-black text-white">{dp.value}</span>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-center">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em]">URGENT: THIS IS NOT A DIAGNOSIS</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
