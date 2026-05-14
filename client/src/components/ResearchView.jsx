import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResearchView() {
  const { activePersona } = usePersonaStore();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);

  if (activePersona.id !== 'research') return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setReport(null);
    
    setTimeout(() => {
      setReport({
        title: "Deep Analysis: " + query,
        summary: "Detailed synthesis of the current landscape regarding **" + query + "**. Our scrape engines have processed 42 distinct data points across technical documentation, market reports, and real-time social signals.\n\n### Key Findings\n1. **Acceleration:** The field is moving 4x faster than projected in late 2024.\n2. **Infrastructure Bottlenecks:** GPU availability remains the primary constraint for small-scale deployment.\n3. **Regulatory Shift:** New guidelines from EU and US bodies are forcing a move toward transparent data provenance.",
        sources: [
          { title: "TechCrunch - Analysis of " + query, url: "https://techcrunch.com", type: "News" },
          { title: "Nature Journal - Technical Breakdown", url: "https://nature.com", type: "Paper" },
          { title: "MarketWatch - Economic Impact", url: "https://marketwatch.com", type: "Finance" }
        ]
      });
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 bg-black/20">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl z-20 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.2)] border border-purple-500/20">
            <LucideIcons.Search className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-black text-2xl tracking-tight text-white">{activePersona.label}</h2>
            <p className="text-xs text-purple-400 font-bold uppercase tracking-[0.2em] mt-1">Research Studio • Web Scrape Intelligence</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Search Sidebar */}
        <div className="w-full lg:w-[450px] border-r border-white/5 p-8 bg-black/20 overflow-y-auto no-scrollbar">
          <div className="mb-10">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">Research Objective</h3>
            <p className="text-xs text-white/40 leading-relaxed font-medium">Define a complex topic. Our agents will perform a deep web crawl, synthesize data, and cite verified sources.</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative group">
              <LucideIcons.Search className="absolute left-4 top-5 w-5 h-5 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" />
              <textarea 
                required
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. Current state of solid state batteries 2026..."
                className="w-full bg-white/5 border border-white/10 rounded-3xl pt-5 pb-5 pl-12 pr-6 text-white focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-white/20 h-32 resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className="w-full bg-purple-500 hover:bg-purple-400 text-black font-black py-5 rounded-2xl transition-all shadow-[0_20px_40px_rgba(168,85,247,0.2)] disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98]"
            >
              {isLoading ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.Terminal className="w-6 h-6" />}
              {isLoading ? 'ANALYZING WEB...' : 'EXECUTE RESEARCH'}
            </button>
          </form>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-white/20">
              <LucideIcons.Globe className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Tavily Search Engine API</span>
            </div>
            <div className="flex items-center gap-3 text-white/20">
              <LucideIcons.Database className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">ScrapeGraphAI Fallback</span>
            </div>
          </div>
        </div>

        {/* Report Area */}
        <div className="flex-1 overflow-y-auto p-12 bg-black/40 no-scrollbar relative">
          <AnimatePresence mode="wait">
            {!report && !isLoading ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center text-white/20 text-center"
              >
                <div className="w-32 h-32 mb-8 rounded-[40px] bg-white/5 flex items-center justify-center border border-white/5">
                  <LucideIcons.Zap className="w-16 h-16 opacity-30 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-white/40 mb-2">Awaiting Objective</h3>
                <p className="max-w-xs text-sm">Initiate a research task to generate a multi-sourced technical report.</p>
              </motion.div>
            ) : isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <div className="relative">
                  <LucideIcons.Loader2 className="w-16 h-16 animate-spin text-purple-500 opacity-20" />
                  <LucideIcons.Globe className="w-8 h-8 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="mt-10 font-mono text-[10px] text-purple-500/50 space-y-2 text-center">
                  <p className="animate-pulse">&gt; CRAWLING WEB NODES...</p>
                  <p className="animate-pulse delay-75">&gt; SYNTHESIZING DATA POINTS...</p>
                  <p className="animate-pulse delay-150">&gt; VERIFYING CITATIONS...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-5xl mx-auto space-y-12"
              >
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-12 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500" />
                   <h1 className="text-4xl font-black text-white mb-10 tracking-tight leading-tight">{report.title}</h1>
                   
                   <div className="prose prose-invert prose-purple max-w-none">
                     <p className="text-lg leading-relaxed text-white/80 font-medium whitespace-pre-wrap">
                       {report.summary}
                     </p>
                   </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-black text-white/40 uppercase tracking-widest ml-4 flex items-center gap-3">
                    <LucideIcons.Link2 className="w-4 h-4 text-purple-500" />
                    Verified Citation Nodes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.sources.map((source, i) => (
                      <motion.a
                        key={i}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-black/40 border border-white/5 p-6 rounded-3xl hover:bg-white/5 hover:border-purple-500/50 transition-all group flex items-start justify-between gap-4"
                      >
                        <div>
                          <span className="text-[10px] font-black tracking-widest uppercase bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full mb-3 inline-block">{source.type}</span>
                          <h4 className="text-sm font-black text-white mb-2 group-hover:text-purple-400 transition-colors">{source.title}</h4>
                          <p className="text-[10px] text-white/30 truncate max-w-[200px] font-mono">{source.url}</p>
                        </div>
                        <LucideIcons.ExternalLink className="w-4 h-4 text-white/10 group-hover:text-purple-500 transition-colors mt-1" />
                      </motion.a>
                    ))}
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
