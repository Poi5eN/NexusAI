import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoyageView() {
  const { activePersona } = usePersonaStore();
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [vibe, setVibe] = useState('Adventure');
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);

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
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 bg-black/20">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl z-20 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)] border border-emerald-500/20">
            <LucideIcons.Plane className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-black text-2xl tracking-tight text-white">{activePersona.label}</h2>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-[0.2em] mt-1">Voyage Architect • Itinerary Intelligence</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Input Sidebar */}
        <div className="w-full lg:w-[400px] border-r border-white/5 p-8 bg-black/20 overflow-y-auto no-scrollbar">
          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">The Destination</label>
              <div className="relative group">
                <LucideIcons.Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="Where to? (e.g. Paris, France)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-white/20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Trip Duration</label>
              <div className="relative group">
                <LucideIcons.Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={dates}
                  onChange={e => setDates(e.target.value)}
                  placeholder="How many days?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Trip Vibe</label>
              <div className="grid grid-cols-2 gap-3">
                {['Adventure', 'Relaxing', 'Culture', 'Foodie'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVibe(v)}
                    className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                      vibe === v 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60'
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
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-5 rounded-2xl transition-all shadow-[0_20px_40px_rgba(16,185,129,0.2)] disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98]"
            >
              {isLoading ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.Sparkles className="w-6 h-6" />}
              {isLoading ? 'ARCHITECTING...' : 'GENERATE ITINERARY'}
            </button>
          </form>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-12 bg-black/40 no-scrollbar">
          <AnimatePresence mode="wait">
            {!itinerary && !isLoading ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center text-white/20 text-center"
              >
                <div className="w-32 h-32 mb-8 rounded-[40px] bg-white/5 flex items-center justify-center border border-white/5">
                  <LucideIcons.Compass className="w-16 h-16 opacity-30 animate-[spin_10s_linear_infinite]" />
                </div>
                <h3 className="text-2xl font-black text-white/40 mb-2">Ready for Takeoff?</h3>
                <p className="max-w-xs text-sm">Tell me your destination and let's build the perfect journey together.</p>
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
                  <LucideIcons.Loader2 className="w-16 h-16 animate-spin text-emerald-500 opacity-20" />
                  <LucideIcons.Plane className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="mt-8 font-black tracking-[0.3em] text-emerald-500/50 text-xs animate-pulse">OPTIMIZING TRAVEL ROUTES...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto space-y-12"
              >
                <div className="flex items-end justify-between border-b border-white/5 pb-8">
                  <div>
                    <span className="text-emerald-500 font-black text-xs tracking-[0.2em] uppercase">Adventure in</span>
                    <h3 className="text-5xl font-black text-white mt-2">{itinerary.destination}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Duration</p>
                    <p className="text-2xl font-black text-white">{dates}</p>
                  </div>
                </div>

                <div className="space-y-8 relative">
                  {/* Timeline vertical line */}
                  <div className="absolute left-[31px] top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/10 to-transparent" />
                  
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
                        <div className="absolute left-0 top-0 w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center z-10 group-hover:border-emerald-500/50 transition-all duration-500 shadow-xl">
                          <span className="text-xs font-black text-white/30 absolute -top-4 left-0">DAY {day.day}</span>
                          <DayIcon className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        
                        <div className="bg-white/5 border border-white/5 p-8 rounded-[32px] hover:bg-white/[0.08] hover:border-white/10 transition-all duration-500 group-hover:-translate-y-1 shadow-2xl">
                          <h4 className="text-xl font-black text-white mb-3 tracking-tight">{day.title}</h4>
                          <p className="text-white/50 text-sm leading-relaxed font-medium">{day.description}</p>
                          
                          <div className="mt-6 flex gap-4">
                            <button className="text-[10px] font-black tracking-widest uppercase bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-black transition-all">Details</button>
                            <button className="text-[10px] font-black tracking-widest uppercase bg-white/5 text-white/40 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-all">Map View</button>
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
