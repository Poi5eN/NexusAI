import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ImageStudio from './components/ImageStudio';
import usePersonaStore from './stores/personaStore';

export default function App() {
  const { activePersona } = usePersonaStore();

  return (
    <div className="flex gap-6 max-w-[1400px] mx-auto w-full pt-[50px] px-6">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {activePersona.id === 'image' ? <ImageStudio /> : <ChatView />}
      </main>
    </div>
  );
}
