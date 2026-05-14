import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';

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
    // Placeholder for actual API call that will return structured JSON
    setTimeout(() => {
      setItinerary({
        destination,
        days: [
          { day: 1, title: "Arrival & City Exploration", description: "Settle in, grab a coffee, and wander around the downtown area to get your bearings." },
          { day: 2, title: "Nature & Adventure", description: "Head out early for a scenic hike and outdoor activities." },
          { day: 3, title: "Culture & Cuisine", description: "Visit local museums and enjoy a fantastic culinary tour in the evening." }
        ]
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden shadow-2xl relative">
      <div className="p-5 border-b border-white/5 bg-black/40 backdrop-blur-md z-10 sticky top-0 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <LucideIcons.Map className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-extrabold text-xl tracking-tight">{activePersona.label}</h2>
            <p className="text-xs text-white/50 uppercase tracking-widest mt-0.5">{activePersona.description}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex gap-8">
        {/* Input Form */}
        <div className="w-[350px] shrink-0">
          <form onSubmit={handleGenerate} className="bg-black/30 border border-white/5 p-6 rounded-3xl space-y-5 sticky top-0">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Destination</label>
              <input 
                type="text" 
                required
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="e.g. Kyoto, Japan"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Dates / Duration</label>
              <input 
                type="text" 
                required
                value={dates}
                onChange={e => setDates(e.target.value)}
                placeholder="e.g. 3 Days"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Trip Vibe</label>
              <select 
                value={vibe}
                onChange={e => setVibe(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none appearance-none"
              >
                <option value="Adventure">Adventure & Outdoors</option>
                <option value="Relaxing">Relaxing & Spa</option>
                <option value="Culture">Culture & History</option>
                <option value="Foodie">Food & Culinary</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isLoading ? <LucideIcons.Loader2 className="w-5 h-5 animate-spin" /> : <LucideIcons.Sparkles className="w-5 h-5" />}
              {isLoading ? 'Architecting...' : 'Build Itinerary'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="flex-1">
          {!itinerary && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-white/30 border-2 border-dashed border-white/5 rounded-3xl">
              <LucideIcons.Compass className="w-16 h-16 mb-4 opacity-50" />
              <p>Where are we going?</p>
            </div>
          ) : isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-emerald-500">
              <LucideIcons.Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="animate-pulse font-medium">Analyzing destinations and drafting timeline...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-3xl font-extrabold text-white">Your Trip to {itinerary.destination}</h3>
              <div className="grid gap-4">
                {itinerary.days.map((day, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex gap-6 hover:bg-white/10 transition-colors cursor-default group">
                    <div className="flex flex-col items-center justify-center bg-emerald-500/10 text-emerald-500 w-16 h-16 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-xs font-bold uppercase">Day</span>
                      <span className="text-xl font-black">{day.day}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{day.title}</h4>
                      <p className="text-white/60 text-sm leading-relaxed">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
