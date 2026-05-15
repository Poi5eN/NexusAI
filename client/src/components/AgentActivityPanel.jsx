import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

export default function AgentActivityPanel({ activity, personaColor, isDark }) {
  if (!activity || activity.length === 0) return null;

  return (
    <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-left-2 duration-500">
      <AnimatePresence mode="popLayout">
        {activity.map((event, i) => (
          <motion.div
            key={event.id || i}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
              isDark 
                ? 'bg-white/5 border-white/5 text-white/70 shadow-lg backdrop-blur-md' 
                : 'bg-black/5 border-black/10 text-black shadow-sm'
            }`}
          >
            <div className="flex items-center justify-center">
              {event.status === 'running' ? (
                <LucideIcons.Search className="w-4 h-4 animate-spin" style={{ color: personaColor }} />
              ) : (
                <LucideIcons.CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-black/50'}`}>
                  {event.tool.replace('_', ' ')}
                </span>
                <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  event.status === 'running' 
                    ? 'bg-amber-500/10 text-amber-500 animate-pulse' 
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {event.status}
                </span>
              </div>
              <p className={`text-xs font-medium truncate max-w-[300px] md:max-w-md ${isDark ? 'text-white/60' : 'text-black/80'}`}>
                {event.status === 'running' 
                  ? `Executing search for "${event.input.query}"...` 
                  : `Retrieved ${JSON.parse(event.result || '{"results":[]}').results?.length || 0} results`}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
