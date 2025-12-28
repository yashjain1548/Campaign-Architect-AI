import React, { useState } from 'react';
import { CampaignInput } from '../types';

interface Props {
  onSubmit: (data: CampaignInput) => void;
  isLoading: boolean;
}

const CampaignInputForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CampaignInput>({
    productImage: null,
    brandDescription: '',
    websiteUrl: '',
    targetAudience: '',
    videoConstraints: '4k, Cinematic lighting, Slow motion',
    videoAspectRatio: '16:9',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, productImage: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-purple-500">✦</span> Start Campaign Analysis
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Product Image (Required)</label>
          <div className="relative border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              required
            />
            {formData.productImage ? (
              <div className="text-purple-400 font-medium truncate">{formData.productImage.name}</div>
            ) : (
              <div className="text-zinc-500">Drag & drop or click to upload</div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Brand Description</label>
          <textarea
            name="brandDescription"
            value={formData.brandDescription}
            onChange={handleChange}
            required
            placeholder="e.g. A futuristic sneaker brand focused on urban agility..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none h-24"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Target Audience</label>
            <input
              type="text"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              required
              placeholder="e.g. Gen Z, Tech enthusiasts"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-zinc-400 mb-1">Website URL (Optional)</label>
            <input
              type="url"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-400 mb-1">Video Constraints</label>
            <input
              type="text"
              name="videoConstraints"
              value={formData.videoConstraints}
              onChange={handleChange}
              required
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Aspect Ratio</label>
            <div className="relative">
              <select
                name="videoAspectRatio"
                // @ts-ignore
                value={formData.videoAspectRatio}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none appearance-none"
              >
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
            isLoading 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/20'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Architecting Campaign...
            </span>
          ) : (
            'Generate Campaign Strategy'
          )}
        </button>
      </form>
    </div>
  );
};

export default CampaignInputForm;