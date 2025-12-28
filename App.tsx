import React, { useState } from 'react';
import CampaignInputForm from './components/CampaignInput';
import PlanViewer from './components/PlanViewer';
import ToolsPanel from './components/ToolsPanel';
import { generateCampaignPlan, researchBrand, generateAssetImage, generateAssetVideo } from './services/geminiService';
import { CampaignInput, CampaignPlan, GeneratedAsset } from './types';

const App: React.FC = () => {
  const [plan, setPlan] = useState<CampaignPlan | null>(null);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [assetLoading, setAssetLoading] = useState(false);
  const [showTools, setShowTools] = useState(false);

  const handleCampaignSubmit = async (input: CampaignInput) => {
    try {
      setLoadingStage('Analyzing Brand DNA...');
      let researchData = '';
      
      if (input.websiteUrl) {
        setLoadingStage('Grounding with Google Search...');
        researchData = await researchBrand(input.websiteUrl);
      }

      setLoadingStage('Architecting Campaign Strategy...');
      const generatedPlan = await generateCampaignPlan(input, researchData);
      setPlan(generatedPlan);
      setLoadingStage('');
    } catch (error) {
      console.error(error);
      alert('Failed to generate campaign. Please check console.');
      setLoadingStage('');
    }
  };

  const handleGenerateImage = async (prompt: string, label: string) => {
    setAssetLoading(true);
    try {
      const url = await generateAssetImage(prompt, { size: '1K', aspectRatio: '1:1' });
      setGeneratedAssets(prev => [...prev, { type: 'image', url, promptUsed: prompt, timestamp: Date.now() }]);
    } catch (e) {
      console.error(e);
      alert("Failed to generate image. Please ensure you have selected a valid API key project.");
    } finally {
      setAssetLoading(false);
    }
  };

  const handleGenerateVideo = async (prompt: string, label: string) => {
    setAssetLoading(true);
    try {
      // Use the aspect ratio from the plan or default to 16:9
      const ratio = plan?.aspectRatio || '16:9';
      const url = await generateAssetVideo(prompt, { resolution: '720p', aspectRatio: ratio });
      setGeneratedAssets(prev => [...prev, { type: 'video', url, promptUsed: prompt, timestamp: Date.now() }]);
    } catch (e: any) {
      console.error(e);
      let msg = "Failed to generate video.";
      if (e.message?.includes("Requested entity was not found")) {
        msg += " Please ensure you select a Paid Google Cloud Project when prompted.";
      } else {
        msg += " Veo requires a billing-enabled project.";
      }
      alert(msg);
    } finally {
      setAssetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-purple-900/50">
              V
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">VideoInsight Ultra</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Campaign Architect</p>
            </div>
          </div>
          <button 
            onClick={() => setShowTools(!showTools)}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            {showTools ? 'Back to Campaign' : 'Open Creative Studio'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {showTools ? (
            <div className="max-w-2xl mx-auto">
               <ToolsPanel />
            </div>
        ) : (
          <>
            {!plan && !loadingStage && (
              <div className="mt-10 animate-fade-in-up">
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mb-4">
                    Architect Your Next Viral Campaign
                  </h2>
                  <p className="text-zinc-400 max-w-lg mx-auto">
                    Synthesize visual anchors, brand essence, and target demographics into high-fidelity Veo videos and Nano Banana Pro imagery.
                  </p>
                </div>
                <CampaignInputForm onSubmit={handleCampaignSubmit} isLoading={!!loadingStage} />
              </div>
            )}

            {loadingStage && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xl font-mono text-purple-400 animate-pulse">{loadingStage}</p>
              </div>
            )}

            {plan && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                   <div className="flex justify-between items-end mb-6">
                      <h2 className="text-2xl font-bold text-white">Campaign Blueprint</h2>
                      <button onClick={() => setPlan(null)} className="text-sm text-zinc-500 hover:text-red-400">Reset</button>
                   </div>
                   <PlanViewer 
                      plan={plan} 
                      onGenerateImage={handleGenerateImage} 
                      onGenerateVideo={handleGenerateVideo} 
                      isGeneratingAsset={assetLoading}
                      generatedAssets={generatedAssets}
                   />
                </div>
                <div className="lg:col-span-1 sticky top-24 h-fit">
                    <ToolsPanel />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;