import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const PERSONAS = [
  { 
    id: 'chatbot',  
    label: 'Nexus Assistant',      
    icon: 'Bot', 
    color: '#3b82f6', 
    description: 'Core conversational AI agent',
    capabilities: 'Multi-modal reasoning, real-time research, and advanced context management.',
    integration: 'Seamlessly connects with all Nexus core modules for unified intelligence.'
  },
  { 
    id: 'travel',   
    label: 'Voyage Architect',     
    icon: 'Map', 
    color: '#10b981', 
    description: 'Itinerary builder & trip planner',
    capabilities: 'Live flight/hotel tracking, localized event discovery, and budget optimization.',
    integration: 'Utilizes Google Maps and Skyscanner APIs for real-time travel logistics.'
  },
  { 
    id: 'research', label: 'Deep Search',          
    icon: 'Search', 
    color: '#8b5cf6', 
    description: 'Web scraping research analyst',
    capabilities: 'Deep-web data extraction, competitive analysis, and automated reporting.',
    integration: 'Powered by multi-node scraping engines and real-time indexing.'
  },
  { 
    id: 'support',  
    label: 'Support Desk',         
    icon: 'Headset', 
    color: '#f59e0b', 
    description: 'RAG-powered knowledge base',
    capabilities: 'Semantic document retrieval, automated ticketing, and 24/7 autonomous support.',
    integration: 'Direct integration with Notion, Slack, and internal documentation.'
  },
  { 
    id: 'image',    
    label: 'Vision Canvas',        
    icon: 'ImagePlus', 
    color: '#ec4899', 
    description: 'High-res image generation studio',
    capabilities: 'Text-to-image synthesis, style transfer, and architectural visualization.',
    integration: 'Leverages HuggingFace FLUX and Stable Diffusion XL pipelines.'
  },
  { 
    id: 'tutor',    
    label: 'Academic Tutor',       
    icon: 'GraduationCap', 
    color: '#6366f1', 
    description: 'AI academic & tutor helper',
    capabilities: 'STEM problem solving, essay grading, and personalized learning paths.',
    integration: 'Synced with Wolfram Alpha and academic research databases.'
  },
  { 
    id: 'medical',  
    label: 'Medical Assistant',    
    icon: 'Stethoscope', 
    color: '#ef4444', 
    description: 'Fact-based medical information',
    capabilities: 'Symptom analysis, clinical study retrieval, and dosage cross-referencing.',
    integration: 'Knowledge-mapped to PubMed and specialized medical taxonomies.'
  },
  { 
    id: 'movies',   
    label: 'Cinephile Expert',     
    icon: 'Film', 
    color: '#facc15', 
    description: 'Movie recommendations & planning',
    capabilities: 'Live cinema showtimes, deep filmography lookups, and personalized trailers.',
    integration: 'Connected to TMDB and local ticketing platforms for real-time booking.'
  },
  { 
    id: 'legal',    
    label: 'Legal Helper',         
    icon: 'Scale', 
    color: '#94a3b8', 
    description: 'Legal document & fact assistance',
    capabilities: 'Bhartiya Nyaya Samhita expertise, case law search, and contract auditing.',
    integration: 'Mapped to Indian Legal databases and international law frameworks.'
  },
  { 
    id: 'broker',   
    label: 'Stock Broker',         
    icon: 'TrendingUp', 
    color: '#06b6d4', 
    description: 'Real-time market analysis & trends',
    capabilities: 'Indian & Global market tracking, technical analysis, and portfolio signals.',
    integration: 'Real-time data streams from Yahoo Finance and Indian Market exchanges.'
  },
];

const usePersonaStore = create(
  persist(
    (set) => ({
      activePersona: PERSONAS[0],
      theme: 'light',
      isSidebarCollapsed: false,
      setPersona: (persona) => set({ activePersona: persona }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setIsSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
    }),
    {
      name: 'nexus-persona-store',
    }
  )
);

export default usePersonaStore;
