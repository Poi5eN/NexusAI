import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoyageView() {
  const { activePersona, theme } = usePersonaStore();
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [vibe, setVibe] = useState('Adventure');
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const isDark = theme === 'dark';

  if (activePersona.id !== 'travel') return null;

  const handleGenerate = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setItinerary(null);
    
    setTimeout(() => {
      setItinerary({
        destination,
        days: [
          { day: 1, title: "Arrival & City Exploration", description: "Settle in, grab a coffee, and wander around the downtown area to get your bearings.", icon: "MapPin" },
          { day: 2, title: "Nature & Adventure", description: "Head out early for a scenic hike and outdoor activities at the nearby national park.", icon: "Trees" },
          { day: 3, title: "Culture & Cuisine", description: "Visit local museums and enjoy a fantastic culinary tour in the evening featuring authentic street food.", icon: "Utensils" }
        ]
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-500 rounded-[32px] overflow-hidden shadow-2xl relative border ${isDark ? 'glass border-white/5 bg-black/20' : 'bg-white border-black/5'}`}>
      {/* Header */}
      <div className={`p-6 border-b z-20 flex justify-between items-center transition-colors ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-colors ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'} border`}>
            <LucideIcons.Plane className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`font-black text-2xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{activePersona.label}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Voyage Architect • Itinerary Intelligence</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Input Sidebar */}
        <div className={`w-full lg:w-[400px] border-r p-8 overflow-y-auto no-scrollbar transition-colors ${isDark ? 'bg-black/20 border-white/5' : 'bg-[#fcfcfb] border-black/5'}`}>
          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>The Destination</label>
              <div className="relative group">
                <LucideIcons.Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="Where to? (e.g. Paris, France)"
                  className={`w-full border rounded-2xl py-4 pl-12 pr-4 transition-all placeholder:text-opacity-30 outline-none focus:ring-4 focus:ring-emerald-500/10 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white' : 'bg-white border-black/10 text-black placeholder:text-black'}`}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Trip Duration</label>
              <div className="relative group">
                <LucideIcons.Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={dates}
                  onChange={e => setDates(e.target.value)}
                  placeholder="How many days?"
                  className={`w-full border rounded-2xl py-4 pl-12 pr-4 transition-all placeholder:text-opacity-30 outline-none focus:ring-4 focus:ring-emerald-500/10 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white' : 'bg-white border-black/10 text-black placeholder:text-black'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Trip Vibe</label>
              <div className="grid grid-cols-2 gap-3">
                {['Adventure', 'Relaxing', 'Culture', 'Foodie'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVibe(v)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                      vibe === v 
                        ? (isDark ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-emerald-600 text-white border-emerald-600') 
                        : (isDark ? 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10' : 'bg-white border-black/10 text-black/40 hover:bg-black/5')
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98] ${isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20' : 'bg-black hover:bg-emerald-700 text-white shadow-black/10'}`}
            >
              {isLoading ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.Sparkles className="w-6 h-6" />}
              {isLoading ? 'ARCHITECTING...' : 'GENERATE ITINERARY'}
            </button>
          </form>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar transition-colors ${isDark ? 'bg-black/40' : 'bg-white'}`}>
          <AnimatePresence mode="wait">
            {!itinerary && !isLoading ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <div className={`w-32 h-32 mb-8 rounded-[40px] flex items-center justify-center border transition-colors ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.02] border-black/5 shadow-inner'}`}>
                  <LucideIcons.Compass className={`w-16 h-16 animate-[spin_10s_linear_infinite] transition-colors ${isDark ? 'text-white/20' : 'text-black/10'}`} />
                </div>
                <h3 className={`text-2xl font-black mb-2 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Ready for Takeoff?</h3>
                <p className={`max-w-xs text-sm transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Tell me your destination and let's build the perfect journey together.</p>
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
                  <LucideIcons.Loader2 className={`w-16 h-16 animate-spin opacity-20 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`} />
                  <LucideIcons.Plane className={`w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`} />
                </div>
                <p className={`mt-8 font-black tracking-[0.3em] text-xs animate-pulse ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/50'}`}>OPTIMIZING TRAVEL ROUTES...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto space-y-12"
              >
                <div className={`flex flex-col md:flex-row md:items-end justify-between border-b pb-8 transition-colors ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                  <div>
                    <span className={`font-black text-[10px] tracking-[0.2em] uppercase ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>Adventure in</span>
                    <h3 className={`text-4xl md:text-5xl font-black mt-2 transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{itinerary.destination}</h3>
                  </div>
                  <div className="md:text-right mt-4 md:mt-0">
                    <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Duration</p>
                    <p className={`text-2xl font-black transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{dates}</p>
                  </div>
                </div>

                <div className="space-y-8 relative">
                  {/* Timeline vertical line */}
                  <div className={`absolute left-[31px] top-0 bottom-0 w-px transition-colors ${isDark ? 'bg-gradient-to-b from-emerald-500/50 via-emerald-500/10 to-transparent' : 'bg-emerald-100'}`} />
                  
                  {itinerary.days.map((day, i) => {
                    const DayIcon = LucideIcons[day.icon] || LucideIcons.Activity;
                    return (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative pl-20 group"
                      >
                        <div className={`absolute left-0 top-0 w-16 h-16 rounded-2xl border flex items-center justify-center z-10 transition-all duration-500 shadow-xl ${isDark ? 'bg-black border-white/10 group-hover:border-emerald-500/50' : 'bg-white border-black/5 group-hover:border-emerald-500'}`}>
                          <span className={`text-[8px] font-black absolute -top-4 left-0 transition-colors ${isDark ? 'text-white/30' : 'text-black/20'}`}>DAY {day.day}</span>
                          <DayIcon className={`w-8 h-8 transition-transform duration-500 group-hover:scale-110 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`} />
                        </div>
                        
                        <div className={`border p-6 md:p-8 rounded-[32px] transition-all duration-500 group-hover:-translate-y-1 shadow-2xl ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10' : 'bg-[#fdfdfc] border-black/5 hover:border-black/10'}`}>
                          <h4 className={`text-lg md:text-xl font-black mb-3 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{day.title}</h4>
                          <p className={`text-sm leading-relaxed font-medium transition-colors ${isDark ? 'text-white/50' : 'text-black/50'}`}>{day.description}</p>
                          
                          <div className="mt-6 flex gap-4">
                            <button className={`text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg transition-all ${isDark ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100'}`}>Details</button>
                            <button className={`text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg transition-all ${isDark ? 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white' : 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black'}`}>Map View</button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
