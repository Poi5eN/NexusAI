import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import usePersonaStore from '../stores/personaStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = usePersonaStore();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full transition-colors duration-500 flex items-center px-1 ${
        theme === 'light' ? 'bg-amber-100' : 'bg-blue-900/40'
      } border ${theme === 'light' ? 'border-amber-200' : 'border-blue-500/30'}`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className={`w-5 h-5 rounded-full flex items-center justify-center ${
          theme === 'light' ? 'bg-amber-500 ml-0' : 'bg-blue-500 ml-7'
        } shadow-lg`}
      >
        <AnimatePresence mode="wait">
          {theme === 'light' ? (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <LucideIcons.Sun className="w-3 h-3 text-white fill-white" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <LucideIcons.Moon className="w-3 h-3 text-white fill-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
