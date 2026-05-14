import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { PERSONAS } from '../stores/personaStore';
import usePersonaStore from '../stores/personaStore';
import ThemeToggle from '../components/ThemeToggle';
import { useState } from 'react';

export default function AboutPage() {
  const navigate = useNavigate();
  const { theme } = usePersonaStore();
  const [activeIndex, setActiveIndex] = useState(0);
  
  const isDark = theme === 'dark';

  return (
    <div className={`h-screen w-full transition-colors duration-700 ${isDark ? 'bg-[#020617] text-white' : 'bg-[#fdfdfc] text-[#1a1a1a]'} overflow-hidden flex flex-col relative font-sans selection:bg-amber-100`}>
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 ${isDark ? 'bg-blue-600/10' : 'bg-amber-500/5'}`} />

      {/* Navbar */}
      <nav className={`shrink-0 h-20 px-6 md:px-12 flex items-center justify-between z-50 transition-colors duration-700 ${isDark ? 'bg-black/20 border-b border-white/5 backdrop-blur-xl' : ''}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <LucideIcons.Layers className={`w-5 h-5 transition-colors ${isDark ? 'text-blue-500' : 'text-amber-600'}`} strokeWidth={2.5} />
          <span className={`font-bold text-xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>NEXUS</span>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/')} className={`text-sm font-medium transition-colors ${isDark ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'}`}>Home</button>
          <button className={`text-sm font-medium transition-colors ${isDark ? 'text-blue-400' : 'text-amber-700'}`}>About</button>
          <button onClick={() => navigate('/team')} className={`text-sm font-medium transition-colors ${isDark ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'}`}>Team</button>
          <ThemeToggle />
          <button onClick={() => navigate('/app')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isDark ? 'bg-white text-black hover:bg-blue-500 hover:text-white' : 'bg-[#1a1a1a] text-white hover:bg-black'}`}>Launch</button>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10 overflow-hidden">
        <div className="max-w-7xl w-full flex flex-col h-full max-h-[700px]">
          <div className="mb-10 text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-4xl md:text-6xl font-serif font-medium tracking-tight transition-colors ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}
            >
              Intelligence <span className={`italic transition-colors ${isDark ? 'text-blue-500' : 'text-amber-700'}`}>Portfolio.</span>
            </motion.h1>
            <p className={`font-medium mt-3 max-w-xl text-sm tracking-wide transition-colors ${isDark ? 'text-white/30' : 'text-black/40'}`}>
              An ecosystem of specialized cognitive units for every domain.
            </p>
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
            {/* Persona List Sidebar */}
            <div className="md:w-64 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0 pb-4 md:pb-0">
              {PERSONAS.map((p, i) => {
                const Icon = LucideIcons[p.icon] || LucideIcons.Bot;
                const isActive = activeIndex === i;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveIndex(i)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all border whitespace-nowrap shrink-0 md:shrink ${
                      isActive 
                        ? (isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-black/10 shadow-sm text-black') 
                        : (isDark ? 'bg-transparent border-transparent hover:bg-white/5 text-white/40 opacity-100' : 'bg-transparent border-transparent hover:bg-black/[0.02] opacity-50')
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.color}${isDark ? '22' : '11'}`, color: p.color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold tracking-tight hidden md:block">{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Persona Detail Card */}
            <div className="flex-1 min-w-0 h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={PERSONAS[activeIndex].id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`h-full rounded-[32px] border p-8 md:p-12 flex flex-col relative overflow-hidden transition-all duration-700 shadow-sm ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-black/5'}`}
                >
                  <div className="flex items-center gap-6 mb-8">
                     <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center shadow-inner transition-all duration-700" style={{ backgroundColor: `${PERSONAS[activeIndex].color}${isDark ? '22' : '11'}`, color: PERSONAS[activeIndex].color }}>
                        {(() => {
                          const Icon = LucideIcons[PERSONAS[activeIndex].icon] || LucideIcons.Bot;
                          return <Icon className="w-8 h-8 md:w-10 md:h-10" />;
                        })()}
                     </div>
                     <div>
                       <h2 className="text-3xl md:text-5xl font-serif font-medium tracking-tight leading-none">{PERSONAS[activeIndex].label}</h2>
                       <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 transition-colors ${isDark ? 'text-blue-400' : 'text-amber-700'}`}>Active Framework 4.2</p>
                     </div>
                  </div>

                  <div className="flex-1 space-y-8 min-h-0 overflow-y-auto no-scrollbar pr-4">
                    <p className={`text-lg md:text-xl font-medium leading-relaxed font-serif italic transition-colors ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                      {PERSONAS[activeIndex].description}.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-6 rounded-3xl border transition-all duration-700 ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
                        <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-2 transition-colors ${isDark ? 'text-white/20' : 'text-black/30'}`}>Capabilities</h4>
                        <p className={`text-xs font-medium transition-colors ${isDark ? 'text-white/60' : 'text-black/60'}`}>Specialized logic processing for {PERSONAS[activeIndex].label} workflows.</p>
                      </div>
                      <div className={`p-6 rounded-3xl border transition-all duration-700 ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
                        <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-2 transition-colors ${isDark ? 'text-white/20' : 'text-black/30'}`}>Integration</h4>
                        <p className={`text-xs font-medium transition-colors ${isDark ? 'text-white/60' : 'text-black/60'}`}>Seamless data retrieval and real-time synthesis.</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate('/app')}
                    className={`mt-8 w-full py-4 font-bold text-sm rounded-2xl transition-all active:scale-[0.98] ${isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#1a1a1a] text-white hover:bg-black'}`}
                  >
                    Deploy Module
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className={`shrink-0 h-16 flex items-center justify-center px-8 text-[10px] font-medium tracking-widest uppercase transition-colors ${isDark ? 'text-white/10' : 'text-black/20'}`}>
        Nexus Intelligence Systems
      </footer>
    </div>
  );
}
