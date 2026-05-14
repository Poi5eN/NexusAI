import { useState } from 'react';
import usePersonaStore from '../stores/personaStore';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export default function ImageStudio() {
  const { activePersona } = usePersonaStore();
  const [prompt, setPrompt] = useState('');
  const [enhance, setEnhance] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // If this is not the Image persona, do not render or render a message
  if (activePersona.id !== 'image') return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setImageUrl(null);
    setEnhancedPrompt('');

    try {
      const res = await fetch(`${API_URL}/api/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, enhance }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setImageUrl(data.image);
      setEnhancedPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] glass rounded-3xl overflow-hidden relative" data-persona="image">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-surface-glass)] flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎨</span>
          <div>
            <h2 className="font-bold text-lg">Image Studio</h2>
            <p className="text-xs text-white/50">Powered by FLUX.1 & OpenRouter</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        {/* Controls */}
        <form onSubmit={handleGenerate} className="w-full max-w-2xl bg-black/20 p-6 rounded-3xl border border-white/5 mb-8">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="Describe the image you want to create..."
            className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50 resize-none mb-4"
          />
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input 
                type="checkbox" 
                checked={enhance} 
                onChange={(e) => setEnhance(e.target.checked)} 
                disabled={isLoading}
                className="w-4 h-4 rounded border-white/20 text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              Auto-Enhance Prompt (AI Magic ✨)
            </label>
            
            <button 
              type="submit" 
              disabled={isLoading || !prompt.trim()}
              className="bg-[var(--accent)] text-black px-6 py-2 rounded-xl font-bold disabled:opacity-50 hover:scale-105 transition-transform flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                  Generating...
                </>
              ) : 'Generate'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="text-red-400 bg-red-400/10 p-4 rounded-xl text-sm max-w-2xl w-full text-center mb-8 border border-red-400/20">
            {error}
          </div>
        )}

        {/* Canvas / Result */}
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          {imageUrl ? (
            <div className="animate-in fade-in zoom-in duration-500 max-w-2xl w-full flex flex-col items-center gap-4">
              <img 
                src={imageUrl} 
                alt={enhancedPrompt} 
                className="rounded-2xl shadow-2xl shadow-black/50 border border-white/10 object-contain max-h-[500px]" 
              />
              {enhance && enhancedPrompt !== prompt && (
                <div className="bg-black/30 p-4 rounded-xl text-xs text-white/50 border border-white/5 text-center max-w-lg">
                  <span className="text-[var(--accent)] font-semibold block mb-1">✨ Enhanced Prompt:</span>
                  {enhancedPrompt}
                </div>
              )}
            </div>
          ) : (
            <div className="text-white/20 text-center flex flex-col items-center justify-center h-full">
              {!isLoading && !error && (
                <>
                  <span className="text-6xl mb-4 grayscale opacity-50">🖼️</span>
                  <p>Your creation will appear here</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
