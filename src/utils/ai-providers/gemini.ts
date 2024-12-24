import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { AI_CONFIG } from '../ai-config';

const genAI = new GoogleGenerativeAI(AI_CONFIG.gemini.apiKey);

// Safety settings to ensure appropriate content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Generation config for better responses
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

export async function queryGemini(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: AI_CONFIG.gemini.model,
      generationConfig,
      safetySettings,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Check if response was blocked
    if (response.promptFeedback?.blockReason) {
      throw new Error(`Content blocked: ${response.promptFeedback.blockReason}`);
    }

    return response.text();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Gemini error: ${error.message}`);
    }
    throw new Error('Gemini service unavailable');
  }
}