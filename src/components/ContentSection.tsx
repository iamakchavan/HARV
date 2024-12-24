import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Copy, Check, Volume2, VolumeX } from 'lucide-react';
import { TTSService } from '../utils/tts';

interface ContentSectionProps {
  title: string;
  content: string;
}

export const ContentSection: React.FC<ContentSectionProps> = ({ title, content }) => {
  const [copied, setCopied] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const ttsService = TTSService.getInstance();

  const renderMarkdown = (content: string) => {
    const html = marked(content);
    return { __html: DOMPurify.sanitize(html) };
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    } else {
      // Strip markdown and clean the text before speaking
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = marked(content);
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
      <div
        className="markdown-content prose dark:prose-invert prose-sm max-w-none
          prose-headings:text-gray-900 dark:prose-headings:text-white
          prose-p:text-gray-700 dark:prose-p:text-gray-300
          prose-a:text-blue-600 dark:prose-a:text-blue-400
          prose-strong:text-gray-900 dark:prose-strong:text-white
          prose-code:text-gray-800 dark:prose-code:text-gray-200
          prose-code:bg-gray-100 dark:prose-code:bg-gray-800
          prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800"
        dangerouslySetInnerHTML={renderMarkdown(content)}
      />
    </div>
  );
};