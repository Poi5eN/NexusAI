import { useState } from 'react';
import usePersonaStore, { PERSONAS } from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import SettingsModal from './SettingsModal';

export default function Sidebar() {
  const { activePersona, setPersona } = usePersonaStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <aside 
      className={`glass rounded-3xl p-6 flex flex-col h-[calc(100vh-100px)] transition-all duration-500 relative ${
        isCollapsed ? 'w-24 items-center' : 'w-72'
      }`}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-10 bg-[#1e293b] hover:bg-white/20 border border-white/10 rounded-full p-1.5 transition-colors z-10 shadow-xl"
      >
        <LucideIcons.ChevronLeft className={`w-4 h-4 text-white transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      <div className="mb-10 flex flex-col items-center">
        {!isCollapsed ? (
          <div className="w-full">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-blue-500 bg-clip-text text-transparent tracking-tighter">
              NEXUS
            </h1>
            <p className="text-sm text-white/40 mt-1 font-mono uppercase tracking-wider">AI Platform</p>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-blue-500 flex items-center justify-center font-black text-black shadow-lg">
            N
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto overflow-x-hidden no-scrollbar pb-6">
        {!isCollapsed && <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1 pl-2">Personas</h3>}
        {PERSONAS.map(persona => {
          const isActive = activePersona.id === persona.id;
          const IconComponent = LucideIcons[persona.icon] || LucideIcons.Circle;
          
          return (
            <button
              key={persona.id}
              onClick={() => setPersona(persona)}
              className={`flex items-center gap-4 w-full p-3 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10 scale-100' 
                  : 'bg-transparent border border-transparent hover:bg-white/5 opacity-70 hover:opacity-100 scale-95 hover:scale-100'
              } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
              title={isCollapsed ? persona.label : undefined}
            >
              <div 
                className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-500 ${
                  isActive ? 'shadow-lg' : 'group-hover:shadow-md'
                }`}
                style={{ 
                  backgroundColor: isActive ? `${persona.color}33` : 'rgba(255,255,255,0.05)',
                  color: isActive ? persona.color : '#fff',
                  boxShadow: isActive ? `0 0 20px ${persona.color}40` : 'none'
                }}
              >
                <IconComponent className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {!isCollapsed && (
                <div className="text-left overflow-hidden">
                  <div className="font-semibold text-sm whitespace-nowrap text-white">{persona.label}</div>
                  <div className="text-xs text-white/40 truncate">{persona.description}</div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 mt-auto space-y-4">
        {/* Settings Button */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className={`w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LucideIcons.Settings className={`w-5 h-5 text-white/30 group-hover:text-white transition-colors ${isSettingsOpen ? 'animate-spin-slow text-white' : ''}`} />
          {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-colors">Settings</span>}
        </button>

        <div className={`flex items-center justify-between ${isCollapsed ? 'flex-col gap-4' : ''}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">System Status</span>
            </div>
          )}
          {isCollapsed && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />}
          <LucideIcons.ShieldCheck className="w-4 h-4 text-white/10" />
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </aside>
  );
}
