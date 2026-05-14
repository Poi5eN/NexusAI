import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

export default function TeamPage() {
  const team = [
    { name: 'Alex Rivera', role: 'Founder & AI Architect', icon: 'Cpu' },
    { name: 'Sarah Chen', role: 'Lead Design Engineer', icon: 'Palette' },
    { name: 'Marcus Thorne', role: 'Head of Persona Strategy', icon: 'BrainCircuit' },
    { name: 'Elena Vance', role: 'Legal & Ethics Lead', icon: 'Scale' }
  ];

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
            <Link to="/about" className="text-sm font-bold text-white/50 hover:text-white transition-colors">About</Link>
            <Link to="/team" className="text-sm font-bold text-blue-400 transition-colors">Team</Link>
            <Link to="/app" className="bg-white text-black px-6 py-2.5 rounded-full font-black text-sm hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 active:scale-95">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            The Minds <br />
            <span className="bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">Behind the Core.</span>
          </h1>
          <p className="text-xl text-white/40 font-medium max-w-2xl mx-auto leading-relaxed">
            A small team of obsessive engineers and designers building the foundation of specialized AGI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => {
            const Icon = LucideIcons[member.icon];
            return (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="p-8 glass rounded-[40px] border border-white/5 bg-white/[0.02] flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500/10 to-rose-600/10 rounded-[32px] flex items-center justify-center mb-8 border border-white/5 group-hover:border-pink-500/30 transition-all">
                  <Icon className="w-12 h-12 text-pink-500/50 group-hover:text-pink-500 transition-colors" />
                </div>
                <h3 className="text-xl font-black mb-2">{member.name}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">{member.role}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
