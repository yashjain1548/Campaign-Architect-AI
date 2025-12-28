import React, { useState } from 'react';
import { editImage, generateAssetVideo } from '../services/geminiService';

const ToolsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edit' | 'animate'>('edit');
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      setResult(null);
    }
  };

  const handleAction = async () => {
    if (!image) return;
    setIsLoading(true);
    setResult(null);

    try {
      if (activeTab === 'edit') {
        const res = await editImage(image, prompt);
        setResult(res);
      } else {
        // Animate
        const res = await generateAssetVideo(prompt || "Animate this image naturally", {
            aspectRatio: '16:9',
            resolution: '720p'
        }, image);
        setResult(res);
      }
    } catch (e) {
      console.error(e);
      alert("Operation failed. Ensure you have selected a paid API key for Veo operations.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <h3 className="text-lg font-bold text-white mb-4">Creative Studio</h3>
      
      <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2">
        <button 
          onClick={() => { setActiveTab('edit'); setResult(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'edit' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
        >
          Magic Editor
        </button>
        <button 
          onClick={() => { setActiveTab('animate'); setResult(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'animate' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
        >
          Image to Video
        </button>
      </div>

      <div className="space-y-4">
        <div>
           <label className="block text-xs font-medium text-zinc-400 mb-2">Source Image</label>
           <input type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"/>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            {activeTab === 'edit' ? 'Editing Instruction' : 'Animation Prompt'}
          </label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={activeTab === 'edit' ? "e.g., Make it look like a sketch, remove background..." : "e.g., Pan slowly right, water flowing..."}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white text-sm h-24 focus:ring-1 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleAction}
          disabled={isLoading || !image}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-sm font-bold transition-all"
        >
          {isLoading ? 'Processing...' : (activeTab === 'edit' ? 'Generate Edit' : 'Generate Video')}
        </button>

        {result && (
          <div className="mt-4 p-2 bg-zinc-950 rounded-lg border border-zinc-800">
            <p className="text-xs text-green-400 mb-2">Result Ready:</p>
            {activeTab === 'edit' ? (
              <img src={result} alt="Result" className="w-full rounded" />
            ) : (
              <video src={result} controls className="w-full rounded" />
            )}
            <a href={result} download className="block text-center text-xs text-zinc-500 mt-2 underline">Download</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPanel;
