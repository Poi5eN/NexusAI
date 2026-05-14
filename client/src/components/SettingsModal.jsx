import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                <LucideIcons.Settings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">System Settings</h2>
                <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Configure your Nexus environment</p>
              </div>
            </div>
            <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-full transition-all">
              <LucideIcons.X className="w-6 h-6 text-white/40" />
            </button>
          </div>

          {/* Settings List */}
          <div className="p-10 space-y-10 max-h-[60vh] overflow-y-auto no-scrollbar">
            <section className="space-y-6">
              <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">Appearance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white mb-1">Dark Mode Preference</h4>
                  <p className="text-xs text-white/40">Optimize UI for low-light environments.</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">AI Intelligence</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white mb-1">Strict Fact-Checking</h4>
                    <p className="text-xs text-white/40">Forces models to verify claims via search.</p>
                  </div>
                  <div className="w-12 h-6 bg-white/10 rounded-full relative p-1 cursor-not-allowed opacity-50">
                    <div className="w-4 h-4 bg-white/20 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white mb-1">Creative Reasoning</h4>
                    <p className="text-xs text-white/40">Allow more fluid, generative responses.</p>
                  </div>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-4">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <LucideIcons.Database className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-black text-white">Local Data Purge</h4>
                </div>
                <p className="text-xs text-white/30 mb-6 leading-relaxed">Delete all local chat history and cached persona data. This action cannot be undone.</p>
                <button className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/20">
                  Wipe System Data
                </button>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Build v1.0.4-alpha</span>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl"
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
