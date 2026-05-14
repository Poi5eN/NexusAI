import { create } from 'zustand';

export const PERSONAS = [
  { id: 'chatbot',  label: 'Genius Friend',      icon: '🧠', color: '#a855f7' },
  { id: 'travel',   label: 'Travel Planner',      icon: '✈️', color: '#10b981' },
  { id: 'research', label: 'Research Analyst',    icon: '🔬', color: '#f59e0b' },
  { id: 'support',  label: 'Customer Support',    icon: '💬', color: '#38bdf8' },
  { id: 'image',    label: 'Image Studio',        icon: '🎨', color: '#ec4899' },
];

const usePersonaStore = create((set) => ({
  activePersona: PERSONAS[0],
  setPersona: (persona) => set({ activePersona: persona }),
}));

export default usePersonaStore;
