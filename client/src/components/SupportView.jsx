import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportView() {
  const { activePersona } = usePersonaStore();
  const [docContent, setDocContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [ticketQuery, setTicketQuery] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolution, setResolution] = useState(null);
  const [activeTab, setActiveTab] = useState('resolution'); // 'resolution' or 'kb'

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
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 bg-black/20">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.2)] border border-amber-500/20">
            <LucideIcons.Headset className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-black text-2xl tracking-tight text-white">{activePersona.label}</h2>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-[0.2em] mt-1">Resolution Center • RAG Intelligence</p>
          </div>
        </div>

        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('resolution')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'resolution' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/40 hover:text-white/60'}`}
          >
            Resolution
          </button>
          <button 
            onClick={() => setActiveTab('kb')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'kb' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/40 hover:text-white/60'}`}
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
              <div className="w-full lg:w-[450px] border-r border-white/5 p-8 bg-black/20 overflow-y-auto no-scrollbar">
                <div className="mb-8">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Customer Query</h3>
                  <p className="text-xs text-white/40 leading-relaxed font-medium">Paste the customer's question here. The agent will retrieve relevant context from the Knowledge Base to draft a precise response.</p>
                </div>
                
                <form onSubmit={handleResolve} className="space-y-6">
                  <div className="relative group">
                    <textarea
                      value={ticketQuery}
                      onChange={(e) => setTicketQuery(e.target.value)}
                      placeholder="e.g. How do I reset my password?"
                      disabled={isResolving}
                      className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none placeholder:text-white/20 font-medium"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isResolving || !ticketQuery.trim()}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-5 rounded-2xl transition-all shadow-[0_20px_40px_rgba(245,158,11,0.2)] disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {isResolving ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.Zap className="w-6 h-6" />}
                    {isResolving ? 'SEARCHING KB...' : 'DRAFT RESOLUTION'}
                  </button>
                </form>
              </div>

              <div className="flex-1 p-12 bg-black/40 overflow-y-auto no-scrollbar">
                {!resolution && !isResolving ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/20 text-center">
                    <div className="w-32 h-32 mb-8 rounded-[40px] bg-white/5 flex items-center justify-center border border-white/5">
                      <LucideIcons.MessageSquare className="w-16 h-16 opacity-30" />
                    </div>
                    <h3 className="text-2xl font-black text-white/40 mb-2">Awaiting Query</h3>
                    <p className="max-w-xs text-sm">Input a customer ticket to generate an AI-powered resolution based on your data.</p>
                  </div>
                ) : isResolving ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <LucideIcons.Search className="w-16 h-16 animate-pulse text-amber-500/20 mb-8" />
                    <div className="space-y-3 w-full max-w-md">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-4 bg-white/5 rounded-full w-full animate-pulse overflow-hidden">
                          <div className="h-full bg-amber-500/20 w-1/3 animate-[shimmer_2s_infinite]" />
                        </div>
                      ))}
                    </div>
                    <p className="mt-8 font-black tracking-[0.3em] text-amber-500/50 text-xs">QUERYING VECTOR DATABASE...</p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-3xl mx-auto"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
                      <div className="flex justify-between items-center mb-10">
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase bg-amber-500/20 text-amber-500 px-4 py-1.5 rounded-full">AI Suggested Draft</span>
                        <div className="flex gap-3">
                          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><LucideIcons.Copy className="w-4 h-4 text-white/60" /></button>
                          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><LucideIcons.RefreshCcw className="w-4 h-4 text-white/60" /></button>
                        </div>
                      </div>
                      <div className="whitespace-pre-wrap text-white/80 text-lg leading-relaxed font-medium selection:bg-amber-500/30">
                        {resolution}
                      </div>
                      <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-[10px] font-bold text-white/40">S{i}</div>
                          ))}
                          <span className="ml-6 text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center">Context Sources</span>
                        </div>
                        <button className="bg-white/5 hover:bg-white/10 text-white/60 font-black px-6 py-3 rounded-2xl text-[10px] tracking-widest uppercase transition-all">Send Resolution</button>
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
              className="h-full flex items-center justify-center p-12"
            >
              <div className="w-full max-w-3xl bg-black/40 border border-white/10 rounded-[40px] p-12 shadow-2xl">
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <LucideIcons.Database className="w-10 h-10 text-amber-500" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2">Ingest Data</h3>
                  <p className="text-white/40 font-medium">Add text, FAQs, or raw documentation to the agent's memory.</p>
                </div>
                
                <form onSubmit={handleUpload} className="space-y-8">
                  <textarea
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    placeholder="Paste documentation content here..."
                    disabled={isUploading}
                    className="w-full h-64 bg-white/5 border border-white/10 rounded-[32px] p-8 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none font-medium placeholder:text-white/20"
                  />
                  <button 
                    type="submit"
                    disabled={isUploading || !docContent.trim()}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-5 rounded-2xl transition-all shadow-[0_20px_40px_rgba(245,158,11,0.2)] disabled:opacity-50 flex items-center justify-center gap-3"
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
