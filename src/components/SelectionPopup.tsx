import React, { useState } from 'react';
import { Search, Copy, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { queryGemini } from '../utils/ai-providers/gemini';

interface SelectionPopupProps {
  position: { x: number; y: number } | null;
  selectedText: string;
  onDefine: () => void;
  onExplain: () => void;
  visible: boolean;
  onSearch: (answer: string) => void;
  darkMode: boolean;
}

export const SelectionPopup: React.FC<SelectionPopupProps> = ({
  position,
  selectedText,
  visible,
  onSearch,
  darkMode
}) => {
  const [showExtended, setShowExtended] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  React.useEffect(() => {
    if (visible && position) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const popupWidth = 300;
      const popupHeight = showExtended ? 150 : 48;

      let x = position.x;
      let y = position.y;
      let transformOrigin = 'center bottom';
      let translate = 'translate(-50%, -100%) translateY(-10px)';

      if (x - popupWidth/2 < 0) {
        x = popupWidth/2;
      } else if (x + popupWidth/2 > windowWidth) {
        x = windowWidth - popupWidth/2;
      }

      if (y - popupHeight < 0) {
        y += popupHeight + 20;
        transformOrigin = 'center top';
        translate = 'translate(-50%, 0) translateY(10px)';
      }

      setPopupStyle({
        position: 'fixed',
        top: `${y}px`,
        left: `${x}px`,
        transform: translate,
        transformOrigin,
        zIndex: 50,
      });
    }
  }, [position, visible, showExtended]);

  if (!visible || !position) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText);
  };

  const scrollToAnswer = () => {
    setTimeout(() => {
      const answerElements = document.querySelectorAll('.answer-container');
      if (answerElements.length > 0) {
        const lastAnswer = answerElements[answerElements.length - 1];
        lastAnswer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    const prompt = `
Please provide a concise summary of: "${selectedText}"

Your summary should:
1. Capture the main points and key ideas
2. Be clear and concise
3. Maintain the essential meaning
4. Use bullet points for key takeaways
5. Format with markdown for readability
`;

    try {
      const answer = await queryGemini(prompt);
      onSearch(answer);
      scrollToAnswer();
    } catch (error) {
      console.error('Summarize error:', error);
    } finally {
      setIsSummarizing(false);
      setShowExtended(false);
    }
  };

  const handleExplain = async () => {
    setIsExplaining(true);
    const prompt = `
Please provide a detailed explanation of: "${selectedText}"

Your explanation should:
1. Break down complex concepts
2. Provide relevant context and background
3. Use examples where appropriate
4. Define any technical terms
5. Format with markdown for readability
`;

    try {
      const answer = await queryGemini(prompt);
      onSearch(answer);
      scrollToAnswer();
    } catch (error) {
      console.error('Explain error:', error);
    } finally {
      setIsExplaining(false);
      setShowExtended(false);
    }
  };

  const handleBack = () => {
    setShowExtended(false);
  };

  const baseClasses = `
    selection-popup
    ${darkMode ? 'dark bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
    shadow-xl border rounded-xl overflow-hidden
  `;

  const buttonClasses = `
    flex items-center gap-2 px-4 py-2 text-sm font-medium
    ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}
    transition-colors
  `;

  return (
    <div className={baseClasses} style={popupStyle}>
      <div className={`flex items-center ${darkMode ? 'divide-gray-700' : 'divide-gray-100'} divide-x`}>
        {showExtended && (
          <button
            onClick={handleBack}
            className={`p-2 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-50 text-gray-400'}`}
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex">
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
              ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}
              ${isSummarizing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSummarizing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="animate-text-pulse">Summarizing...</span>
              </div>
            ) : (
              'Summarize'
            )}
          </button>
          
          <button
            onClick={handleExplain}
            disabled={isExplaining}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
              ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}
              ${isExplaining ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isExplaining ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="animate-text-pulse">Explaining...</span>
              </div>
            ) : (
              'Explain'
            )}
          </button>
          
          <button
            onClick={handleCopy}
            className={buttonClasses}
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>

          <button
            onClick={() => setShowExtended(true)}
            className={buttonClasses}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showExtended && (
        <div className={`p-2 space-y-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
              ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}
              ${isSummarizing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSummarizing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="animate-text-pulse">Summarizing...</span>
              </div>
            ) : (
              'Summarize'
            )}
          </button>
          <button
            onClick={handleExplain}
            disabled={isExplaining}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
              ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}
              ${isExplaining ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isExplaining ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="animate-text-pulse">Explaining...</span>
              </div>
            ) : (
              'Explain'
            )}
          </button>
        </div>
      )}
    </div>
  );
};