import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';

export default function SupportView() {
  const { activePersona } = usePersonaStore();
  const [docContent, setDocContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [ticketQuery, setTicketQuery] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolution, setResolution] = useState(null);

  if (activePersona.id !== 'support') return null;

  const handleUpload = (e) => {
    e.preventDefault();
    if (!docContent.trim()) return;
    setIsUploading(true);
    // Placeholder for Supabase vector embedding upload
    setTimeout(() => {
      setDocContent('');
      setIsUploading(false);
      alert('Knowledge base updated successfully!');
    }, 1500);
  };

  const handleResolve = (e) => {
    e.preventDefault();
    if (!ticketQuery.trim()) return;
    setIsResolving(true);
    // Placeholder for RAG query
    setTimeout(() => {
      setResolution(
        "Hello!\n\nBased on our documentation, you can reset your password by navigating to Settings > Security > Reset Password. Let me know if you need further assistance!\n\nBest,\nNexus Support"
      );
      setIsResolving(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden shadow-2xl relative">
      <div className="p-5 border-b border-white/5 bg-black/40 backdrop-blur-md z-10 sticky top-0 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <LucideIcons.Headset className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-extrabold text-xl tracking-tight">{activePersona.label}</h2>
            <p className="text-xs text-white/50 uppercase tracking-widest mt-0.5">{activePersona.description}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Column - Knowledge Base Management */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <LucideIcons.Database className="w-5 h-5 text-amber-500" />
              Knowledge Base
            </h3>
            <p className="text-sm text-white/50 mb-6">Upload documents or FAQs. These will be vectorized and stored in Supabase for RAG.</p>
            
            <form onSubmit={handleUpload}>
              <textarea
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="Paste FAQ or document content here..."
                disabled={isUploading}
                className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none mb-4 disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={isUploading || !docContent.trim()}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full"
              >
                {isUploading ? <LucideIcons.Loader2 className="w-4 h-4 animate-spin" /> : <LucideIcons.UploadCloud className="w-4 h-4" />}
                {isUploading ? 'Embedding...' : 'Add to Vector DB'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Resolution Center */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-black/30 border border-white/5 rounded-3xl p-6 flex-1 flex flex-col">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <LucideIcons.MessageSquare className="w-5 h-5 text-amber-500" />
              Resolution Center
            </h3>
            <p className="text-sm text-white/50 mb-6">Paste a customer query here. The agent will retrieve docs and draft a response.</p>
            
            <form onSubmit={handleResolve} className="mb-6">
              <textarea
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                placeholder="e.g. 'How do I reset my password?'"
                disabled={isResolving}
                className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none mb-4 disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={isResolving || !ticketQuery.trim()}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full border border-white/10"
              >
                {isResolving ? <LucideIcons.Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <LucideIcons.Bot className="w-4 h-4 text-amber-500" />}
                {isResolving ? 'Retrieving context...' : 'Draft Response'}
              </button>
            </form>

            <div className="flex-1 bg-black/50 border border-white/5 rounded-2xl p-6 relative overflow-y-auto">
              {resolution ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <span className="absolute top-4 right-4 text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Draft</span>
                  <div className="whitespace-pre-wrap text-white/80 text-sm leading-relaxed mt-4">
                    {resolution}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/20">
                  <LucideIcons.FileText className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">Response draft will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
