import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResearchView() {
  const { activePersona, theme } = usePersonaStore();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const isDark = theme === 'dark';

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
            <p className={`text-xs leading-relaxed font-medium transition-colors ${isDark ? 'text-white/40' : 'text-black/40'}`}>Define a complex topic. Our agents will perform a deep web crawl, synthesize data, and cite verified sources.</p>
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
              disabled={isLoading || !query.trim()}
              className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98] ${isDark ? 'bg-purple-500 hover:bg-purple-400 text-black shadow-purple-500/20' : 'bg-black hover:bg-purple-800 text-white shadow-black/10'}`}
            >
              {isLoading ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.Terminal className="w-6 h-6" />}
              {isLoading ? 'ANALYZING WEB...' : 'EXECUTE RESEARCH'}
            </button>
          </form>

          <div className="mt-12 space-y-4">
            <div className={`flex items-center gap-3 transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>
              <LucideIcons.Globe className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Tavily Engine Protocol</span>
            </div>
          </div>
        </div>

        {/* Report Area */}
        <div className={`flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar relative transition-colors ${isDark ? 'bg-black/40' : 'bg-white'}`}>
          <AnimatePresence mode="wait">
            {!report && !isLoading ? (
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
            ) : isLoading ? (
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
                <div className={`mt-10 font-mono text-[10px] space-y-2 text-center transition-colors ${isDark ? 'text-purple-500/50' : 'text-purple-600/50'}`}>
                  <p className="animate-pulse">&gt; CRAWLING WEB NODES...</p>
                  <p className="animate-pulse delay-75">&gt; SYNTHESIZING DATA POINTS...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-5xl mx-auto space-y-12"
              >
                <div className={`border rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#fdfdfc] border-black/5'}`}>
                   <div className={`absolute top-0 left-0 w-full h-1 transition-colors ${isDark ? 'bg-purple-500' : 'bg-purple-700'}`} />
                   <h1 className={`text-3xl md:text-4xl font-black mb-10 tracking-tight leading-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{report.title}</h1>
                   
                   <div className={`prose max-w-none transition-colors ${isDark ? 'prose-invert prose-purple text-white/80' : 'prose-slate text-black/70'}`}>
                     <p className="text-lg leading-relaxed font-medium whitespace-pre-wrap">
                       {report.summary}
                     </p>
                   </div>
                </div>

                <div className="space-y-6">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ml-4 flex items-center gap-3 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>
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
                        className={`border p-6 rounded-3xl transition-all group flex items-start justify-between gap-4 shadow-sm ${isDark ? 'bg-black/40 border-white/5 hover:bg-white/5 hover:border-purple-500/50' : 'bg-white border-black/5 hover:border-purple-500 hover:shadow-md'}`}
                      >
                        <div>
                          <span className={`text-[8px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-3 inline-block ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>{source.type}</span>
                          <h4 className={`text-sm font-black mb-2 transition-colors ${isDark ? 'text-white group-hover:text-purple-400' : 'text-black group-hover:text-purple-600'}`}>{source.title}</h4>
                          <p className={`text-[8px] truncate max-w-[200px] font-mono transition-colors ${isDark ? 'text-white/30' : 'text-black/30'}`}>{source.url}</p>
                        </div>
                        <LucideIcons.ExternalLink className={`w-4 h-4 transition-colors mt-1 ${isDark ? 'text-white/10 group-hover:text-purple-500' : 'text-black/10 group-hover:text-purple-600'}`} />
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
