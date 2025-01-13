export interface AIConfig {
  xai: {
    apiKey: string;
    endpoint: string;
  };
  gemini: {
    apiKey: string;
    model: string;
  };
  perplexity: {
    apiKey: string;
    model: string;
  };
}

export const AI_CONFIG: AIConfig = {
  xai: {
    apiKey: 'YOUR_XAI_API_KEY',
    endpoint: 'https://api.x.ai/v1'
  },
  gemini: {
    apiKey: 'YOUR_GEMINI_API_KEY',
    model: 'gemini-1.5-flash'
  },
  perplexity: {
    apiKey: 'YOUR_PERPLEXITY_API_KEY',
    model: 'llama-3.1-sonar-small-128k-online'
  }
};