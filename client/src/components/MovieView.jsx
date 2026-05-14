import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MovieView() {
  const { activePersona } = usePersonaStore();
  const [mood, setMood] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  if (activePersona.id !== 'movies') return null;

  const handleSuggest = (e) => {
    e.preventDefault();
    if (!mood.trim()) return;
    setIsLoading(true);
    setRecommendations(null);
    
    setTimeout(() => {
      setRecommendations({
        mood: mood,
        list: [
          { title: "The Dark Knight", year: 2008, genre: "Action/Crime", rating: 9.0, desc: "A definitive masterpiece of cinema that fits your request for intense, grounded thrillers." },
          { title: "Inception", year: 2010, genre: "Sci-Fi/Action", rating: 8.8, desc: "Complex storytelling and visual spectacle that matches your interest in deep concepts." },
          { title: "Se7en", year: 1995, genre: "Crime/Mystery", rating: 8.6, desc: "A dark, atmospheric noir that aligns with the tone you described." }
        ]
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 bg-black/20">
      <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl z-20 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.2)] border border-yellow-500/20">
            <LucideIcons.Film className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-black text-2xl tracking-tight text-white">{activePersona.label}</h2>
            <p className="text-xs text-yellow-400 font-bold uppercase tracking-[0.2em] mt-1">Cinema Curator • Expert Movie Insights</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="w-full lg:w-[400px] border-r border-white/5 p-8 bg-black/20 overflow-y-auto no-scrollbar">
          <form onSubmit={handleSuggest} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">What's the Mood?</label>
              <textarea 
                required
                value={mood}
                onChange={e => setMood(e.target.value)}
                placeholder="e.g. A mind-bending thriller for a rainy Friday night..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder:text-white/20 h-32 resize-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-5 rounded-2xl transition-all shadow-[0_20px_40px_rgba(250,204,21,0.2)] disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98]"
            >
              {isLoading ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.Clapperboard className="w-6 h-6" />}
              {isLoading ? 'CURATING PICKS...' : 'GET RECOMMENDATIONS'}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-black/60 no-scrollbar">
          <AnimatePresence mode="wait">
            {!recommendations && !isLoading ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-white/20 text-center">
                <LucideIcons.Ticket className="w-16 h-16 mb-8 opacity-30" />
                <h3 className="text-2xl font-black text-white/40 mb-2">Theater Mode</h3>
                <p className="max-w-xs text-sm">Tell me your mood and I'll find the perfect cinematic experience.</p>
              </motion.div>
            ) : isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center">
                <LucideIcons.PlayCircle className="w-12 h-12 animate-spin text-yellow-500 mb-6" />
                <p className="font-black tracking-widest text-yellow-500/50 text-xs">SCANNING CINEMATIC HISTORY...</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
                <h3 className="text-sm font-black text-white/40 uppercase tracking-widest ml-4">Top Curated Selections</h3>
                <div className="grid grid-cols-1 gap-6">
                  {recommendations.list.map((m, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/5 border border-white/5 p-8 rounded-[32px] hover:bg-white/10 transition-all group flex flex-col md:flex-row gap-8"
                    >
                      <div className="w-full md:w-32 h-48 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-yellow-500/30 transition-all shrink-0">
                         <LucideIcons.Video className="w-10 h-10 text-white/10 group-hover:text-yellow-500 transition-colors" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-2xl font-black text-white mb-1 group-hover:text-yellow-400 transition-colors">{m.title}</h4>
                            <span className="text-[10px] font-black tracking-widest uppercase text-white/30">{m.year} • {m.genre}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-full">
                            <LucideIcons.Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-black text-yellow-500">{m.rating}</span>
                          </div>
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed font-medium mb-6">
                          {m.desc}
                        </p>
                        <div className="flex gap-4">
                          <button className="text-[10px] font-black tracking-widest uppercase bg-yellow-500 text-black px-4 py-2 rounded-xl hover:scale-105 transition-all">Watch Trailer</button>
                          <button className="text-[10px] font-black tracking-widest uppercase bg-white/5 text-white/40 px-4 py-2 rounded-xl hover:bg-white/10 transition-all">Full Plot</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
