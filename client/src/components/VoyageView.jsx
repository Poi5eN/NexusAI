import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStream } from '../hooks/useStream';
import ItineraryCard from './itinerary/ItineraryCard';

export default function VoyageView() {
  const { activePersona, theme } = usePersonaStore();
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [vibe, setVibe] = useState('Adventure');
  const { sendMessage, messages, isStreaming, activity, clearMessages } = useStream(activePersona.id);
  const isDark = theme === 'dark';

  if (activePersona.id !== 'travel') return null;

  // Find the last itinerary build result in the activity log
  const lastItineraryEvent = [...activity].reverse().find(a => a.tool === 'build_itinerary' && a.status === 'done');
  const structuredItinerary = lastItineraryEvent?.result ? JSON.parse(lastItineraryEvent.result) : null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    clearMessages();
    const prompt = `Plan a ${dates}-day ${vibe} trip to ${destination}. Start by researching the best attractions and current weather. Once you have a plan, use the build_itinerary tool to generate the final itinerary.`;
    await sendMessage(prompt);
  };

  // Find the last message to check for errors
  const lastMessage = messages[messages.length - 1];
  const hasError = lastMessage?.content?.startsWith('⚠️');

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
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${isDark ? 'text-white/40' : 'text-black/50'}`}>The Destination</label>
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
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${isDark ? 'text-white/40' : 'text-black/50'}`}>Trip Duration</label>
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
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${isDark ? 'text-white/40' : 'text-black/50'}`}>Trip Vibe</label>
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
              disabled={isStreaming}
              className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98] ${isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20' : 'bg-black hover:bg-emerald-700 text-white shadow-black/10'}`}
            >
              {isStreaming ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.Sparkles className="w-6 h-6" />}
              {isStreaming ? 'ARCHITECTING...' : 'GENERATE ITINERARY'}
            </button>
          </form>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar transition-colors ${isDark ? 'bg-black/40' : 'bg-white'}`}>
          <AnimatePresence mode="wait">
            {hasError && !isStreaming ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`h-full flex flex-col items-center justify-center text-center p-8 rounded-[40px] border ${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-100'}`}
              >
                <div className={`w-20 h-20 mb-6 rounded-3xl flex items-center justify-center ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                  <LucideIcons.AlertCircle className="w-10 h-10" />
                </div>
                <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>Generation Failed</h3>
                <p className={`max-w-md text-sm font-medium leading-relaxed ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  {lastMessage.content.replace('⚠️', '').trim()}
                </p>
                <button 
                  onClick={clearMessages}
                  className={`mt-8 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-black/5 hover:bg-black/10 text-black/60'}`}
                >
                  Reset Studio
                </button>
              </motion.div>
            ) : !structuredItinerary && !isStreaming ? (
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
            ) : isStreaming && !structuredItinerary ? (
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
                
                {/* Show Activity in VoyageView too */}
                <div className="mt-8 w-full max-w-sm">
                  {activity.map((a, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl mb-2 border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                      <LucideIcons.Search className={`w-4 h-4 ${a.status === 'running' ? 'animate-spin text-emerald-400' : 'text-emerald-500'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                        {a.tool.replace('_', ' ')}: {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto pb-20"
              >
                <ItineraryCard itinerary={structuredItinerary} isDark={isDark} />
                
                {isStreaming && (
                  <div className="mt-8 flex items-center justify-center gap-4 animate-pulse">
                    <LucideIcons.Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-widest opacity-50">Refining Plan...</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
