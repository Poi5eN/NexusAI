import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import usePersonaStore from '../stores/personaStore';

export default function SettingsModal({ isOpen, onClose }) {
  const { theme, toggleTheme } = usePersonaStore();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`relative w-full max-w-xl rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden border transition-colors duration-500 ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-black/5'}`}
      >
        {/* Header */}
        <div className={`p-6 md:p-8 border-b flex items-center justify-between transition-colors ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-colors ${isDark ? 'bg-white/5 text-white/40' : 'bg-black/5 text-black/40'}`}>
              <LucideIcons.Settings className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className={`text-lg md:text-xl font-black transition-colors ${isDark ? 'text-white' : 'text-black'}`}>System Settings</h2>
              <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-white/30' : 'text-black/30'}`}>Configure environment</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 hover:bg-black/5 rounded-full transition-all ${isDark ? 'text-white/40' : 'text-black/40'}`}>
            <LucideIcons.X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Settings List */}
        <div className="p-6 md:p-10 space-y-8 md:space-y-10 max-h-[60vh] overflow-y-auto no-scrollbar">
          <section className="space-y-6">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-sm font-black mb-1 transition-colors ${isDark ? 'text-white' : 'text-black'}`}>Light Mode Interface</h4>
                <p className={`text-[10px] md:text-xs transition-colors ${isDark ? 'text-white/40' : 'text-black/40'}`}>Switch between minimal and studio themes.</p>
              </div>
              <button 
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${theme === 'light' ? 'bg-amber-600' : 'bg-white/10'}`}
              >
                <motion.div 
                  animate={{ x: theme === 'light' ? 24 : 4 }}
                  className="w-4 h-4 bg-white rounded-full absolute top-1"
                />
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>AI Intelligence</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between opacity-50">
                <div>
                  <h4 className={`text-sm font-black mb-1 transition-colors ${isDark ? 'text-white' : 'text-black'}`}>Strict Fact-Checking</h4>
                  <p className={`text-[10px] md:text-xs transition-colors ${isDark ? 'text-white/40' : 'text-black/40'}`}>Verify claims via web search.</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative p-1 cursor-not-allowed ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                  <div className={`w-4 h-4 rounded-full ${isDark ? 'bg-white/20' : 'bg-black/20'}`} />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-4">
            <div className={`p-6 rounded-2xl md:rounded-3xl border transition-colors ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
              <div className="flex items-center gap-4 mb-4">
                <LucideIcons.Database className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-amber-600'}`} />
                <h4 className={`text-sm font-black transition-colors ${isDark ? 'text-white' : 'text-black'}`}>System Purge</h4>
              </div>
              <p className={`text-[10px] md:text-xs mb-6 leading-relaxed transition-colors ${isDark ? 'text-white/30' : 'text-black/30'}`}>Wipe local cache and history. This action is irreversible.</p>
              <button className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/20">
                Execute Wipe
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className={`p-6 md:p-8 border-t flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center transition-colors ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
          <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>Core v1.0.4-α</span>
          <button 
            onClick={onClose}
            className={`w-full md:w-auto px-10 py-3 font-black text-[10px] uppercase tracking-widest rounded-xl md:rounded-2xl transition-all shadow-xl ${isDark ? 'bg-white text-black hover:bg-blue-600 hover:text-white' : 'bg-[#1a1a1a] text-white hover:bg-black'}`}
          >
            Save Configuration
          </button>
        </div>
      </motion.div>
    </div>
  );
}
