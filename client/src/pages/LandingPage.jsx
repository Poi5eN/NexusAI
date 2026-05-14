import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { PERSONAS } from '../stores/personaStore';
import usePersonaStore from '../stores/personaStore';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme } = usePersonaStore();
  
  const isDark = theme === 'dark';

  return (
    <div className={`h-screen w-full transition-colors duration-700 ${isDark ? 'bg-[#020617] text-white' : 'bg-[#fdfdfc] text-[#1a1a1a]'} overflow-hidden flex flex-col relative font-sans selection:bg-amber-100`}>
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-0 right-0 w-[40%] h-[40%] ${isDark ? 'bg-blue-600/10' : 'bg-amber-500/5'} rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 transition-colors duration-700`} />
        {isDark && (
           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        )}
      </div>

      {/* Navbar */}
      <nav className={`shrink-0 h-20 px-6 md:px-12 flex items-center justify-between z-50 transition-colors duration-700 ${isDark ? 'bg-black/20 border-b border-white/5 backdrop-blur-xl' : ''}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <LucideIcons.Layers className={`w-5 h-5 transition-colors ${isDark ? 'text-blue-500' : 'text-amber-600'}`} strokeWidth={2.5} />
          <span className={`font-bold text-xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>NEXUS</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <button className={`text-sm font-medium transition-colors ${isDark ? 'text-blue-400' : 'text-amber-700'}`}>Home</button>
          <button onClick={() => navigate('/about')} className={`text-sm font-medium transition-colors ${isDark ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'}`}>About</button>
          <button onClick={() => navigate('/team')} className={`text-sm font-medium transition-colors ${isDark ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'}`}>Team</button>
          <div className="w-px h-4 bg-black/10 mx-2" />
          <ThemeToggle />
          <button 
            onClick={() => navigate('/app')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm ${isDark ? 'bg-white text-black hover:bg-blue-500 hover:text-white' : 'bg-[#1a1a1a] text-white hover:bg-black'}`}
          >
            Launch Platform
          </button>
        </div>

        <div className="md:hidden flex items-center gap-4">
           <ThemeToggle />
           <LucideIcons.Menu className={`w-5 h-5 ${isDark ? 'text-white/60' : 'text-black/60'}`} />
        </div>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl w-full"
        >
          <div className={`mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border transition-colors ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-amber-50 border-amber-100'}`}>
             <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-blue-400' : 'text-amber-700'}`}>Intelligence Orchestration</span>
          </div>

          <h1 className={`text-5xl md:text-8xl font-serif font-medium tracking-tight mb-8 leading-[1.1] transition-colors ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
            {isDark ? 'Architecting the' : 'Thoughtful AI'} <br />
            <span className={`italic transition-colors ${isDark ? 'text-blue-500' : 'text-amber-700/80'}`}>{isDark ? 'Digital Frontier.' : 'Expertly deployed.'}</span>
          </h1>

          <p className={`text-lg md:text-xl font-medium max-w-xl mx-auto mb-12 leading-relaxed transition-colors ${isDark ? 'text-white/40' : 'text-black/40'}`}>
            {isDark 
              ? 'A premium studio environment for cognitive excellence and multi-persona deployment.' 
              : 'A minimalist workspace for multi-persona cognitive units. Designed for clarity and deep focus.'}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/app')}
              className={`w-full sm:w-auto px-10 py-4 font-semibold text-sm rounded-full transition-all active:scale-95 shadow-lg ${isDark ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/20' : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-200'}`}
            >
              Get Started
            </button>
            
            <button 
              onClick={() => navigate('/about')}
              className={`w-full sm:w-auto px-10 py-4 border font-semibold text-sm rounded-full transition-all active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white' : 'bg-white border-black/5 text-black/60 hover:bg-black/5 hover:text-black'}`}
            >
              Learn More
            </button>
          </div>
        </motion.div>
      </main>

      {/* Persona Shelf */}
      <div className={`shrink-0 w-full border-t transition-colors ${isDark ? 'bg-black/40 border-white/5' : 'bg-white/50 border-black/5'} backdrop-blur-md overflow-hidden py-8`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
             <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Active Units (0{PERSONAS.length})</h4>
          </div>
          
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 px-2 -mx-2">
            {PERSONAS.map((p, i) => {
              const Icon = LucideIcons[p.icon] || LucideIcons.Bot;
              return (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate('/app')}
                  className={`flex flex-col items-center justify-center min-w-[120px] md:min-w-[140px] aspect-square border rounded-3xl transition-all cursor-pointer group ${isDark ? 'bg-white/5 border-white/5 hover:border-blue-500/30' : 'bg-white border-black/5 hover:border-amber-500/30 hover:shadow-xl'}`}
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${p.color}11`, color: p.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-white/40 group-hover:text-white' : 'text-black/40 group-hover:text-black'}`}>{p.label.split(' ')[0]}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
