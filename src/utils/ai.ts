import Browser from 'webextension-polyfill';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractYouTubeVideoId, isYouTubeUrl } from './url-analyzer';
import { queryPerplexity } from './ai-providers/perplexity';
import { queryXAI } from './ai-providers/xai';
import { AI_CONFIG } from './ai-config';
import type { AIModel } from '../components/ModelSelector';

const genAI = new GoogleGenerativeAI(AI_CONFIG.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let currentModel: AIModel = 'gemini';

export function setAIModel(model: AIModel) {
  currentModel = model;
}

async function queryAI(prompt: string, imagesData?: string[]): Promise<string> {
  try {
    switch (currentModel) {
      case 'perplexity':
        return await queryPerplexity(prompt);
      case 'xai':
        return await queryXAI(prompt);
      default:
        if (imagesData && imagesData.length > 0) {
          const parts = [
            ...imagesData.map(imageData => ({
              inlineData: {
                data: imageData.split(',')[1],
                mimeType: "image/jpeg"
              }
            })),
            { text: prompt }
          ];
          
          const result = await visionModel.generateContent(parts);
          const response = await result.response;
          return response.text();
        } else {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          return response.text();
        }
    }
  } catch (error) {
    console.error('AI Error:', error);
    return 'Sorry, I encountered an error processing your request. Please try again.';
  }
}

export async function defineSelection(text: string): Promise<string> {
  const prompt = `
Please provide a comprehensive definition and explanation for: "${text}"

Your response should:
1. Start with a clear, concise definition
2. Provide relevant context and background
3. Include examples or use cases if applicable
4. Use markdown for formatting
5. End with a "Delve Deeper" section suggesting related concepts

Format the response with clear headings and bullet points where appropriate.
`;

  return await queryAI(prompt);
}

export async function elaborateSelection(text: string): Promise<string> {
  const prompt = `
Please provide a detailed explanation and analysis of this text:

"${text}"

Your response should:
1. Break down the key concepts
2. Provide additional context and background
3. Explain any complex terms or ideas
4. Draw connections to related topics
5. Use markdown for formatting
6. End with a "Related Concepts" section

Make the explanation clear and engaging, using examples where helpful.
`;

  return await queryAI(prompt);
}

export async function analyzeCurrentPage(): Promise<string> {
  try {
    const [tab] = await Browser.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.id) throw new Error('No active tab found');
    
    const pageContent = await Browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
          .map(h => `${h.tagName.toLowerCase()}: ${h.textContent}`);
        
        const paragraphs = Array.from(document.querySelectorAll('p'))
          .map(p => p.textContent);
        
        const metaTags = {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
          keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content'),
        };

        return {
          url: window.location.href,
          title: document.title,
          headings,
          content: paragraphs.join('\n').substring(0, 3000),
          meta: metaTags,
        };
      }
    });

    const { url, title, content } = pageContent[0].result;
    
    let prompt = '';
    
    if (isYouTubeUrl(url)) {
      const videoId = extractYouTubeVideoId(url);
      prompt = `
This is a YouTube video page. Please analyze and provide:

1. Video Title: ${title}
2. URL: ${url}
${videoId ? `3. Video ID: ${videoId}` : ''}

Content from the page:
${content}

Please provide a comprehensive summary including:
1. Main topic and key points
2. Key timestamps if available
3. Important discussions or highlights
4. Related links or references mentioned
Use markdown for formatting.
`;
    } else {
      prompt = `
Please analyze this webpage:

URL: ${url}
Title: ${title}

Content:
${content}

Provide a well-structured summary including:
1. Main topic and purpose
2. Key points and findings
3. Important details and context
4. Related links or references
Use markdown for formatting.
`;
    }

    return await queryAI(prompt);
  } catch (error) {
    console.error('Error analyzing page:', error);
    return 'Sorry, I encountered an error analyzing this page. Please try again.';
  }
}

export async function askQuestion(question: string, scope: 'all' | 'domain' | 'page', imagesData?: string[]): Promise<string> {
  try {
    const [tab] = await Browser.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.id) throw new Error('No active tab found');

    // If there are images, create a special prompt for them
    if (imagesData && imagesData.length > 0) {
      const imagePrompt = `
Please analyze ${imagesData.length > 1 ? 'these images' : 'this image'} and answer the following question:
${question}

Please provide a detailed response that:
1. Describes what you see in the ${imagesData.length > 1 ? 'images' : 'image'}
2. Answers the specific question asked
3. Provides relevant context or details
4. Uses markdown for formatting
`;
      return await queryAI(imagePrompt, imagesData);
    }

    const pageContent = await Browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const domain = window.location.hostname;
        const url = window.location.href;
        const title = document.title;
        const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
        const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
          .map(h => h.textContent)
          .filter(Boolean)
          .join('\n');
        const mainContent = document.body.innerText.substring(0, 3000);

        return {
          url,
          domain,
          title,
          metaDescription,
          metaKeywords,
          headings,
          content: mainContent
        };
      }
    });

    const { url, domain, title, metaDescription, metaKeywords, headings, content } = pageContent[0].result;
    const isYouTube = isYouTubeUrl(url);

    let contextPrompt = '';
    switch (scope) {
      case 'all':
        contextPrompt = `
You are a knowledgeable AI assistant. Please answer this question using your comprehensive knowledge:
Question: ${question}

${question.toLowerCase().includes('previous') || question.toLowerCase().includes('before') || question.toLowerCase().includes('last') ? 
`Previous context:
- User is on: ${url}
- Page title: ${title}` : ''}

Provide a detailed answer that:
1. Uses your comprehensive knowledge base to answer
2. Includes relevant facts and sources
3. Stays focused on the question without page context unless explicitly requested
4. Uses markdown for formatting
`;
        break;

      case 'domain':
        contextPrompt = `
You are analyzing content from the domain: ${domain}
Current page: ${url}

Website context:
Title: ${title}
Description: ${metaDescription}
Keywords: ${metaKeywords}

Question: ${question}

Please provide an answer that:
1. Focuses on information specific to ${domain}
2. References relevant content from the current page
3. Considers the website's context and purpose
4. Uses markdown for formatting
`;
        break;

      case 'page':
        contextPrompt = `
You are analyzing this specific page:
URL: ${url}
Title: ${title}

Page content:
${isYouTube ? 'YouTube Video Content:\n' : 'Page Content:\n'}
${headings}
---
${content}

Question: ${question}

Please provide an answer that:
1. Only uses information from this specific page
2. Cites relevant sections or quotes
3. Maintains context of the current content
4. Uses markdown for formatting
`;
        break;
    }

    return await queryAI(contextPrompt);
  } catch (error) {
    console.error('Error asking question:', error);
    return 'Sorry, I encountered an error processing your question. Please try again.';
  }
}