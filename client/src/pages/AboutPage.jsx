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
    <div className={`h-screen w-full transition-colors duration-1000 ${isDark ? 'bg-[#020617] text-white' : 'bg-[#fdfdfc] text-[#1a1a1a]'} overflow-hidden flex flex-col relative font-sans selection:bg-amber-100`}>
      {/* Background Engine */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ backgroundColor: `${PERSONAS[activeIndex].color}10` }}
          className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{ backgroundColor: `${PERSONAS[activeIndex].color}08` }}
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px]" 
        />
      </div>

      {/* Navbar */}
      <nav className={`shrink-0 h-14 px-6 md:px-12 flex items-center justify-between z-50 transition-colors duration-700 ${isDark ? 'bg-black/40 border-b border-white/5 backdrop-blur-2xl' : 'bg-white/60 border-b border-black/5 backdrop-blur-2xl'}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <LucideIcons.Layers className={`w-4 h-4 ${isDark ? 'text-blue-500' : 'text-amber-600'}`} />
          <span className="font-bold text-lg tracking-tight">NEXUS</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/')} className={`text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity`}>Home</button>
          <button className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-amber-700'}`}>Portfolio</button>
          <button onClick={() => navigate('/team')} className={`text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity`}>Team</button>
          <ThemeToggle />
          <button onClick={() => navigate('/app')} className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white text-black hover:bg-blue-500 hover:text-white' : 'bg-[#1a1a1a] text-white hover:bg-black'}`}>Launch Studio</button>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 flex flex-col p-6 md:p-10 relative z-10 overflow-hidden min-h-0">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
          
          <div className="mb-6 shrink-0">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
                Intelligence <span className="italic opacity-40">Matrix.</span>
              </h1>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30 mt-1">Advanced Unit Portfolio v4.2</p>
            </motion.div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 overflow-hidden">
            {/* Sidebar */}
            <div className="md:w-52 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0">
              {PERSONAS.map((p, i) => {
                const Icon = LucideIcons[p.icon] || LucideIcons.Bot;
                const isActive = activeIndex === i;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveIndex(i)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 border text-left group ${
                      isActive 
                        ? (isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-black/10 shadow-sm text-black') 
                        : (isDark ? 'bg-transparent border-transparent text-white/30 hover:text-white/60' : 'bg-transparent border-transparent text-black/40 hover:text-black/70')
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform" style={{ backgroundColor: `${p.color}${isDark ? '22' : '11'}`, color: p.color }}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-tight hidden md:block whitespace-nowrap overflow-hidden text-ellipsis">{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Terminal */}
            <div className="flex-1 min-w-0 h-full relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={PERSONAS[activeIndex].id}
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  className={`h-full rounded-[32px] border p-6 md:p-10 flex flex-col relative overflow-hidden ${isDark ? 'bg-black/60 border-white/10 backdrop-blur-3xl' : 'bg-white/90 border-black/5 shadow-2xl backdrop-blur-3xl'}`}
                >
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: PERSONAS[activeIndex].color }} />
                  
                  <div className="flex items-center gap-6 mb-8 shrink-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-2xl relative" style={{ backgroundColor: `${PERSONAS[activeIndex].color}${isDark ? '22' : '11'}`, color: PERSONAS[activeIndex].color }}>
                      {(() => {
                        const Icon = LucideIcons[PERSONAS[activeIndex].icon] || LucideIcons.Bot;
                        return <Icon className="w-8 h-8 md:w-10 md:h-10" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-5xl font-serif font-medium tracking-tight leading-none">{PERSONAS[activeIndex].label}</h2>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] mt-2 opacity-40">Cognitive Framework Active</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6 md:space-y-8 min-h-0 overflow-y-auto no-scrollbar pr-4 mb-6">
                    <p className={`text-lg md:text-2xl font-serif italic transition-colors ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                      {PERSONAS[activeIndex].description}.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
                        <h4 className={`text-[9px] font-black uppercase tracking-[0.3em] mb-3 opacity-30`}>Core Capabilities</h4>
                        <p className={`text-[12px] md:text-[13px] leading-relaxed font-medium ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                          {PERSONAS[activeIndex].capabilities}
                        </p>
                      </div>
                      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
                        <h4 className={`text-[9px] font-black uppercase tracking-[0.3em] mb-3 opacity-30`}>System Integration</h4>
                        <p className={`text-[12px] md:text-[13px] leading-relaxed font-medium ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                          {PERSONAS[activeIndex].integration}
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      usePersonaStore.getState().setPersona(PERSONAS[activeIndex]);
                      navigate('/app');
                    }}
                    className={`shrink-0 w-full py-4 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl ${isDark ? 'bg-white text-black hover:bg-blue-500 hover:text-white' : 'bg-black text-white hover:bg-amber-600'}`}
                  >
                    Deploy Intelligent Module
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`shrink-0 h-12 flex items-center justify-center px-8 text-[8px] font-black tracking-[0.5em] uppercase transition-colors ${isDark ? 'text-white/5' : 'text-black/10'}`}>
        Nexus Intelligence Systems • Secured
      </footer>
    </div>
  );
}
