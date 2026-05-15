import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStream } from '../hooks/useStream';
import ReportCard from './research/ReportCard';

export default function ResearchView() {
  const { activePersona, theme } = usePersonaStore();
  const [query, setQuery] = useState('');
  const { sendMessage, messages, isStreaming, activity, clearMessages } = useStream(activePersona.id);
  const isDark = theme === 'dark';

  if (activePersona.id !== 'research') return null;

  // Find the last research report result
  const lastReportEvent = [...activity].reverse().find(a => a.tool === 'generate_research_report' && a.status === 'done');
  const structuredReport = lastReportEvent?.result ? JSON.parse(lastReportEvent.result) : null;

  // Find the last message to check for errors
  const lastMessage = messages[messages.length - 1];
  const hasError = lastMessage?.content?.startsWith('⚠️');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    clearMessages();
    const prompt = `Research the following topic in depth: "${query}". \n1. Start by breaking this into 3-5 research questions.\n2. Perform web searches for each question (parallel searches preferred).\n3. Synthesize the findings and use the 'generate_research_report' tool to produce the final analytical report.`;
    await sendMessage(prompt);
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-500 rounded-[32px] overflow-hidden shadow-2xl relative border ${isDark ? 'glass border-white/5 bg-black/20' : 'bg-white border-black/5'}`}>
      {/* Header */}
      <div className={`p-6 border-b z-20 flex justify-between items-center transition-colors ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.2)]' : 'bg-purple-50 text-purple-700 border-purple-100 shadow-sm'}`}>
            <LucideIcons.Search className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`font-black text-2xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{activePersona.label}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Research Studio • Web Scrape Intelligence</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Search Sidebar */}
        <div className={`w-full lg:w-[450px] border-r p-8 overflow-y-auto no-scrollbar transition-colors ${isDark ? 'bg-black/20 border-white/5' : 'bg-[#fcfcfb] border-black/5'}`}>
          <div className="mb-10">
            <h3 className={`text-sm font-black uppercase tracking-widest mb-3 transition-colors ${isDark ? 'text-white' : 'text-black'}`}>Research Objective</h3>
            <p className={`text-xs leading-relaxed font-medium transition-colors ${isDark ? 'text-white/40' : 'text-black/50'}`}>Define a complex topic. Our agents will perform a deep web crawl, synthesize data, and cite verified sources.</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative group">
              <LucideIcons.Search className="absolute left-4 top-5 w-5 h-5 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" />
              <textarea 
                required
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. Current state of solid state batteries 2026..."
                className={`w-full border rounded-3xl pt-5 pb-5 pl-12 pr-6 transition-all placeholder:text-opacity-30 outline-none focus:ring-4 focus:ring-purple-500/10 h-32 resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white' : 'bg-white border-black/10 text-black placeholder:text-black'}`}
              />
            </div>

            <button 
              type="submit" 
              disabled={isStreaming || !query.trim()}
              className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98] ${isDark ? 'bg-purple-500 hover:bg-purple-400 text-black shadow-purple-500/20' : 'bg-black hover:bg-purple-800 text-white shadow-black/10'}`}
            >
              {isStreaming ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.Terminal className="w-6 h-6" />}
              {isStreaming ? 'ANALYZING WEB...' : 'EXECUTE RESEARCH'}
            </button>
          </form>

          <div className="mt-12 space-y-4">
            <div className={`flex items-center gap-3 transition-colors ${isDark ? 'text-white/20' : 'text-black/30'}`}>
              <LucideIcons.Globe className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Tavily Engine Protocol</span>
            </div>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar relative transition-colors ${isDark ? 'bg-black/40' : 'bg-white'}`}>
          <AnimatePresence mode="wait">
            {hasError && !isStreaming ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`h-full flex flex-col items-center justify-center text-center p-8 rounded-[40px] border ${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-100'}`}
              >
                <div className={`w-20 h-20 mb-6 rounded-3xl flex items-center justify-center ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                  <LucideIcons.AlertCircle className="w-10 h-10" />
                </div>
                <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>Research Failed</h3>
                <p className={`max-w-md text-sm font-medium leading-relaxed ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  {lastMessage.content.replace('⚠️', '').trim()}
                </p>
                <button 
                  onClick={clearMessages}
                  className={`mt-8 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-black/5 hover:bg-black/10 text-black/60'}`}
                >
                  Reset Studio
                </button>
              </motion.div>
            ) : !structuredReport && !isStreaming ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <div className={`w-32 h-32 mb-8 rounded-[40px] flex items-center justify-center border transition-colors ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.02] border-black/5 shadow-inner'}`}>
                  <LucideIcons.Zap className={`w-16 h-16 animate-pulse transition-colors ${isDark ? 'text-white/20' : 'text-black/10'}`} />
                </div>
                <h3 className={`text-2xl font-black mb-2 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Awaiting Objective</h3>
                <p className={`max-w-xs text-sm transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Initiate a research task to generate a multi-sourced technical report.</p>
              </motion.div>
            ) : isStreaming && !structuredReport ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <div className="relative">
                  <LucideIcons.Loader2 className={`w-16 h-16 animate-spin opacity-20 ${isDark ? 'text-purple-500' : 'text-purple-600'}`} />
                  <LucideIcons.Globe className={`w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse ${isDark ? 'text-purple-500' : 'text-purple-600'}`} />
                </div>
                <div className={`mt-10 font-mono text-[10px] space-y-4 w-full max-w-sm transition-colors ${isDark ? 'text-purple-500/50' : 'text-purple-600/50'}`}>
                  {activity.map((a, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                      <LucideIcons.Search className={`w-4 h-4 ${a.status === 'running' ? 'animate-spin' : ''}`} />
                      <span className="truncate flex-1 text-left uppercase font-black tracking-widest">{a.tool.replace('_', ' ')}: {a.status}</span>
                      {a.status === 'done' && <LucideIcons.CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                  ))}
                  {activity.length === 0 && <p className="animate-pulse">&gt; INITIALIZING RESEARCH AGENTS...</p>}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-5xl mx-auto pb-20"
              >
                <ReportCard report={structuredReport} isDark={isDark} />
                
                {isStreaming && (
                  <div className="mt-8 flex items-center justify-center gap-4 animate-pulse">
                    <LucideIcons.Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                    <span className="text-xs font-black uppercase tracking-widest opacity-50">Synthesizing Final Report...</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
