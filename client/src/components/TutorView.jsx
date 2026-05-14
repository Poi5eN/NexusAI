import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TutorView() {
  const { activePersona } = usePersonaStore();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);

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
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 bg-black/20">
      <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl z-20 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.2)] border border-indigo-500/20">
            <LucideIcons.GraduationCap className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-black text-2xl tracking-tight text-white">{activePersona.label}</h2>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1">Academic Helper • Specialized Tutoring</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="w-full lg:w-[400px] border-r border-white/5 p-8 bg-black/20 overflow-y-auto no-scrollbar">
          <form onSubmit={handleExplain} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Learning Topic</label>
              <textarea 
                required
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="What would you like to learn today? (e.g. Quantum Mechanics, Organic Chemistry)"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-white/20 h-32 resize-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-black font-black py-5 rounded-2xl transition-all shadow-[0_20px_40px_rgba(99,102,241,0.2)] disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98]"
            >
              {isLoading ? <LucideIcons.Loader2 className="w-6 h-6 animate-spin" /> : <LucideIcons.BookOpen className="w-6 h-6" />}
              {isLoading ? 'PREPARING LESSON...' : 'START TUTORIAL'}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-black/40 no-scrollbar">
          <AnimatePresence mode="wait">
            {!explanation && !isLoading ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center text-white/20 text-center"
              >
                <LucideIcons.Library className="w-16 h-16 mb-8 opacity-30" />
                <h3 className="text-2xl font-black text-white/40 mb-2">Knowledge Studio</h3>
                <p className="max-w-xs text-sm">Select a topic for an interactive, step-by-step breakdown.</p>
              </motion.div>
            ) : isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center">
                <LucideIcons.Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-6" />
                <p className="font-black tracking-widest text-indigo-500/50 text-xs">SYNTHESIZING CURRICULUM...</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
                <h3 className="text-4xl font-black text-white border-b border-white/5 pb-8">{explanation.title}</h3>
                <div className="space-y-6">
                  {explanation.steps.map((s, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/5 border border-white/5 p-8 rounded-3xl hover:border-indigo-500/30 transition-all"
                    >
                      <span className="text-[10px] font-black tracking-widest uppercase text-indigo-400 mb-2 block">Step {s.step}</span>
                      <h4 className="text-xl font-black text-white mb-3">{s.title}</h4>
                      <p className="text-white/50 text-sm leading-relaxed">{s.content}</p>
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
