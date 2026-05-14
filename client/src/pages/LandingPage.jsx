import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <LucideIcons.Layers className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase italic">Nexus</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-sm font-bold hover:text-blue-400 transition-colors">Home</Link>
            <Link to="/about" className="text-sm font-bold text-white/50 hover:text-white transition-colors">About</Link>
            <Link to="/team" className="text-sm font-bold text-white/50 hover:text-white transition-colors">Team</Link>
            <button 
              onClick={() => navigate('/app')}
              className="bg-white text-black px-6 py-2.5 rounded-full font-black text-sm hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.3em] uppercase text-blue-400 mb-8">
              The Future of Specialized Intelligence
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              Next-Gen AI <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Studio Platform.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/40 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
              Experience a suite of specialized AI personas designed for high-performance workflows. From medical insights to voyage planning, NEXUS is your ultimate cognitive partner.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => navigate('/app')}
                className="group relative px-10 py-5 bg-white text-black font-black text-lg rounded-[24px] hover:bg-blue-500 hover:text-white transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-3">
                  Launch Nexus Studio <LucideIcons.ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-lg rounded-[24px] hover:bg-white/10 transition-all">
                Explore Personas
              </button>
            </div>
          </motion.div>

          {/* Floating UI Cards Preview */}
          <div className="mt-32 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="relative z-10 glass rounded-[40px] border border-white/10 shadow-2xl p-4 overflow-hidden aspect-[16/9] max-w-5xl mx-auto bg-black/40"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-20 pointer-events-none" />
              <div className="w-full h-full rounded-[32px] overflow-hidden bg-black/60 p-8 flex items-center justify-center">
                 <LucideIcons.Cpu className="w-32 h-32 text-blue-500/20 animate-spin-slow" />
              </div>
            </motion.div>
            
            {/* Decorative elements */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: 'ShieldCheck', title: 'Enterprise Legal', desc: 'Expert legal document analysis and fact-checking at your fingertips.' },
            { icon: 'Activity', title: 'Medical Insights', desc: 'Fact-based medical research and health data synthesis.' },
            { icon: 'GraduationCap', title: 'Academic Tutor', desc: 'Advanced tutoring for complex science, math, and humanities.' }
          ].map((f, i) => {
            const Icon = LucideIcons[f.icon];
            return (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 glass rounded-[40px] border border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-500 group-hover:text-black transition-all">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-4">{f.title}</h3>
                <p className="text-white/40 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <LucideIcons.Layers className="w-5 h-5 text-white/50" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic opacity-50">Nexus</span>
          </div>
          <div className="flex gap-10 text-xs font-black uppercase tracking-widest text-white/20">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">API docs</a>
          </div>
          <div className="text-xs font-black uppercase tracking-widest text-white/20">
            © 2026 Nexus AI Platform. Built for the future.
          </div>
        </div>
      </footer>
    </div>
  );
}
