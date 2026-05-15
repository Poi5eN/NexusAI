import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStream } from '../hooks/useStream';
import ItineraryCard from './itinerary/ItineraryCard';

// ─────────────────────────────────────────────────────────────
// Sub-component: Research Activity List
// ─────────────────────────────────────────────────────────────
function ActivityList({ activity, isDark }) {
  const uniqueTools = [...new Set(activity.map(a => a.tool))];
  if (uniqueTools.length === 0) {
    return (
      <p className={`text-center font-black tracking-[0.3em] text-[10px] animate-pulse
        ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/50'}`}>
        INITIALIZING TRAVEL AGENTS...
      </p>
    );
  }
  return (
    <div className="w-full max-w-sm space-y-2 mx-auto">
      {uniqueTools.map(tool => {
        const instances = activity.filter(a => a.tool === tool);
        const isRunning = instances.some(a => a.status === 'running');
        return (
          <div
            key={tool}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all
              ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/10 shadow-sm'}`}
          >
            {isRunning
              ? <LucideIcons.Search className="w-4 h-4 shrink-0 animate-spin text-emerald-400" />
              : <LucideIcons.CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            }
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-black uppercase tracking-widest
                ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                {tool.replace(/_/g, ' ')}
              </p>
              {isRunning && instances
                .filter(ins => ins.status === 'running')
                .map((ins, j) => (
                  <p key={j} className={`text-[8px] font-bold truncate mt-0.5
                    ${isDark ? 'text-emerald-400/50' : 'text-emerald-600/60'}`}>
                    › {ins.input?.query || 'Analyzing...'}
                  </p>
                ))
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helper: safely parse itinerary from tool result
// ─────────────────────────────────────────────────────────────
function parseItinerary(raw) {
  if (!raw) return null;
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (obj && Array.isArray(obj.days) && obj.days.length > 0) return obj;
    return null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function VoyageView() {
  const { activePersona, theme } = usePersonaStore();
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [vibe, setVibe] = useState('Adventure');
  const [budget, setBudget] = useState('Moderate');
  const [companion, setCompanion] = useState('Solo');
  const [accommodation, setAccommodation] = useState('Boutique');
  const { sendMessage, messages, isStreaming, activity, clearMessages } = useStream(activePersona.id);
  const isDark = theme === 'dark';

  if (activePersona.id !== 'travel') return null;

  // ── Derive UI state ──────────────────────────────────────
  // 1. Check for structured itinerary from tool call
  const lastItineraryEvent = [...activity].reverse()
    .find(a => a.tool === 'build_itinerary' && a.status === 'done');
  const structuredItinerary = parseItinerary(lastItineraryEvent?.result);

  // 2. Check for error message (starts with ⚠️)
  const lastMsg = messages[messages.length - 1];
  const hasError = !isStreaming && lastMsg?.role === 'assistant' && lastMsg?.content?.startsWith('⚠️');

  // 3. Get clean assistant text (only if NO itinerary and NOT an error)
  // This is the streaming or final text from the LLM
  const assistantText = !structuredItinerary && !hasError && lastMsg?.role === 'assistant'
    ? lastMsg.content
    : null;

  // ── Form Handler ─────────────────────────────────────────
  const handleGenerate = async (e) => {
    e.preventDefault();
    clearMessages();
    const prompt = `Plan a ${dates}-day ${vibe} trip to ${destination}.
Budget: ${budget} | Companion: ${companion} | Accommodation: ${accommodation}
Use web_search to research current weather, local events and top attractions. Then call build_itinerary to generate the visual plan.`;
    await sendMessage(prompt);
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className={`flex flex-col h-full rounded-[32px] overflow-hidden shadow-2xl border
      ${isDark ? 'glass border-white/5 bg-black/20' : 'bg-white border-black/5'}`}>

      {/* ── Header ── */}
      <div className={`p-6 border-b z-20 flex justify-between items-center
        ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border
            ${isDark
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]'
              : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'}`}>
            <LucideIcons.Plane className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
              {activePersona.label}
            </h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1
              ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Voyage Architect • Itinerary Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* ── Body: Sidebar + Content ── */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

        {/* ── Input Sidebar ── */}
        <div className={`w-full lg:w-[360px] shrink-0 border-r p-6 overflow-y-auto no-scrollbar
          ${isDark ? 'bg-black/20 border-white/5' : 'bg-[#fcfcfb] border-black/5'}`}>
          <form onSubmit={handleGenerate} className="space-y-6">

            {/* Destination */}
            <div className="space-y-1.5">
              <label className={`text-[9px] font-black uppercase tracking-widest
                ${isDark ? 'text-white/40' : 'text-black/50'}`}>Destination</label>
              <div className="relative">
                <LucideIcons.Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                <input
                  type="text" required value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="Where to? (e.g. Tokyo, Japan)"
                  className={`w-full border rounded-xl py-3 pl-10 pr-3 text-sm transition-all outline-none
                    focus:ring-2 focus:ring-emerald-500/20
                    ${isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20'
                      : 'bg-white border-black/10 text-black placeholder:text-black/30'}`}
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className={`text-[9px] font-black uppercase tracking-widest
                ${isDark ? 'text-white/40' : 'text-black/50'}`}>Duration (Days)</label>
              <div className="relative">
                <LucideIcons.Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                <input
                  type="number" required min="1" max="30" value={dates}
                  onChange={e => setDates(e.target.value)}
                  placeholder="How many days?"
                  className={`w-full border rounded-xl py-3 pl-10 pr-3 text-sm transition-all outline-none
                    focus:ring-2 focus:ring-emerald-500/20
                    ${isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20'
                      : 'bg-white border-black/10 text-black placeholder:text-black/30'}`}
                />
              </div>
            </div>

            {/* Vibe */}
            <div className="space-y-1.5">
              <label className={`text-[9px] font-black uppercase tracking-widest
                ${isDark ? 'text-white/40' : 'text-black/50'}`}>Trip Vibe</label>
              <div className="grid grid-cols-2 gap-2">
                {['Adventure', 'Relaxing', 'Culture', 'Foodie'].map(v => (
                  <button key={v} type="button" onClick={() => setVibe(v)}
                    className={`py-2.5 rounded-xl text-[11px] font-bold transition-all border
                      ${vibe === v
                        ? (isDark ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-emerald-600 text-white border-emerald-600')
                        : (isDark ? 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10' : 'bg-white border-black/10 text-black/40 hover:bg-black/5')}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <label className={`text-[9px] font-black uppercase tracking-widest
                ${isDark ? 'text-white/40' : 'text-black/50'}`}>Budget Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['Economy', 'Moderate', 'Luxury'].map(b => (
                  <button key={b} type="button" onClick={() => setBudget(b)}
                    className={`py-2.5 rounded-xl text-[9px] font-black transition-all border
                      ${budget === b
                        ? (isDark ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-blue-600 text-white border-blue-600')
                        : (isDark ? 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10' : 'bg-white border-black/10 text-black/40 hover:bg-black/5')}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Companion */}
            <div className="space-y-1.5">
              <label className={`text-[9px] font-black uppercase tracking-widest
                ${isDark ? 'text-white/40' : 'text-black/50'}`}>Companion</label>
              <div className="grid grid-cols-2 gap-2">
                {['Solo', 'Couple', 'Family', 'Friends'].map(c => (
                  <button key={c} type="button" onClick={() => setCompanion(c)}
                    className={`py-2.5 rounded-xl text-[9px] font-black transition-all border
                      ${companion === c
                        ? (isDark ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'bg-purple-600 text-white border-purple-600')
                        : (isDark ? 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10' : 'bg-white border-black/10 text-black/40 hover:bg-black/5')}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Accommodation */}
            <div className="space-y-1.5">
              <label className={`text-[9px] font-black uppercase tracking-widest
                ${isDark ? 'text-white/40' : 'text-black/50'}`}>Accommodation</label>
              <select value={accommodation} onChange={e => setAccommodation(e.target.value)}
                className={`w-full border rounded-xl py-3 px-3 text-[11px] font-bold transition-all outline-none
                  focus:ring-2 focus:ring-emerald-500/20
                  ${isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-white border-black/10 text-black'}`}>
                <option value="Boutique">Boutique Hotels</option>
                <option value="Hostel">Hostels / Social</option>
                <option value="Luxury">5-Star Resorts</option>
                <option value="Airbnb">Apartments / Local</option>
                <option value="Eco">Eco-Lodges / Nature</option>
              </select>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isStreaming}
              className={`w-full font-black py-4 rounded-2xl transition-all shadow-lg
                disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98]
                ${isDark
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                  : 'bg-black hover:bg-gray-800 text-white shadow-black/10'}`}>
              {isStreaming
                ? <><LucideIcons.Loader2 className="w-5 h-5 animate-spin" /> ARCHITECTING...</>
                : <><LucideIcons.Sparkles className="w-5 h-5" /> GENERATE ITINERARY</>}
            </button>
          </form>
        </div>

        {/* ── Main Content Area ── */}
        <div className={`flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar
          ${isDark ? 'bg-black/40' : 'bg-white'}`}>
          <AnimatePresence mode="wait">

            {/* ERROR STATE */}
            {hasError && (
              <motion.div key="error"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`h-full flex flex-col items-center justify-center text-center p-8
                  rounded-[32px] border
                  ${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
                <div className={`w-16 h-16 mb-5 rounded-2xl flex items-center justify-center
                  ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                  <LucideIcons.AlertCircle className="w-8 h-8" />
                </div>
                <h3 className={`text-lg font-black mb-3 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  Generation Failed
                </h3>
                <p className={`max-w-sm text-sm font-medium leading-relaxed
                  ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                  {lastMsg?.content?.replace('⚠️', '').trim()}
                </p>
                <button onClick={clearMessages}
                  className={`mt-6 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-black/5 hover:bg-black/10 text-black/60'}`}>
                  Reset Studio
                </button>
              </motion.div>
            )}

            {/* LOADING / STREAMING STATE */}
            {!hasError && isStreaming && !structuredItinerary && (
              <motion.div key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto flex flex-col gap-8 pb-20"
              >
                {/* Thinking Phase (Live) */}
                {assistantText && (
                  <div className={`p-7 rounded-[28px] border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-sm'}`}>
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
                      <LucideIcons.Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                        Agent Thinking...
                      </span>
                    </div>
                    <div className={`text-sm leading-relaxed space-y-3 ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                      {assistantText.split('\n').filter(l => l.trim()).map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Research Phase (Activity) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <LucideIcons.Search className={`w-3 h-3 ${isDark ? 'text-white/20' : 'text-black/20'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-black/20'}`}>Research in Progress</span>
                  </div>
                  <ActivityList activity={activity} isDark={isDark} />
                </div>

                {/* Main Spinner (Pulse) */}
                {!assistantText && activity.length === 0 && (
                  <div className="flex flex-col items-center gap-6 mt-20">
                    <div className="relative">
                      <LucideIcons.Loader2 className={`w-12 h-12 animate-spin opacity-20 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`} />
                      <LucideIcons.Plane className={`w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`} />
                    </div>
                    <p className={`text-[10px] font-black tracking-[0.3em] uppercase animate-pulse ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/50'}`}>
                      Analyzing Request...
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ITINERARY CARD (final result) */}
            {!hasError && !isStreaming && structuredItinerary && (
              <motion.div key="results"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto pb-20"
              >
                <ItineraryCard itinerary={structuredItinerary} isDark={isDark} />
                
                {/* Brief Closing thought if any */}
                {assistantText && (
                  <div className={`mt-8 p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-black/5'}`}>
                    <p className={`text-sm italic ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                      {assistantText}
                    </p>
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-white/5">
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-4 ${isDark ? 'text-white/20' : 'text-black/30'}`}>
                    Research Footprint
                  </p>
                  <ActivityList activity={activity} isDark={isDark} />
                </div>
              </motion.div>
            )}

            {/* TEXT FALLBACK (if stream ends without structured itinerary) */}
            {!hasError && !isStreaming && !structuredItinerary && assistantText && (
              <motion.div key="text-fallback"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto space-y-8 pb-20"
              >
                <div className={`p-8 rounded-[32px] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-sm'}`}>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                    <LucideIcons.MessageSquare className="w-5 h-5 text-emerald-500" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                      Agent Synthesis
                    </span>
                  </div>
                  <div className={`text-base leading-relaxed space-y-4 ${isDark ? 'text-white/90' : 'text-black font-medium'}`}>
                    {assistantText.split('\n').filter(l => l.trim()).map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-black/30'}`}>Background Research</p>
                  <ActivityList activity={activity} isDark={isDark} />
                </div>
              </motion.div>
            )}

            {/* ACTIVITY-ONLY (searches done, nothing rendered yet — rare edge case) */}
            {!hasError && !isStreaming && !structuredItinerary && !assistantText && activity.length > 0 && (
              <motion.div key="activity-only"
                className="h-full flex flex-col items-center justify-center gap-6">
                <ActivityList activity={activity} isDark={isDark} />
                <p className={`text-[9px] font-bold uppercase tracking-widest
                  ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                  Research finished — no itinerary was generated
                </p>
              </motion.div>
            )}

            {/* EMPTY STATE */}
            {!hasError && !isStreaming && !structuredItinerary && !assistantText && activity.length === 0 && (
              <motion.div key="empty"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center gap-4">
                <div className={`w-28 h-28 rounded-[32px] flex items-center justify-center border
                  ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.02] border-black/5 shadow-inner'}`}>
                  <LucideIcons.Compass className={`w-14 h-14 animate-[spin_12s_linear_infinite]
                    ${isDark ? 'text-white/20' : 'text-black/10'}`} />
                </div>
                <h3 className={`text-2xl font-black ${isDark ? 'text-white/30' : 'text-black/25'}`}>
                  Ready for Takeoff?
                </h3>
                <p className={`max-w-xs text-sm ${isDark ? 'text-white/20' : 'text-black/20'}`}>
                  Tell me your destination and let's build the perfect journey together.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
