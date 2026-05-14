import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TutorView() {
  const { activePersona, theme } = usePersonaStore();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const isDark = theme === 'dark';

  if (activePersona.id !== 'tutor') return null;

  const handleExplain = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setIsLoading(true);
    setExplanation(null);
    
    setTimeout(() => {
      setExplanation({
        title: "Mastering " + topic,
        steps: [
          { step: 1, title: "Core Fundamentals", content: "Understanding the underlying principles of " + topic + " is essential. Think of it as the building blocks of the entire concept." },
          { step: 2, title: "Mechanism & Process", content: "How does it actually work? We look at the interplay between different variables and the causal chain." },
          { step: 3, title: "Practical Application", content: "Let's apply this to a real-world scenario to solidify your mental model." }
        ]
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-500 rounded-[32px] overflow-hidden shadow-2xl relative border ${isDark ? 'glass border-white/5 bg-black/20' : 'bg-white border-black/5'}`}>
      <div className={`p-6 border-b z-20 flex justify-between items-center transition-colors ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.2)]' : 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'}`}>
            <LucideIcons.GraduationCap className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`font-black text-2xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{activePersona.label}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Academic Helper • Specialized Tutoring</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Input Sidebar */}
        <div className={`w-full lg:w-[400px] border-r p-8 overflow-y-auto no-scrollbar transition-colors ${isDark ? 'bg-black/20 border-white/5' : 'bg-[#fcfcfb] border-black/5'}`}>
          <form onSubmit={handleExplain} className="space-y-8">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Learning Topic</label>
              <textarea 
                required
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="What would you like to learn today? (e.g. Quantum Mechanics, Organic Chemistry)"
                className={`w-full border rounded-2xl p-5 transition-all placeholder:text-opacity-30 outline-none focus:ring-4 focus:ring-indigo-500/10 h-32 resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white' : 'bg-white border-black/10 text-black placeholder:text-black'}`}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98] ${isDark ? 'bg-indigo-500 hover:bg-indigo-400 text-black shadow-indigo-500/20' : 'bg-black hover:bg-indigo-700 text-white shadow-black/10'}`}
            >
              {isLoading ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.BookOpen className="w-6 h-6" />}
              {isLoading ? 'PREPARING LESSON...' : 'START TUTORIAL'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className={`flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar transition-colors ${isDark ? 'bg-black/40' : 'bg-white'}`}>
          <AnimatePresence mode="wait">
            {!explanation && !isLoading ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <div className={`w-32 h-32 mb-8 rounded-[40px] flex items-center justify-center border transition-colors ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.02] border-black/5 shadow-inner'}`}>
                  <LucideIcons.Library className={`w-16 h-16 transition-colors ${isDark ? 'text-white/20' : 'text-black/10'}`} />
                </div>
                <h3 className={`text-2xl font-black mb-2 transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>Knowledge Studio</h3>
                <p className={`max-w-xs text-sm transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Select a topic for an interactive, step-by-step breakdown.</p>
              </motion.div>
            ) : isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center">
                <LucideIcons.Loader2 className={`w-12 h-12 animate-spin mb-6 transition-colors ${isDark ? 'text-indigo-500' : 'text-indigo-600'}`} />
                <p className={`font-black tracking-widest text-xs transition-colors ${isDark ? 'text-indigo-500/50' : 'text-indigo-600/50'}`}>SYNTHESIZING CURRICULUM...</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
                <h3 className={`text-3xl md:text-4xl font-black border-b pb-8 transition-colors ${isDark ? 'text-white border-white/5' : 'text-black border-black/5'}`}>{explanation.title}</h3>
                <div className="space-y-6">
                  {explanation.steps.map((s, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`border p-6 md:p-8 rounded-[32px] transition-all shadow-sm ${isDark ? 'bg-white/5 border-white/5 hover:border-indigo-500/30' : 'bg-[#fdfdfc] border-black/5 hover:border-indigo-100'}`}
                    >
                      <span className={`text-[10px] font-black tracking-widest uppercase mb-2 block transition-colors ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Step {s.step}</span>
                      <h4 className={`text-lg md:text-xl font-black mb-3 transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{s.title}</h4>
                      <p className={`text-sm leading-relaxed transition-colors ${isDark ? 'text-white/50' : 'text-black/50'}`}>{s.content}</p>
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
