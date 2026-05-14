import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ImageStudio from './components/ImageStudio';
import VoyageView from './components/VoyageView';
import ResearchView from './components/ResearchView';
import SupportView from './components/SupportView';
import usePersonaStore from './stores/personaStore';

export default function App() {
  const { activePersona } = usePersonaStore();

  const renderView = () => {
    switch (activePersona.id) {
      case 'travel': return <VoyageView />;
      case 'research': return <ResearchView />;
      case 'support': return <SupportView />;
      case 'image': return <ImageStudio />;
      case 'chatbot':
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex gap-6 max-w-[1600px] mx-auto w-full pt-[50px] px-6 h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
        {renderView()}
      </main>
    </div>
  );
}
