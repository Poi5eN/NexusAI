import { create } from 'zustand';

export const PERSONAS = [
  { id: 'chatbot',  label: 'Nexus Assistant',      icon: 'Bot', color: '#3b82f6', description: 'Core conversational AI agent' },
  { id: 'travel',   label: 'Voyage Architect',     icon: 'Map', color: '#10b981', description: 'Itinerary builder & trip planner' },
  { id: 'research', label: 'Deep Search',          icon: 'Search', color: '#8b5cf6', description: 'Web scraping research analyst' },
  { id: 'support',  label: 'Support Desk',         icon: 'Headset', color: '#f59e0b', description: 'RAG-powered knowledge base' },
  { id: 'image',    label: 'Vision Canvas',        icon: 'ImagePlus', color: '#ec4899', description: 'High-res image generation studio' },
];

const usePersonaStore = create((set) => ({
  activePersona: PERSONAS[0],
  setPersona: (persona) => set({ activePersona: persona }),
}));

export default usePersonaStore;
