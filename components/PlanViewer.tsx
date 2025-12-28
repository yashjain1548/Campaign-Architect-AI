import React, { useState } from 'react';
import { CampaignPlan, GeneratedAsset } from '../types';

interface Props {
  plan: CampaignPlan;
  onGenerateImage: (prompt: string, label: string) => void;
  onGenerateVideo: (prompt: string, label: string) => void;
  isGeneratingAsset: boolean;
  generatedAssets: GeneratedAsset[];
}

const PlanViewer: React.FC<Props> = ({ 
  plan, 
  onGenerateImage, 
  onGenerateVideo,
  isGeneratingAsset,
  generatedAssets 
}) => {
  const [editedPrompts, setEditedPrompts] = useState<Record<string, string>>({});
  
  const getAsset = (prompt: string) => generatedAssets.find(a => a.promptUsed === prompt);
  
  // Helper to get either the edited prompt or original
  const getPrompt = (type: 'image' | 'video', index: number, original: string) => {
    return editedPrompts[`${type}-${index}`] ?? original;
  };

  const handleEdit = (type: 'image' | 'video', index: number, value: string) => {
    setEditedPrompts(prev => ({
      ...prev,
      [`${type}-${index}`]: value
    }));
  };

  const getSafeFilename = (label: string, ext: string) => {
    return `${label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${ext}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">Visual Anchors</h3>
          <ul className="list-disc list-inside space-y-1 text-zinc-300">
            {plan.visualAnchors.map((anchor, i) => (
              <li key={i}>{anchor}</li>
            ))}
          </ul>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">Brand Essence</h3>
          <p className="text-zinc-300">{plan.brandEssence}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">The Concept</h3>
          <div className="space-y-2">
            <p className="text-xl font-bold text-white">{plan.concept.title}</p>
            <p className="text-zinc-400 italic">"{plan.concept.hook}"</p>
            {plan.concept.narrativeSummary && (
              <div className="mt-3 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Story Arc</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                   {plan.concept.narrativeSummary}
                </p>
              </div>
            )}
            <div className="mt-2 text-xs text-zinc-500 border-t border-zinc-800 pt-2">
               Direction: {plan.concept.visualDirection}
            </div>
          </div>
        </div>
      </div>

      {/* Image Prompts */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="p-1 bg-blue-500/20 text-blue-400 rounded">Phase 3</span> 
          Nano Banana Pro Assets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plan.imagePrompts.map((item, i) => {
            const currentPrompt = getPrompt('image', i, item.prompt);
            const asset = getAsset(currentPrompt);
            
            return (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{item.label}</h4>
                    <span className="text-[10px] text-zinc-600 bg-zinc-900 border border-zinc-800 px-1 rounded">EDITABLE</span>
                  </div>
                  <textarea 
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded p-2 text-xs text-zinc-300 resize-none focus:outline-none focus:border-purple-500 mb-4 flex-1 min-h-[100px]"
                    value={currentPrompt}
                    onChange={(e) => handleEdit('image', i, e.target.value)}
                  />
                </div>
                
                {asset ? (
                  <div className="flex flex-col">
                    <div className="relative aspect-square bg-zinc-950">
                      <img src={asset.url} alt={item.label} className="w-full h-full object-cover" />
                    </div>
                     <div className="p-3 bg-zinc-950 border-t border-zinc-800">
                        <a 
                          href={asset.url} 
                          download={getSafeFilename(item.label, 'png')}
                          className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-800 hover:bg-zinc-700 hover:border-purple-500 text-white text-sm font-medium rounded-lg transition-colors border border-zinc-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download {item.label}
                        </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                    <button 
                      onClick={() => onGenerateImage(currentPrompt, item.label)}
                      disabled={isGeneratingAsset}
                      className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-600/50 rounded-lg text-sm font-medium transition-all"
                    >
                      Generate 4K Image
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Script Section */}
      {plan.script && plan.script.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="p-1 bg-amber-500/20 text-amber-400 rounded">Phase 4</span> 
            Script & Sonic Identity
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800">
            {plan.script.map((item, i) => (
              <div key={i} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                   <h4 className="text-sm font-bold text-amber-400">{item.sceneLabel}</h4>
                   <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">Scene {i+1}</p>
                </div>
                <div className="md:col-span-2">
                   <p className="text-xs text-zinc-400 font-medium mb-1 uppercase">Voiceover / Dialogue</p>
                   <p className="text-white text-sm leading-relaxed font-serif italic">"{item.dialogue}"</p>
                </div>
                <div className="md:col-span-1 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                   <p className="text-[10px] text-zinc-400 font-bold mb-1 uppercase flex items-center gap-1">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                     Audio Cues
                   </p>
                   <p className="text-xs text-zinc-300">{item.audioCues}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Prompts */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="p-1 bg-red-500/20 text-red-400 rounded">Phase 5</span> 
          Veo 3.1 Video Assets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plan.videoPrompts.map((item, i) => {
            const currentPrompt = getPrompt('video', i, item.prompt);
            const asset = getAsset(currentPrompt);
            
            return (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 flex flex-col flex-1">
                   <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{item.label}</h4>
                  </div>
                  <div className="mb-3 flex justify-between items-center">
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Scene {i + 1}</span>
                    <span className="text-[10px] text-zinc-600 bg-zinc-900 border border-zinc-800 px-1 rounded">EDITABLE</span>
                  </div>
                  <textarea 
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded p-2 text-xs text-zinc-300 resize-none focus:outline-none focus:border-purple-500 mb-4 flex-1 min-h-[80px]"
                    value={currentPrompt}
                    onChange={(e) => handleEdit('video', i, e.target.value)}
                  />
                </div>

                {asset ? (
                  <div className="flex flex-col">
                    <div className="aspect-video bg-zinc-950">
                      <video src={asset.url} controls className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 bg-zinc-950 border-t border-zinc-800">
                        <a 
                          href={asset.url} 
                          download={getSafeFilename(item.label, 'mp4')}
                          className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-800 hover:bg-zinc-700 hover:border-red-500 text-white text-sm font-medium rounded-lg transition-colors border border-zinc-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download Video
                        </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-950 border-t border-zinc-800 mt-auto">
                    <button 
                      onClick={() => onGenerateVideo(currentPrompt, item.label)}
                      disabled={isGeneratingAsset}
                      className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 rounded-lg text-sm font-medium transition-all"
                    >
                      Generate Video (Veo)
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlanViewer;