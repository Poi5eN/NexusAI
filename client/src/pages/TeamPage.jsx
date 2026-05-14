import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import usePersonaStore from '../stores/personaStore';
import ThemeToggle from '../components/ThemeToggle';

export default function TeamPage() {
  const navigate = useNavigate();
  const { theme } = usePersonaStore();
  
  const isDark = theme === 'dark';

  return (
    <div className={`h-screen w-full transition-colors duration-700 ${isDark ? 'bg-[#020617] text-white' : 'bg-[#fdfdfc] text-[#1a1a1a]'} overflow-hidden flex flex-col relative font-sans selection:bg-amber-100`}>
      {/* Background Subtle Elements */}
      <div className={`absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b pointer-events-none transition-colors duration-700 ${isDark ? 'from-blue-900/10 to-transparent' : 'from-amber-500/5 to-transparent'}`} />

      {/* Navbar */}
      <nav className={`shrink-0 h-20 px-6 md:px-12 flex items-center justify-between z-50 transition-colors duration-700 ${isDark ? 'bg-black/20 border-b border-white/5 backdrop-blur-xl' : ''}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <LucideIcons.Layers className={`w-5 h-5 transition-colors ${isDark ? 'text-blue-500' : 'text-amber-600'}`} strokeWidth={2.5} />
          <span className={`font-bold text-xl tracking-tight transition-colors ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>NEXUS</span>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/')} className={`text-sm font-medium transition-colors ${isDark ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'}`}>Home</button>
          <button onClick={() => navigate('/about')} className={`text-sm font-medium transition-colors ${isDark ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'}`}>About</button>
          <button className={`text-sm font-medium transition-colors ${isDark ? 'text-blue-400' : 'text-amber-700'}`}>Team</button>
          <ThemeToggle />
          <button onClick={() => navigate('/app')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isDark ? 'bg-white text-black hover:bg-blue-500 hover:text-white' : 'bg-[#1a1a1a] text-white hover:bg-black'}`}>Launch</button>
        </div>
      </nav>

      {/* Profile Area */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-5xl md:text-7xl font-serif font-medium tracking-tight mb-2 transition-colors ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}
            >
              The <span className={`italic transition-colors ${isDark ? 'text-blue-500' : 'text-amber-700'}`}>Architect.</span>
            </motion.h1>
            <p className={`font-bold uppercase tracking-widest text-[10px] transition-colors ${isDark ? 'text-white/30' : 'text-black/30'}`}>Lead System Designer</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`p-10 md:p-16 rounded-[40px] border shadow-sm flex flex-col items-center relative overflow-hidden group transition-all duration-700 ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-black/5'}`}
          >
            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[48px] flex items-center justify-center mb-10 shadow-inner group-hover:scale-105 transition-all duration-700 ${isDark ? 'bg-blue-500/10' : 'bg-amber-50'}`}>
               <span className={`text-5xl md:text-6xl font-serif italic font-medium transition-colors ${isDark ? 'text-blue-400' : 'text-amber-700'}`}>P</span>
            </div>
            
            <div className="text-center mb-12">
              <h2 className={`text-3xl md:text-4xl font-serif font-medium tracking-tight mb-2 transition-colors ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>Gourav Kumar Upadhyay</h2>
              <p className={`text-xs font-bold uppercase tracking-[0.3em] transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Poi5eN • Engineering Lead</p>
            </div>

            <div className="flex gap-6">
              {[
                { icon: 'Linkedin', url: 'https://linkedin.com/in/poi5en', label: 'LinkedIn' },
                { icon: 'Twitter', url: 'https://x.com/poi5en', label: 'X' },
                { icon: 'MessageSquare', url: 'https://reddit.com/u/poi5en', label: 'Reddit' }
              ].map(social => {
                const SocialIcon = LucideIcons[social.icon] || LucideIcons.ExternalLink;
                return (
                  <a 
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all transform hover:scale-110 active:scale-95 group/icon ${isDark ? 'bg-white/5 border-white/5 text-white/40 hover:bg-blue-600 hover:text-white' : 'bg-black/[0.02] border-black/5 text-black/40 hover:bg-amber-600 hover:text-white'}`}
                    title={social.label}
                  >
                    <SocialIcon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`shrink-0 h-16 flex items-center justify-center px-8 text-[10px] font-medium tracking-[0.4em] uppercase transition-colors ${isDark ? 'text-white/10' : 'text-black/10'}`}>
        Nexus Operational Unit
      </footer>
    </div>
  );
}
