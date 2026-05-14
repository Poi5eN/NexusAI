import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <LucideIcons.Layers className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase italic">Nexus</span>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-sm font-bold text-white/50 hover:text-white transition-colors">Home</Link>
            <Link to="/about" className="text-sm font-bold text-blue-400 transition-colors">About</Link>
            <Link to="/team" className="text-sm font-bold text-white/50 hover:text-white transition-colors">Team</Link>
            <Link to="/app" className="bg-white text-black px-6 py-2.5 rounded-full font-black text-sm hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 active:scale-95">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="pt-40 pb-20 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-12">
            Democratizing <br />
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Specialized Intelligence.</span>
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6 text-lg text-white/60 font-medium leading-relaxed">
              <p>
                Nexus was born from a simple observation: AI is generic, but the world is specialized. Most models try to be everything to everyone, resulting in "jack of all trades, master of none."
              </p>
              <p>
                We built a platform that curates specialized personas—from medical research assistants to legal fact-checkers—each equipped with a unique cognitive toolkit and world-class interface designed specifically for that domain.
              </p>
            </div>
            
            <div className="glass p-10 rounded-[40px] border border-white/5 bg-white/[0.02]">
              <h3 className="text-xl font-black mb-4">Our Vision</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-8">
                To create a world where expert-level knowledge is accessible to everyone, powered by an army of specialized AI agents working in harmony.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                  <LucideIcons.Target className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-emerald-400">Accuracy</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest">Fact-checked outputs</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
