import React from 'react';
import * as LucideIcons from 'lucide-react';

export default function ItineraryCard({ itinerary, isDark }) {
  if (!itinerary) return null;

  return (
    <div className={`mt-6 rounded-[32px] overflow-hidden border transition-all duration-500 shadow-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
      {/* Header */}
      {/* Header */}
      <div className={`p-6 md:p-8 border-b transition-colors ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
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

          {itinerary.price_summary && (
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
               <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-emerald-400/60' : 'text-emerald-600/60'}`}>Est. Total Budget</p>
               <p className={`text-xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                 {itinerary.price_summary.estimated_total} <span className="text-xs">{itinerary.price_summary.currency}</span>
               </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col xl:flex-row">
        
        {/* Timeline (Left/Main) */}
        <div className="flex-1 p-6 md:p-8 space-y-10 border-r border-white/5">
          <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-8 ${isDark ? 'text-white/30' : 'text-black/30'}`}>Daily Schedule</h4>
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
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          {act.location && (
                            <div className="flex items-center gap-1">
                              <LucideIcons.MapPin className="w-3 h-3 text-blue-400/60" />
                              <span className={`text-[10px] transition-colors ${isDark ? 'text-white/30' : 'text-black/50'}`}>
                                {act.location}
                              </span>
                            </div>
                          )}
                          {act.price_estimate && (
                            <div className="flex items-center gap-1">
                              <LucideIcons.Tag className="w-3 h-3 text-emerald-500/60" />
                              <span className={`text-[10px] font-bold ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/60'}`}>
                                {act.price_estimate}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Info (Right) */}
        <div className={`w-full xl:w-[320px] p-6 md:p-8 space-y-10 ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
          
          {/* Hotels */}
          {itinerary.hotels?.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <LucideIcons.Hotel className="w-4 h-4 text-blue-500" />
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-black/50'}`}>Stay & Hospitality</h4>
              </div>
              <div className="space-y-3">
                {itinerary.hotels.map((hotel, hIdx) => (
                  <div key={hIdx} className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                    <p className="text-xs font-black mb-1">{hotel.name}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5">
                        <LucideIcons.Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-bold">{hotel.rating}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500">{hotel.price_per_night}/nt</span>
                    </div>
                    <p className={`text-[10px] leading-relaxed ${isDark ? 'text-white/40' : 'text-black/40'}`}>{hotel.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {itinerary.events?.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <LucideIcons.Ticket className="w-4 h-4 text-purple-500" />
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-black/50'}`}>Live Events</h4>
              </div>
              <div className="space-y-3">
                {itinerary.events.map((event, eIdx) => (
                  <div key={eIdx} className={`p-4 rounded-2xl border ${isDark ? 'bg-purple-500/5 border-purple-500/10' : 'bg-purple-50 border-purple-100'}`}>
                    <p className="text-xs font-black mb-1">{event.name}</p>
                    <p className="text-[9px] font-bold text-purple-500 mb-2 uppercase">{event.date}</p>
                    <p className={`text-[10px] leading-relaxed ${isDark ? 'text-white/40' : 'text-black/40'}`}>{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden Gems */}
          {itinerary.nearby_gems?.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <LucideIcons.Sparkles className="w-4 h-4 text-yellow-500" />
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-black/50'}`}>Hidden Gems</h4>
              </div>
              <div className="space-y-3">
                {itinerary.nearby_gems.map((gem, gIdx) => (
                  <div key={gIdx} className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold">{gem.name}</p>
                      <p className={`text-[10px] leading-relaxed ${isDark ? 'text-white/40' : 'text-black/40'}`}>{gem.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
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
