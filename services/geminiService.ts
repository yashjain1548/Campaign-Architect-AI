import { GoogleGenAI, Type, Schema, FunctionDeclaration } from "@google/genai";
import { CampaignInput, CampaignPlan, ImageGenConfig, VeoConfig } from "../types";

// Helper to check for API Key before operations
const getClient = async (requirePaidKey: boolean = false) => {
  if (requirePaidKey) {
    // @ts-ignore - aistudio generic type
    if (window.aistudio && window.aistudio.hasSelectedApiKey && window.aistudio.openSelectKey) {
       // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
         // @ts-ignore
        await window.aistudio.openSelectKey();
      }
    }
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper for file to base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper: Base64 to Blob
const base64ToBlob = (base64: string, mimeType: string) => {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  const sliceSize = 512;

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: mimeType });
}

// 1. Research Website (Grounding)
export const researchBrand = async (url: string): Promise<string> => {
  if (!url) return "";
  const ai = await getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following website/brand to extract key visual identity themes, mission, and tone: ${url}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text || "";
  } catch (error) {
    console.warn("Search grounding failed", error);
    return "";
  }
};

// 2. Generate Campaign Plan
export const generateCampaignPlan = async (input: CampaignInput, researchData: string): Promise<CampaignPlan> => {
  const ai = await getClient();
  const imagePart = input.productImage ? await fileToGenerativePart(input.productImage) : null;

  const prompt = `
    Role: Lead AI Campaign Architect.
    Objective: Synthesize inputs into a high-performance marketing package.
    CRITICAL CONSTRAINT: The video assets and script must tell a SINGLE CONTINUOUS STORY (Narrative Arc). Scene 1 leads directly to Scene 2, etc.

    Inputs:
    Brand Description: ${input.brandDescription}
    Target Audience: ${input.targetAudience}
    Video Constraints: ${input.videoConstraints}
    Video Aspect Ratio: ${input.videoAspectRatio} (Design the storyboard for this format)
    Website Context: ${researchData}
    
    Workflow:
    1. Analyze the Product Image (if provided) and text inputs.
    2. Define visual anchors and brand essence.
    3. Create a unified campaign concept with a clear sequential storyline.
    4. Generate 3 specific Nano Banana Pro image prompts.
    5. Create a 4-scene storyboard that flows logically:
       - Scene 1: The Hook / Context (Sets the stage)
       - Scene 2: The Action / Problem (Builds tension or interest)
       - Scene 3: The Climax / Solution (Product hero moment)
       - Scene 4: The Resolution (Brand payoff)
    6. Write a synchronized Script & Audio Plan for these 4 scenes. Include Voiceover (VO) lines and Sound Design (SFX/Music) cues.
    7. Generate Veo 3.1 video prompts for each scene. 
       - Ensure STRICT visual consistency (same lighting, same subject, same environment) across all 4 prompts.
       - Include technical specs from inputs in every prompt.

    Output MUST be strictly valid JSON matching this schema.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      visualAnchors: { type: Type.ARRAY, items: { type: Type.STRING } },
      brandEssence: { type: Type.STRING },
      strategyAlignment: { type: Type.STRING },
      concept: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hook: { type: Type.STRING },
          visualDirection: { type: Type.STRING },
          narrativeSummary: { type: Type.STRING, description: "A summary of the linear story connecting the 4 scenes." },
        },
      },
      imagePrompts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            prompt: { type: Type.STRING },
          },
        },
      },
      script: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sceneLabel: { type: Type.STRING, description: "e.g., Scene 1: The Hook" },
            dialogue: { type: Type.STRING, description: "Voiceover text or character dialogue" },
            audioCues: { type: Type.STRING, description: "Background music style and sound effects" },
          }
        }
      },
      storyboard: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            scene: { type: Type.STRING },
            description: { type: Type.STRING },
          },
        },
      },
      videoPrompts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            prompt: { type: Type.STRING },
          },
        },
      },
    },
    required: ["visualAnchors", "brandEssence", "concept", "imagePrompts", "script", "videoPrompts"],
  };

  const parts = [];
  if (imagePart) parts.push(imagePart);
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // High reasoning
    contents: { parts },
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      systemInstruction: "You are an expert creative director. Focus on narrative continuity and visual consistency.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No plan generated");
  const plan = JSON.parse(text) as CampaignPlan;
  // Inject the chosen aspect ratio back into the plan for the execution phase
  plan.aspectRatio = input.videoAspectRatio;
  return plan;
};

// 3. Generate Image (Gemini 3 Pro Image)
export const generateAssetImage = async (prompt: string, config: ImageGenConfig): Promise<string> => {
  const ai = await getClient(true); // Requires paid key for high res
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        imageSize: config.size,
        aspectRatio: config.aspectRatio,
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      // Convert base64 to blob for reliable download
      const blob = base64ToBlob(part.inlineData.data, part.inlineData.mimeType || 'image/png');
      return URL.createObjectURL(blob);
    }
  }
  throw new Error("No image generated");
};

// 4. Generate Video (Veo 3.1)
export const generateAssetVideo = async (prompt: string, config: VeoConfig, image?: File): Promise<string> => {
  
  const attemptGeneration = async (allowRetry: boolean): Promise<string> => {
    // Ensure we have a client, triggering key selection if needed
    const ai = await getClient(true);
    
    let operation;
    const model = 'veo-3.1-fast-generate-preview';
    const vidConfig = {
      numberOfVideos: 1,
      resolution: config.resolution,
      aspectRatio: config.aspectRatio,
    };

    console.log("Starting video generation...", { model, prompt, vidConfig });

    try {
      if (image) {
        const base64Data = await fileToGenerativePart(image);
        operation = await ai.models.generateVideos({
          model,
          prompt,
          image: {
            imageBytes: base64Data.inlineData.data,
            mimeType: base64Data.inlineData.mimeType,
          },
          config: vidConfig
        });
      } else {
        operation = await ai.models.generateVideos({
          model,
          prompt,
          config: vidConfig
        });
      }
    } catch (e: any) {
      console.error("Video generation request failed:", e);
      
      // Retry logic for invalid/missing entity errors (often linked to project selection)
      if (allowRetry && e.message && e.message.includes("Requested entity was not found")) {
        console.warn("Entity not found. Triggering re-selection of API key and retrying...");
        // @ts-ignore
        if (window.aistudio && window.aistudio.openSelectKey) {
             // @ts-ignore
            await window.aistudio.openSelectKey();
            return attemptGeneration(false);
        }
      }
      throw new Error(`Video request failed: ${e.message}`);
    }

    // Poll for completion
    while (!operation.done) {
      console.log("Polling video operation...");
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10s polling interval
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    console.log("Video operation complete:", operation);

    if (operation.error) {
       console.error("Video generation error payload:", operation.error);
       throw new Error(`Video generation error: ${operation.error.message || 'Unknown error'}`);
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) throw new Error("Video generation completed but returned no URI.");

    // Fetch binary
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing for video download");

    const vidRes = await fetch(`${uri}&key=${apiKey}`);
    if (!vidRes.ok) {
       throw new Error(`Failed to download video: ${vidRes.status} ${vidRes.statusText}`);
    }
    
    const blob = await vidRes.blob();
    return URL.createObjectURL(blob);
  };

  return attemptGeneration(true);
};

// 5. Edit Image (Gemini 2.5 Flash Image)
export const editImage = async (image: File, instruction: string): Promise<string> => {
  const ai = await getClient();
  const imagePart = await fileToGenerativePart(image);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        imagePart,
        { text: instruction }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      // Convert base64 to blob for consistency
      const blob = base64ToBlob(part.inlineData.data, part.inlineData.mimeType || 'image/png');
      return URL.createObjectURL(blob);
    }
  }
  throw new Error("Image editing failed");
};