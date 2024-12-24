import { AI_CONFIG } from '../ai-config';

export async function queryPerplexity(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.perplexity.apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.perplexity.model,
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Perplexity API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity API Error:', error);
    throw new Error('Perplexity service unavailable');
  }
}