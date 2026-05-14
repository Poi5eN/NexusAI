import usePersonaStore, { PERSONAS } from '../stores/personaStore';

export default function Sidebar() {
  const { activePersona, setPersona } = usePersonaStore();

  return (
    <aside className="w-72 glass rounded-3xl p-6 flex flex-col h-[calc(100vh-100px)]">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-[var(--color-brand-500)] bg-clip-text text-transparent tracking-tighter">
          NEXUS
        </h1>
        <p className="text-sm text-white/40 mt-1 font-mono uppercase tracking-wider">AI Platform</p>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2 pl-2">Personas</h3>
        {PERSONAS.map(persona => {
          const isActive = activePersona.id === persona.id;
          return (
            <button
              key={persona.id}
              onClick={() => setPersona(persona)}
              className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all duration-300 text-left ${
                isActive 
                  ? 'bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10 scale-100' 
                  : 'bg-transparent border border-transparent hover:bg-white/5 opacity-60 hover:opacity-100 scale-95 hover:scale-100'
              }`}
            >
              <span className="text-2xl drop-shadow-md">{persona.icon}</span>
              <span className="font-semibold text-sm">{persona.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 text-xs text-white/30 flex justify-between items-center px-2">
        <span>System Status</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
        </span>
      </div>
    </aside>
  );
}
