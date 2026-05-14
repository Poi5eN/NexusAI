import { Routes, Route, useLocation } from 'react-router-dom';
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
  const { activePersona } = usePersonaStore();
  const location = useLocation();

  // Helper to render the dashboard main content
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
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/team" element={<TeamPage />} />
      
      {/* Dashboard Route */}
      <Route path="/app" element={
        <div className="flex gap-6 max-w-[1600px] mx-auto w-full pt-[50px] px-6 h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
            {renderDashboardView()}
          </main>
        </div>
      } />
    </Routes>
  );
}
