import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';

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
    // Placeholder for actual ScrapeGraphAI backend search & report generation
    setTimeout(() => {
      setReport({
        title: "Analysis: " + query,
        summary: "Based on the latest data scraped from the web, the topic of " + query + " shows significant growth in the AI sector. Key players are investing heavily in specific infrastructure...",
        sources: [
          { title: "TechCrunch - Latest " + query + " News", url: "https://techcrunch.com" },
          { title: "Bloomberg Analytics on " + query, url: "https://bloomberg.com" },
          { title: "GitHub Repositories related to " + query, url: "https://github.com" }
        ]
      });
      setIsLoading(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden shadow-2xl relative">
      <div className="p-5 border-b border-white/5 bg-black/40 backdrop-blur-md z-10 sticky top-0 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-purple-500/20 text-purple-500 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <LucideIcons.Search className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-extrabold text-xl tracking-tight">{activePersona.label}</h2>
            <p className="text-xs text-white/50 uppercase tracking-widest mt-0.5">{activePersona.description}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center">
        {/* Search Bar - Center if no report, Top if report exists */}
        <div className={`w-full max-w-3xl transition-all duration-700 ease-in-out ${!report && !isLoading ? 'mt-32' : 'mt-0 mb-8'}`}>
          {!report && !isLoading && (
            <div className="text-center mb-8">
              <LucideIcons.Globe className="w-16 h-16 mx-auto mb-6 text-purple-500 opacity-80" />
              <h1 className="text-3xl font-bold mb-2">Deep Web Research</h1>
              <p className="text-white/50">Enter a topic. I will scrape the web and compile a cited report.</p>
            </div>
          )}
          
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LucideIcons.Search className="h-5 w-5 text-purple-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. Current state of solid state batteries 2026..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-32 text-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-xl disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute inset-y-2 right-2 bg-purple-500 hover:bg-purple-400 text-black font-bold px-6 rounded-xl transition-all disabled:opacity-50"
            >
              Analyze
            </button>
          </form>
        </div>

        {/* Results Area */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-purple-500 w-full animate-in fade-in">
            <LucideIcons.Terminal className="w-12 h-12 mb-4 animate-pulse" />
            <div className="font-mono text-sm space-y-2 text-center">
              <p>&gt; Initializing ScrapeGraphAI...</p>
              <p>&gt; Fetching Tavily search results...</p>
              <p>&gt; Compiling sources...</p>
            </div>
          </div>
        )}

        {report && !isLoading && (
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Main Report */}
            <div className="md:col-span-2 bg-black/40 border border-white/5 rounded-3xl p-8 shadow-xl">
              <h2 className="text-3xl font-extrabold mb-6 text-white">{report.title}</h2>
              <div className="prose prose-invert prose-purple max-w-none">
                <p className="text-lg leading-relaxed text-white/80">{report.summary}</p>
                {/* This would be ReactMarkdown in the real implementation */}
                <p className="text-white/60 mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              </div>
            </div>

            {/* Sidebar / Sources */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                <LucideIcons.Link2 className="w-4 h-4" />
                Verified Sources
              </h3>
              <div className="flex flex-col gap-3">
                {report.sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 hover:border-purple-500/50 transition-all group"
                  >
                    <div className="font-medium text-sm text-white/90 group-hover:text-purple-400 transition-colors mb-1 truncate">{source.title}</div>
                    <div className="text-xs text-white/40 truncate">{source.url}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
