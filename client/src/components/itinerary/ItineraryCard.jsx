import React from 'react';
import * as LucideIcons from 'lucide-react';

export default function ItineraryCard({ itinerary, isDark }) {
  if (!itinerary) return null;

  return (
    <div className={`mt-6 rounded-[32px] overflow-hidden border transition-all duration-500 shadow-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
      {/* Header */}
      <div className={`p-6 md:p-8 border-b flex items-center justify-between transition-colors ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <LucideIcons.MapPin className="w-6 h-6 md:w-7 md:h-7 text-blue-500" />
          </div>
          <div>
            <h3 className={`text-xl md:text-2xl font-black transition-colors ${isDark ? 'text-white' : 'text-black'}`}>
              {itinerary.destination}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isDark ? 'bg-white/10 text-white/60' : 'bg-black/5 text-black/60'}`}>
                {itinerary.duration_days} Days
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-600'}`}>
                {itinerary.budget_level || 'Moderate'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6 md:p-8 space-y-10">
        {Array.isArray(itinerary.days) && itinerary.days.map((day, idx) => (
          <div key={idx} className="relative pl-8 md:pl-10 border-l-2 border-dashed border-blue-500/20 last:border-0 pb-2">
            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-blue-500/40">
              {day.day}
            </div>
            
            <div className="mb-6">
              <h4 className={`text-sm md:text-base font-black transition-colors ${isDark ? 'text-white' : 'text-black'}`}>
                {day.theme || `Day ${day.day}`}
              </h4>
            </div>

            <div className="space-y-4">
              {day.activities?.map((act, actIdx) => (
                <div 
                  key={actIdx} 
                  className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${isDark ? 'bg-white/[0.03] border-white/5 hover:bg-white/5' : 'bg-black/[0.01] border-black/5 hover:bg-black/[0.03]'}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <LucideIcons.Clock className="w-3 h-3 text-blue-400" />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                          {act.time}
                        </span>
                      </div>
                      <p className={`text-sm font-semibold transition-colors ${isDark ? 'text-white/90' : 'text-black'}`}>
                        {act.activity}
                      </p>
                      {act.location && (
                        <div className="flex items-center gap-1 mt-2">
                          <LucideIcons.MapPin className="w-3 h-3 text-blue-400/60" />
                          <span className={`text-[10px] transition-colors ${isDark ? 'text-white/30' : 'text-black/50'}`}>
                            {act.location}
                          </span>
                        </div>
                      )}
                    </div>
                    <button className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-white/5 text-white/40 hover:text-white' : 'bg-black/5 text-black/40 hover:text-black'}`}>
                      <LucideIcons.ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Tips */}
      <div className={`p-6 md:p-8 border-t flex flex-wrap gap-4 transition-colors ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
        <div className="flex items-center gap-2">
          <LucideIcons.Info className="w-4 h-4 text-blue-400" />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-black/50'}`}>
            Ready to explore? Save this itinerary to your profile.
          </span>
        </div>
      </div>
    </div>
  );
}
