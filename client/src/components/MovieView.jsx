import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MovieView() {
  const { activePersona, theme } = usePersonaStore();
  const [mood, setMood] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const isDark = theme === 'dark';

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
    <div className={`flex flex-col h-full transition-all duration-500 rounded-[32px] overflow-hidden shadow-2xl relative border ${isDark ? 'glass border-white/5 bg-black/20' : 'bg-white border-black/5'}`}>
      <div className={`p-6 border-b z-20 flex justify-between items-center transition-colors ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${isDark ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_40px_rgba(250,204,21,0.2)]' : 'bg-amber-50 text-amber-700 border-amber-100 shadow-sm'}`}>
            <LucideIcons.Film className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`font-black text-2xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{activePersona.label}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-yellow-400' : 'text-amber-600'}`}>Cinema Curator • Expert Movie Insights</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Input Sidebar */}
        <div className={`w-full lg:w-[400px] border-r p-8 overflow-y-auto no-scrollbar transition-colors ${isDark ? 'bg-black/20 border-white/5' : 'bg-[#fcfcfb] border-black/5'}`}>
          <form onSubmit={handleSuggest} className="space-y-8">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>What's the Mood?</label>
              <textarea 
                required
                value={mood}
                onChange={e => setMood(e.target.value)}
                placeholder="e.g. A mind-bending thriller for a rainy Friday night..."
                className={`w-full border rounded-2xl p-5 transition-all placeholder:text-opacity-30 outline-none focus:ring-4 focus:ring-amber-500/10 h-32 resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white' : 'bg-white border-black/10 text-black placeholder:text-black'}`}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98] ${isDark ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/20' : 'bg-black hover:bg-amber-700 text-white shadow-black/10'}`}
            >
              {isLoading ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.Clapperboard className="w-6 h-6" />}
              {isLoading ? 'CURATING PICKS...' : 'GET RECOMMENDATIONS'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className={`flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar transition-colors ${isDark ? 'bg-black/60' : 'bg-white'}`}>
          <AnimatePresence mode="wait">
            {!recommendations && !isLoading ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center">
                <div className={`w-32 h-32 mb-8 rounded-[40px] flex items-center justify-center border transition-colors ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.02] border-black/5 shadow-inner'}`}>
                  <LucideIcons.Ticket className={`w-16 h-16 transition-colors ${isDark ? 'text-white/20' : 'text-black/10'}`} />
                </div>
                <h3 className={`text-2xl font-black mb-2 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Theater Mode</h3>
                <p className={`max-w-xs text-sm transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Tell me your mood and I'll find the perfect cinematic experience.</p>
              </motion.div>
            ) : isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center">
                <LucideIcons.PlayCircle className={`w-12 h-12 animate-spin mb-6 transition-colors ${isDark ? 'text-yellow-500' : 'text-amber-600'}`} />
                <p className={`font-black tracking-widest text-xs transition-colors ${isDark ? 'text-yellow-500/50' : 'text-amber-600/50'}`}>SCANNING CINEMATIC HISTORY...</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
                <h3 className={`text-[10px] font-black uppercase tracking-widest ml-4 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Top Curated Selections</h3>
                <div className="grid grid-cols-1 gap-6">
                  {recommendations.list.map((m, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`border p-6 md:p-8 rounded-[32px] transition-all group flex flex-col md:flex-row gap-8 shadow-sm ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-[#fdfdfc] border-black/5 hover:border-black/10'}`}
                    >
                      <div className={`w-full md:w-32 h-48 rounded-2xl flex items-center justify-center border transition-all shrink-0 ${isDark ? 'bg-black/40 border-white/5 group-hover:border-yellow-500/30' : 'bg-black/5 border-black/5 group-hover:border-amber-500/30'}`}>
                         <LucideIcons.Video className={`w-10 h-10 transition-colors ${isDark ? 'text-white/10 group-hover:text-yellow-500' : 'text-black/10 group-hover:text-amber-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className={`text-2xl font-black mb-1 transition-colors ${isDark ? 'text-white group-hover:text-yellow-400' : 'text-black group-hover:text-amber-700'}`}>{m.title}</h4>
                            <span className={`text-[10px] font-black tracking-widest uppercase transition-colors ${isDark ? 'text-white/30' : 'text-black/30'}`}>{m.year} • {m.genre}</span>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${isDark ? 'bg-yellow-500/10' : 'bg-amber-100'}`}>
                            <LucideIcons.Star className={`w-4 h-4 transition-colors ${isDark ? 'text-yellow-500 fill-yellow-500' : 'text-amber-600 fill-amber-600'}`} />
                            <span className={`text-xs font-black transition-colors ${isDark ? 'text-yellow-500' : 'text-amber-700'}`}>{m.rating}</span>
                          </div>
                        </div>
                        <p className={`text-sm leading-relaxed font-medium mb-6 transition-colors ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                          {m.desc}
                        </p>
                        <div className="flex gap-4">
                          <button className={`text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-xl hover:scale-105 transition-all ${isDark ? 'bg-yellow-500 text-black' : 'bg-black text-white'}`}>Watch Trailer</button>
                          <button className={`text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-xl transition-all ${isDark ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}>Full Plot</button>
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
