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
    apiKey: 'API_KEY_HERE',
    endpoint: 'https://api.x.ai/v1'
  },
  gemini: {
    apiKey: 'API_KEY_HERE',
    model: 'gemini-1.5-flash'
  },
  perplexity: {
    apiKey: 'API_KEY_HERE',
    model: 'llama-3.1-sonar-small-128k-online'
  }
};