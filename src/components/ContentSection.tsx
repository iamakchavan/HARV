import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Copy, Check, Volume2, VolumeX, Repeat, Sparkles, Brain, Zap } from 'lucide-react';
import { TTSService } from '../utils/tts';
import type { AIModel } from './ModelSelector';
import { setAIModel } from '../utils/ai';
import { askQuestion } from '../utils/ai';

interface ContentSectionProps {
  title: string;
  content: string;
  isImageResult?: boolean;
  originalQuery?: string;
  onContentUpdate?: (newContent: string) => void;
}

export const ContentSection: React.FC<ContentSectionProps> = ({ 
  title, 
  content,
  isImageResult = false,
  originalQuery = '',
  onContentUpdate
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [showModelMenu, setShowModelMenu] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const ttsService = TTSService.getInstance();

  const models = [
    {
      id: 'gemini' as AIModel,
      name: 'Gemini',
      description: 'For general purpose AI',
      icon: Sparkles,
    },
    {
      id: 'xai' as AIModel,
      name: 'xAI',
      description: 'Latest model from xAI',
      icon: Zap,
    },
    {
      id: 'perplexity' as AIModel,
      name: 'Perplexity',
      description: 'Most powerful search',
      icon: Brain,
    },
  ];

  const renderMarkdown = (content: string) => {
    const html = marked.parse(content);
    return { __html: DOMPurify.sanitize(html as string) };
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      await ttsService.stop();
      setIsSpeaking(false);
    } else {
      // Strip markdown and clean the text before speaking
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = marked.parse(content) as string;
      const cleanText = tempDiv.textContent || '';
      
      await ttsService.speak(cleanText);
      setIsSpeaking(true);

      // Update speaking state when speech ends
      const checkSpeakingStatus = setInterval(() => {
        if (!ttsService.isCurrentlySpeaking()) {
          setIsSpeaking(false);
          clearInterval(checkSpeakingStatus);
        }
      }, 100);
    }
  };

  const handleModelSelect = async (model: AIModel) => {
    try {
      setShowModelMenu(false);
      setIsRegenerating(true);
      setAIModel(model);
      
      // Regenerate answer with selected model
      const newAnswer = await askQuestion(originalQuery, 'all');
      onContentUpdate?.(newAnswer);
    } catch (error) {
      console.error('Error regenerating answer:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="answer-container">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSpeak}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 
              rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isSpeaking ? "Stop speaking" : "Listen to text"}
          >
            {isSpeaking ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 
              rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={copied ? "Copied!" : "Copy to clipboard"}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500 dark:text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      {isRegenerating ? (
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded shimmer" />
          <div className="h-4 w-[90%] bg-gray-200 dark:bg-gray-700 rounded shimmer" />
          <div className="h-4 w-[95%] bg-gray-200 dark:bg-gray-700 rounded shimmer" />
          <div className="h-4 w-[85%] bg-gray-200 dark:bg-gray-700 rounded shimmer" />
        </div>
      ) : (
        <div
          className="markdown-content prose dark:prose-invert prose-sm max-w-none
            prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-a:text-blue-600 dark:prose-a:text-blue-400
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-code:text-gray-800 dark:prose-code:text-gray-200
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800
            prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
            content-fade-in"
          dangerouslySetInnerHTML={renderMarkdown(content)}
        />
      )}
      {!isImageResult && (
        <div className="relative flex justify-end mt-4">
          <button
            onClick={() => setShowModelMenu(!showModelMenu)}
            className="flex items-center gap-1.5 px-2 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 
              rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
            title="Rewrite"
          >
            <Repeat className="w-4 h-4" />
            Rewrite
          </button>

          {showModelMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowModelMenu(false)} 
              />
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                border border-gray-200 dark:border-gray-700 overflow-hidden z-50
                transform origin-bottom-right transition-all duration-150 ease-out animate-in zoom-in-95">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 
                      transition-colors duration-150"
                  >
                    <model.icon className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{model.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{model.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};