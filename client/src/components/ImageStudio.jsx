import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export default function ImageStudio() {
  const { activePersona, theme } = usePersonaStore();
  const [prompt, setPrompt] = useState('');
  const [enhance, setEnhance] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isDark = theme === 'dark';
  
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
    <div className={`flex flex-col h-full transition-all duration-500 rounded-[32px] overflow-hidden shadow-2xl relative border ${isDark ? 'glass border-white/5 bg-black/20' : 'bg-white border-black/5'}`}>
      {/* Header */}
      <div className={`p-6 border-b z-20 flex justify-between items-center transition-colors ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${isDark ? 'bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_40px_rgba(236,72,153,0.2)]' : 'bg-pink-50 text-pink-700 border-pink-200 shadow-sm'}`}>
            <LucideIcons.ImagePlus className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`font-black text-2xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{activePersona.label}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>Vision Studio • Generative Intelligence</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col xl:flex-row">
        {/* Canvas Area */}
        <div className={`flex-1 p-8 md:p-12 overflow-y-auto no-scrollbar flex items-center justify-center relative transition-colors ${isDark ? 'bg-black/40' : 'bg-white'}`}>
          <AnimatePresence mode="wait">
            {!imageUrl && !isLoading ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="text-center"
              >
                <div className={`w-48 h-48 mb-8 rounded-[64px] flex items-center justify-center border mx-auto relative group transition-colors ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.02] border-black/5 shadow-inner'}`}>
                  <div className={`absolute inset-0 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ${isDark ? 'bg-pink-500/10' : 'bg-pink-500/5'}`} />
                  <LucideIcons.Sparkles className={`w-20 h-20 transition-colors duration-700 ${isDark ? 'text-pink-500/30 group-hover:text-pink-500' : 'text-pink-600/20 group-hover:text-pink-500'}`} />
                </div>
                <h3 className={`text-2xl font-black mb-2 tracking-tight transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Your Canvas is Empty</h3>
                <p className={`max-w-xs text-sm mx-auto transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Describe your vision in the studio controls to bring it to life.</p>
              </motion.div>
            ) : isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-12">
                  <div className={`absolute inset-0 border-4 rounded-[48px] ${isDark ? 'border-pink-500/10' : 'border-pink-500/5'}`} />
                  <motion.div 
                    className="absolute inset-0 border-4 border-t-pink-500 rounded-[48px]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <LucideIcons.Cpu className="w-16 h-16 text-pink-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className={`font-black tracking-[0.4em] text-xs animate-pulse uppercase transition-colors ${isDark ? 'text-pink-500/50' : 'text-pink-600/50'}`}>Rendering Latent Space...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="image"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group flex flex-col items-center"
              >
                <div className={`absolute -inset-4 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-pink-500/20' : 'bg-pink-500/10'}`} />
                <img 
                  src={imageUrl} 
                  alt={enhancedPrompt || prompt} 
                  className={`max-h-[600px] w-auto rounded-[48px] shadow-2xl border-4 transition-all duration-700 object-contain ${isDark ? 'border-white/10 group-hover:border-pink-500/30' : 'border-black/5 group-hover:border-pink-500'}`}
                />
                
                {enhance && enhancedPrompt && enhancedPrompt !== prompt && (
                  <div className={`mt-6 p-4 rounded-2xl border max-w-lg text-center backdrop-blur-md transition-colors ${isDark ? 'bg-black/40 border-white/5' : 'bg-white/80 border-black/5 shadow-lg'}`}>
                    <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">✨ Enhanced Prompt</p>
                    <p className={`text-xs leading-relaxed italic transition-colors ${isDark ? 'text-white/60' : 'text-black/60'}`}>"{enhancedPrompt}"</p>
                  </div>
                )}

                <div className="absolute bottom-8 right-8 flex gap-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <button className={`p-4 backdrop-blur-md hover:bg-pink-500 text-white rounded-2xl transition-all shadow-xl ${isDark ? 'bg-black/60' : 'bg-black/80'}`}><LucideIcons.Download className="w-5 h-5" /></button>
                  <button className={`p-4 backdrop-blur-md hover:bg-pink-500 text-white rounded-2xl transition-all shadow-xl ${isDark ? 'bg-black/60' : 'bg-black/80'}`}><LucideIcons.Share2 className="w-5 h-5" /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-red-500 border border-red-500/50 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 backdrop-blur-md shadow-xl">
              <LucideIcons.AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        {/* Studio Controls */}
        <div className={`w-full xl:w-[450px] border-l p-10 overflow-y-auto no-scrollbar transition-colors ${isDark ? 'bg-black/20 border-white/5' : 'bg-[#fcfcfb] border-black/5'}`}>
          <form onSubmit={handleGenerate} className="space-y-10">
            <div className="space-y-3">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Vision Description</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="A futuristic neon city with floating cars, cyberpunk style..."
                className={`w-full h-40 border rounded-3xl p-6 text-sm transition-all resize-none font-medium placeholder:text-opacity-30 outline-none focus:ring-4 focus:ring-pink-500/10 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white' : 'bg-white border-black/10 text-black placeholder:text-black'}`}
              />
            </div>

            <div className="flex items-center justify-between px-2">
              <label className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>AI Prompt Magic</label>
              <button 
                type="button"
                onClick={() => setEnhance(!enhance)}
                className={`w-12 h-6 rounded-full relative transition-all ${enhance ? 'bg-pink-500' : (isDark ? 'bg-white/10' : 'bg-black/10')}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${enhance ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-3">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-3">
                {['1:1', '16:9', '9:16'].map(ratio => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-4 rounded-2xl text-[10px] font-black transition-all border ${
                      aspectRatio === ratio 
                        ? (isDark ? 'bg-pink-500/20 border-pink-500/50 text-pink-400 shadow-lg' : 'bg-pink-600 text-white border-pink-600 shadow-lg') 
                        : (isDark ? 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10' : 'bg-white border-black/10 text-black/40 hover:bg-black/5')
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Art Style</label>
              <div className="grid grid-cols-2 gap-3">
                {['Photorealistic', 'Anime', 'Digital Art', 'Oil Painting'].map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    className={`py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      selectedStyle === style 
                        ? (isDark ? 'bg-pink-500/20 border-pink-500/50 text-pink-400 shadow-lg' : 'bg-pink-600 text-white border-pink-600 shadow-lg') 
                        : (isDark ? 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10' : 'bg-white border-black/10 text-black/40 hover:bg-black/5')
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
              className={`w-full font-black py-6 rounded-[32px] transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98] ${isDark ? 'bg-pink-500 hover:bg-pink-400 text-black shadow-pink-500/20' : 'bg-black hover:bg-pink-700 text-white shadow-black/10'}`}
            >
              {isLoading ? <LucideIcons.Loader2 className="w-7 h-7 animate-spin" /> : <LucideIcons.Zap className="w-7 h-7" />}
              {isLoading ? 'GENERATING...' : 'RENDER VISION'}
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-black/5">
            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-6 transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Recent Creations</h4>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`aspect-square rounded-2xl border cursor-pointer overflow-hidden group transition-all ${isDark ? 'bg-white/5 border-white/5 hover:border-pink-500/30' : 'bg-black/5 border-black/5 hover:border-pink-500 shadow-sm'}`}>
                  <div className={`w-full h-full group-hover:scale-110 transition-transform duration-700 ${isDark ? 'bg-gradient-to-br from-pink-500/5 to-purple-500/5' : 'bg-gradient-to-br from-pink-500/10 to-purple-500/10'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
