export interface CampaignInput {
  productImage: File | null;
  brandDescription: string;
  websiteUrl: string;
  targetAudience: string;
  videoConstraints: string;
  videoAspectRatio: '16:9' | '9:16';
}

export interface GeneratedAsset {
  type: 'image' | 'video';
  url: string;
  promptUsed: string;
  timestamp: number;
}

export interface CampaignPlan {
  aspectRatio: '16:9' | '9:16';
  visualAnchors: string[];
  brandEssence: string;
  strategyAlignment: string;
  concept: {
    title: string;
    hook: string;
    visualDirection: string;
    narrativeSummary?: string;
  };
  imagePrompts: {
    label: string;
    prompt: string;
  }[];
  script: {
    sceneLabel: string;
    dialogue: string;
    audioCues: string;
  }[];
  storyboard: {
    scene: string;
    description: string;
  }[];
  videoPrompts: {
    label: string;
    prompt: string;
  }[];
}

export interface VeoConfig {
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export interface ImageGenConfig {
  size: '1K' | '2K' | '4K';
  aspectRatio: '1:1' | '16:9' | '9:16' | '3:4' | '4:3';
}