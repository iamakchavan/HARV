import { AI_CONFIG } from '../ai-config';

export async function queryXAI(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${AI_CONFIG.xai.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.xai.apiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a test assistant."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "grok-beta",
        stream: false,
        temperature: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`xAI API request failed: ${errorData}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from xAI API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`xAI error: ${error.message}`);
    }
    throw new Error('xAI service unavailable');
  }
}