import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportView() {
  const { activePersona, theme } = usePersonaStore();
  const [docContent, setDocContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [ticketQuery, setTicketQuery] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolution, setResolution] = useState(null);
  const [activeTab, setActiveTab] = useState('resolution'); // 'resolution' or 'kb'
  const isDark = theme === 'dark';

  if (activePersona.id !== 'support') return null;

  const handleUpload = (e) => {
    e.preventDefault();
    if (!docContent.trim()) return;
    setIsUploading(true);
    setTimeout(() => {
      setDocContent('');
      setIsUploading(false);
    }, 1500);
  };

  const handleResolve = (e) => {
    e.preventDefault();
    if (!ticketQuery.trim()) return;
    setIsResolving(true);
    setResolution(null);
    setTimeout(() => {
      setResolution(
        "Hello!\n\nBased on our documentation, you can reset your password by navigating to Settings > Security > Reset Password. Let me know if you need further assistance!\n\nBest,\nNexus Support Team"
      );
      setIsResolving(false);
    }, 2000);
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-500 rounded-[32px] overflow-hidden shadow-2xl relative border ${isDark ? 'glass border-white/5 bg-black/20' : 'bg-white border-black/5'}`}>
      {/* Header */}
      <div className={`p-6 border-b z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.2)]' : 'bg-amber-50 text-amber-700 border-amber-100 shadow-sm'}`}>
            <LucideIcons.Headset className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`font-black text-2xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{activePersona.label}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Resolution Center • RAG Intelligence</p>
          </div>
        </div>

        <div className={`flex p-1.5 rounded-2xl border transition-colors ${isDark ? 'bg-black/40 border-white/5' : 'bg-black/5 border-black/5'}`}>
          <button 
            onClick={() => setActiveTab('resolution')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === 'resolution' ? (isDark ? 'bg-amber-500 text-black shadow-lg' : 'bg-black text-white shadow-lg') : (isDark ? 'text-white/40 hover:text-white/60' : 'text-black/40 hover:text-black/60')}`}
          >
            Resolution
          </button>
          <button 
            onClick={() => setActiveTab('kb')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === 'kb' ? (isDark ? 'bg-amber-500 text-black shadow-lg' : 'bg-black text-white shadow-lg') : (isDark ? 'text-white/40 hover:text-white/60' : 'text-black/40 hover:text-black/60')}`}
          >
            Knowledge Base
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'resolution' ? (
            <motion.div 
              key="resolution"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col lg:flex-row"
            >
              <div className={`w-full lg:w-[450px] border-r p-8 overflow-y-auto no-scrollbar transition-colors ${isDark ? 'bg-black/20 border-white/5' : 'bg-[#fcfcfb] border-black/5'}`}>
                <div className="mb-8">
                  <h3 className={`text-sm font-black uppercase tracking-widest mb-2 transition-colors ${isDark ? 'text-white' : 'text-black'}`}>Customer Query</h3>
                  <p className={`text-xs leading-relaxed font-medium transition-colors ${isDark ? 'text-white/40' : 'text-black/40'}`}>Paste the customer's question here. The agent will retrieve relevant context from the Knowledge Base to draft a precise response.</p>
                </div>
                
                <form onSubmit={handleResolve} className="space-y-6">
                  <div className="relative group">
                    <textarea
                      value={ticketQuery}
                      onChange={(e) => setTicketQuery(e.target.value)}
                      placeholder="e.g. How do I reset my password?"
                      disabled={isResolving}
                      className={`w-full h-40 border rounded-3xl p-6 text-sm transition-all resize-none font-medium placeholder:text-opacity-30 outline-none focus:ring-4 focus:ring-amber-500/10 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white' : 'bg-white border-black/10 text-black placeholder:text-black'}`}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isResolving || !ticketQuery.trim()}
                    className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98] ${isDark ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20' : 'bg-black hover:bg-amber-700 text-white shadow-black/10'}`}
                  >
                    {isResolving ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.Zap className="w-6 h-6" />}
                    {isResolving ? 'SEARCHING KB...' : 'DRAFT RESOLUTION'}
                  </button>
                </form>
              </div>

              <div className={`flex-1 p-8 md:p-12 overflow-y-auto no-scrollbar transition-colors ${isDark ? 'bg-black/40' : 'bg-white'}`}>
                {!resolution && !isResolving ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className={`w-32 h-32 mb-8 rounded-[40px] flex items-center justify-center border transition-colors ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.02] border-black/5 shadow-inner'}`}>
                      <LucideIcons.MessageSquare className={`w-16 h-16 transition-colors ${isDark ? 'text-white/30' : 'text-black/10'}`} />
                    </div>
                    <h3 className={`text-2xl font-black mb-2 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Awaiting Query</h3>
                    <p className={`max-w-xs text-sm transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Input a customer ticket to generate an AI-powered resolution based on your data.</p>
                  </div>
                ) : isResolving ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <LucideIcons.Search className={`w-16 h-16 animate-pulse mb-8 ${isDark ? 'text-amber-500/20' : 'text-amber-600/20'}`} />
                    <div className="space-y-3 w-full max-w-md">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-4 rounded-full w-full animate-pulse overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                          <div className={`h-full w-1/3 animate-[shimmer_2s_infinite] ${isDark ? 'bg-amber-500/20' : 'bg-amber-600/20'}`} />
                        </div>
                      ))}
                    </div>
                    <p className={`mt-8 font-black tracking-[0.3em] text-xs transition-colors ${isDark ? 'text-amber-500/50' : 'text-amber-600/50'}`}>QUERYING VECTOR DATABASE...</p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-3xl mx-auto"
                  >
                    <div className={`border rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden group transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#fdfdfc] border-black/5'}`}>
                      <div className={`absolute top-0 left-0 w-full h-1 transition-colors ${isDark ? 'bg-amber-500' : 'bg-amber-600'}`} />
                      <div className="flex justify-between items-center mb-10">
                        <span className={`text-[10px] font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full transition-colors ${isDark ? 'bg-amber-500/20 text-amber-500' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>AI Suggested Draft</span>
                        <div className="flex gap-3">
                          <button className={`p-3 rounded-xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}><LucideIcons.Copy className={`w-4 h-4 transition-colors ${isDark ? 'text-white/60' : 'text-black/60'}`} /></button>
                          <button className={`p-3 rounded-xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}><LucideIcons.RefreshCcw className={`w-4 h-4 transition-colors ${isDark ? 'text-white/60' : 'text-black/60'}`} /></button>
                        </div>
                      </div>
                      <div className={`whitespace-pre-wrap text-lg leading-relaxed font-medium transition-colors ${isDark ? 'text-white/80 selection:bg-amber-500/30' : 'text-black/70 selection:bg-amber-100'}`}>
                        {resolution}
                      </div>
                      <div className={`mt-12 pt-8 border-t flex justify-between items-center transition-colors ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${isDark ? 'bg-white/10 border-black text-white/40' : 'bg-black/5 border-white text-black/40'}`}>S{i}</div>
                          ))}
                          <span className={`ml-6 text-[10px] font-black uppercase tracking-widest flex items-center transition-colors ${isDark ? 'text-white/40' : 'text-black/40'}`}>Context Sources</span>
                        </div>
                        <button className={`font-black px-6 py-3 rounded-2xl text-[10px] tracking-widest uppercase transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-black text-white hover:bg-amber-700'}`}>Send Resolution</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="kb"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`h-full flex items-center justify-center p-8 transition-colors ${isDark ? '' : 'bg-white'}`}
            >
              <div className={`w-full max-w-3xl border rounded-[40px] p-8 md:p-12 shadow-2xl transition-all duration-700 ${isDark ? 'bg-black/40 border-white/10' : 'bg-[#fdfdfc] border-black/5'}`}>
                <div className="text-center mb-10">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-colors ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                    <LucideIcons.Database className={`w-10 h-10 ${isDark ? 'text-amber-500' : 'text-amber-600'}`} />
                  </div>
                  <h3 className={`text-3xl font-black mb-2 transition-colors ${isDark ? 'text-white' : 'text-black'}`}>Ingest Data</h3>
                  <p className={`font-medium transition-colors ${isDark ? 'text-white/40' : 'text-black/40'}`}>Add text, FAQs, or raw documentation to the agent's memory.</p>
                </div>
                
                <form onSubmit={handleUpload} className="space-y-8">
                  <textarea
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    placeholder="Paste documentation content here..."
                    disabled={isUploading}
                    className={`w-full h-64 border rounded-[32px] p-8 text-sm transition-all resize-none font-medium placeholder:text-opacity-30 outline-none focus:ring-4 focus:ring-amber-500/10 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white' : 'bg-white border-black/10 text-black placeholder:text-black'}`}
                  />
                  <button 
                    type="submit"
                    disabled={isUploading || !docContent.trim()}
                    className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 ${isDark ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20' : 'bg-black hover:bg-amber-700 text-white shadow-black/10'}`}
                  >
                    {isUploading ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.UploadCloud className="w-6 h-6" />}
                    {isUploading ? 'EMBEDDING DOCUMENTS...' : 'UPDATE KNOWLEDGE BASE'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
