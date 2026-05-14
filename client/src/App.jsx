import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ImageStudio from './components/ImageStudio';
import VoyageView from './components/VoyageView';
import ResearchView from './components/ResearchView';
import SupportView from './components/SupportView';
import TutorView from './components/TutorView';
import MedView from './components/MedView';
import MovieView from './components/MovieView';
import LegalView from './components/LegalView';
import usePersonaStore from './stores/personaStore';

// Public Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import TeamPage from './pages/TeamPage';

export default function App() {
  const { activePersona, theme, isSidebarCollapsed } = usePersonaStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDark = theme === 'dark';

  const renderDashboardView = () => {
    switch (activePersona.id) {
      case 'travel': return <VoyageView />;
      case 'research': return <ResearchView />;
      case 'support': return <SupportView />;
      case 'image': return <ImageStudio />;
      case 'tutor': return <TutorView />;
      case 'medical': return <MedView />;
      case 'movies': return <MovieView />;
      case 'legal': return <LegalView />;
      case 'chatbot':
      default:
        return <ChatView />;
    }
  };

  return (
    <div className={`transition-colors duration-700 ${isDark ? 'bg-[#020617] text-white' : 'bg-[#fdfdfc] text-[#1a1a1a]'}`}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/team" element={<TeamPage />} />
        
        {/* Dashboard Route */}
        <Route path="/app" element={
          <div className={`flex flex-col md:flex-row gap-4 lg:gap-6 max-w-[1920px] mx-auto w-full h-screen overflow-hidden md:p-4 lg:p-6 transition-colors duration-700 ${isDark ? 'bg-[#020617]' : 'bg-[#f8f8f7]'}`}>
            
            {/* Mobile Header */}
            <div className={`md:hidden flex items-center justify-between p-4 z-[60] shrink-0 border-b transition-colors ${isDark ? 'bg-black/40 backdrop-blur-xl border-white/5' : 'bg-white border-black/5'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-blue-500' : 'bg-amber-600'}`}>
                  <LucideIcons.Layers className="w-5 h-5 text-white" />
                </div>
                <span className={`font-black text-lg tracking-tighter italic uppercase transition-colors ${isDark ? 'text-white' : 'text-black'}`}>Nexus</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-xl border transition-colors ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/5 text-black'}`}
              >
                {isMobileMenuOpen ? <LucideIcons.X className="w-6 h-6" /> : <LucideIcons.Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Sidebar - Desktop & Mobile Overlay */}
            <div className={`
              fixed md:relative inset-0 z-[100] md:z-auto transition-all duration-500 ease-in-out
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
              md:flex md:h-full shrink-0 ${isSidebarCollapsed ? 'md:w-24' : 'md:w-72'}
            `}>
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm md:hidden" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
              
              <div className="relative w-full h-full flex flex-col">
                <Sidebar onPersonaSelect={() => setIsMobileMenuOpen(false)} />
              </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 h-full overflow-hidden relative">
              <div className="h-full w-full">
                {renderDashboardView()}
              </div>
            </main>
          </div>
        } />
      </Routes>
    </div>
  );
}
