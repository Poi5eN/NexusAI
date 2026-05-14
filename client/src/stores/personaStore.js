import { create } from 'zustand';

export const PERSONAS = [
  { id: 'chatbot',  label: 'Nexus Assistant',      icon: 'Bot', color: '#3b82f6', description: 'Core conversational AI agent' },
  { id: 'travel',   label: 'Voyage Architect',     icon: 'Map', color: '#10b981', description: 'Itinerary builder & trip planner' },
  { id: 'research', label: 'Deep Search',          icon: 'Search', color: '#8b5cf6', description: 'Web scraping research analyst' },
  { id: 'support',  label: 'Support Desk',         icon: 'Headset', color: '#f59e0b', description: 'RAG-powered knowledge base' },
  { id: 'image',    label: 'Vision Canvas',        icon: 'ImagePlus', color: '#ec4899', description: 'High-res image generation studio' },
  { id: 'tutor',    label: 'Academic Tutor',       icon: 'GraduationCap', color: '#6366f1', description: 'AI academic & tutor helper' },
  { id: 'medical',  label: 'Medical Assistant',    icon: 'Stethoscope', color: '#ef4444', description: 'Fact-based medical information' },
  { id: 'movies',   label: 'Cinephile Expert',     icon: 'Film', color: '#facc15', description: 'Movie recommendations & planning' },
  { id: 'legal',    label: 'Legal Helper',         icon: 'Scale', color: '#94a3b8', description: 'Legal document & fact assistance' },
];

const usePersonaStore = create((set) => ({
  activePersona: PERSONAS[0],
  theme: 'light',
  isSidebarCollapsed: false,
  setPersona: (persona) => set({ activePersona: persona }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setIsSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
}));

export default usePersonaStore;
