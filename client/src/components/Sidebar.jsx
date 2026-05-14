import { useState } from 'react';
import usePersonaStore, { PERSONAS } from '../stores/personaStore';
import * as LucideIcons from 'lucide-react';
import SettingsModal from './SettingsModal';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ onOpenSettings }) {
  const { activePersona, setPersona, theme, isSidebarCollapsed, setIsSidebarCollapsed } = usePersonaStore();
  const isDark = theme === 'dark';

  return (
    <aside 
      className={`rounded-[32px] p-5 flex flex-col h-full transition-all duration-500 relative border shadow-2xl ${
        isSidebarCollapsed ? 'w-20 items-center' : 'w-64'
      } ${isDark ? 'glass border-white/10' : 'bg-white border-black/5'}`}
    >
      <button 
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className={`absolute -right-4 top-10 border rounded-full p-1.5 transition-colors z-[70] shadow-xl ${isDark ? 'bg-[#1e293b] border-white/10' : 'bg-white border-black/5'}`}
      >
        <LucideIcons.ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''} ${isDark ? 'text-white' : 'text-black/60'}`} />
      </button>

      <div className="mb-10 flex flex-col items-center w-full">
        {!isSidebarCollapsed ? (
          <div className="w-full flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-extrabold tracking-tighter transition-colors ${isDark ? 'bg-gradient-to-r from-white to-blue-500 bg-clip-text text-transparent' : 'text-black'}`}>
                NEXUS
              </h1>
              <p className={`text-[10px] mt-1 font-mono uppercase tracking-wider transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>AI Platform</p>
            </div>
            <ThemeToggle />
          </div>
        ) : (
          <div className="space-y-4 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-lg ${isDark ? 'bg-gradient-to-br from-white to-blue-500 text-black' : 'bg-black text-white'}`}>
              N
            </div>
            <ThemeToggle />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto overflow-x-hidden no-scrollbar pb-6">
        {!isSidebarCollapsed && <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-1 pl-2 ${isDark ? 'text-white/30' : 'text-black/20'}`}>Personas</h3>}
        {PERSONAS.map(persona => {
          const isActive = activePersona.id === persona.id;
          const IconComponent = LucideIcons[persona.icon] || LucideIcons.Circle;
          
          return (
            <button
              key={persona.id}
              onClick={() => setPersona(persona)}
              className={`flex items-center gap-4 w-full p-3 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? (isDark ? 'bg-white/10 border-white/10' : 'bg-black/5 border-black/5 shadow-sm') 
                  : 'bg-transparent border border-transparent hover:bg-black/5 opacity-70 hover:opacity-100'
              } ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}
              title={isSidebarCollapsed ? persona.label : undefined}
            >
              <div 
                className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-500 ${
                  isActive ? 'shadow-lg' : 'group-hover:shadow-md'
                }`}
                style={{ 
                  backgroundColor: isActive ? `${persona.color}${isDark ? '33' : '11'}` : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
                  color: isActive ? persona.color : (isDark ? '#fff' : '#000'),
                  boxShadow: isActive ? `0 0 20px ${persona.color}${isDark ? '40' : '20'}` : 'none'
                }}
              >
                <IconComponent className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {!isSidebarCollapsed && (
                <div className="text-left overflow-hidden">
                  <div className={`font-semibold text-sm whitespace-nowrap transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{persona.label}</div>
                  <div className={`text-[10px] truncate transition-colors ${isDark ? 'text-white/40' : 'text-black/30'}`}>{persona.description}</div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className={`p-4 border-t mt-auto space-y-4 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
        <button 
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group ${isSidebarCollapsed ? 'justify-center' : ''} ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
        >
          <LucideIcons.Settings className={`w-5 h-5 transition-colors group-hover:rotate-90 ${isDark ? 'text-white/30 group-hover:text-white' : 'text-black/30 group-hover:text-black'}`} />
          {!isSidebarCollapsed && <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-white/30 group-hover:text-white' : 'text-black/30 group-hover:text-black'}`}>Settings</span>}
        </button>

        <div className={`flex items-center justify-between ${isSidebarCollapsed ? 'flex-col gap-4' : ''}`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`}>System Online</span>
            </div>
          )}
          {isSidebarCollapsed && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />}
          <LucideIcons.ShieldCheck className={`w-4 h-4 transition-colors ${isDark ? 'text-white/10' : 'text-black/10'}`} />
        </div>
      </div>

    </aside>
  );
}
