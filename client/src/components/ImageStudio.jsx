import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export default function ImageStudio() {
  const { activePersona } = usePersonaStore();
  const [prompt, setPrompt] = useState('');
  const [enhance, setEnhance] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Studio specific UI states
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic');

  if (activePersona.id !== 'image') return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setImageUrl(null);
    setEnhancedPrompt('');

    try {
      // Append style and aspect ratio to prompt for better results if needed, 
      // or just pass them if the backend supports it. For now, let's keep the existing API call.
      const res = await fetch(`${API_URL}/api/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${prompt} --style ${selectedStyle} --ar ${aspectRatio}`, enhance }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setImageUrl(data.image);
      setEnhancedPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 bg-black/20">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl z-20 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400 shadow-[0_0_40px_rgba(236,72,153,0.2)] border border-pink-500/20">
            <LucideIcons.ImagePlus className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-black text-2xl tracking-tight text-white">{activePersona.label}</h2>
            <p className="text-xs text-pink-400 font-bold uppercase tracking-[0.2em] mt-1">Vision Studio • Generative Intelligence</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col xl:flex-row">
        {/* Canvas Area */}
        <div className="flex-1 p-12 bg-black/40 overflow-y-auto no-scrollbar flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            {!imageUrl && !isLoading ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="text-center"
              >
                <div className="w-48 h-48 mb-8 rounded-[64px] bg-white/5 flex items-center justify-center border border-white/5 mx-auto relative group">
                  <div className="absolute inset-0 bg-pink-500/10 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <LucideIcons.Sparkles className="w-20 h-20 text-pink-500/30 group-hover:text-pink-500 transition-colors duration-700" />
                </div>
                <h3 className="text-2xl font-black text-white/40 mb-2 tracking-tight">Your Canvas is Empty</h3>
                <p className="max-w-xs text-sm text-white/20 mx-auto">Describe your vision in the studio controls to bring it to life.</p>
              </motion.div>
            ) : isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="relative w-64 h-64 mx-auto mb-12">
                  <div className="absolute inset-0 border-4 border-pink-500/10 rounded-[48px]" />
                  <motion.div 
                    className="absolute inset-0 border-4 border-t-pink-500 rounded-[48px]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <LucideIcons.Cpu className="w-16 h-16 text-pink-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="font-black tracking-[0.4em] text-pink-500/50 text-xs animate-pulse uppercase">Rendering Latent Space...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="image"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group flex flex-col items-center"
              >
                <div className="absolute -inset-4 bg-pink-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                <img 
                  src={imageUrl} 
                  alt={enhancedPrompt || prompt} 
                  className={`max-h-[600px] w-auto rounded-[48px] shadow-2xl border-4 border-white/10 group-hover:border-pink-500/30 transition-all duration-700 object-contain`}
                />
                
                {enhance && enhancedPrompt && enhancedPrompt !== prompt && (
                  <div className="mt-6 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 max-w-lg text-center">
                    <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">✨ Enhanced Prompt</p>
                    <p className="text-xs text-white/60 leading-relaxed italic">"{enhancedPrompt}"</p>
                  </div>
                )}

                <div className="absolute bottom-8 right-8 flex gap-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <button className="p-4 bg-black/60 backdrop-blur-md hover:bg-pink-500 text-white rounded-2xl transition-all shadow-xl"><LucideIcons.Download className="w-5 h-5" /></button>
                  <button className="p-4 bg-black/60 backdrop-blur-md hover:bg-pink-500 text-white rounded-2xl transition-all shadow-xl"><LucideIcons.Share2 className="w-5 h-5" /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 backdrop-blur-md">
              <LucideIcons.AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        {/* Studio Controls */}
        <div className="w-full xl:w-[450px] border-l border-white/5 p-10 bg-black/20 overflow-y-auto no-scrollbar">
          <form onSubmit={handleGenerate} className="space-y-10">
            <div className="space-y-3">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Vision Description</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="A futuristic neon city with floating cars, cyberpunk style..."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 transition-all resize-none placeholder:text-white/20 font-medium"
              />
            </div>

            <div className="flex items-center justify-between px-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest">AI Prompt Magic</label>
              <button 
                type="button"
                onClick={() => setEnhance(!enhance)}
                className={`w-12 h-6 rounded-full relative transition-all ${enhance ? 'bg-pink-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${enhance ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-3">
                {['1:1', '16:9', '9:16'].map(ratio => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-4 rounded-2xl text-xs font-black transition-all border ${
                      aspectRatio === ratio 
                        ? 'bg-pink-500/20 border-pink-500/50 text-pink-400 shadow-lg' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Art Style</label>
              <div className="grid grid-cols-2 gap-3">
                {['Photorealistic', 'Anime', 'Digital Art', 'Oil Painting'].map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    className={`py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      selectedStyle === style 
                        ? 'bg-pink-500/20 border-pink-500/50 text-pink-400 shadow-lg' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-pink-500 hover:bg-pink-400 text-black font-black py-6 rounded-[32px] transition-all shadow-[0_20px_40px_rgba(236,72,153,0.3)] disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98]"
            >
              {isLoading ? <LucideIcons.Loader2 className="w-7 h-7 animate-spin" /> : <LucideIcons.Zap className="w-7 h-7" />}
              {isLoading ? 'GENERATING...' : 'RENDER VISION'}
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-white/5">
            <h4 className="text-xs font-black text-white/20 uppercase tracking-widest mb-6">Recent Creations</h4>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/5 hover:border-pink-500/30 transition-all cursor-pointer overflow-hidden group">
                  <div className="w-full h-full bg-gradient-to-br from-pink-500/5 to-purple-500/5 group-hover:scale-110 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
