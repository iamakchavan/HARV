import React from 'react';
import { Brain, Moon, Sun, Loader2, Check } from 'lucide-react';

interface HeaderProps {
  url: string;
  onSummarize: () => void;
  isSummarizing: boolean;
  isSummarized: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  url, 
  onSummarize, 
  isSummarizing,
  isSummarized,
  darkMode,
  onToggleDarkMode
}) => (
  <div className="border-b border-gray-200 dark:border-gray-700/50">
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/extension_icon%20(4)-6Wye0wySEvOe9CE7mSoAVG5mEWUqc7.png" 
          alt="HARVv1 Logo" 
          className="w-9 h-9"
        />
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">HARVv1</h1>
          <span className="text-xs text-gray-600 dark:text-gray-400 -mt-1">Internal Beta</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
        <button 
          onClick={onSummarize} 
          disabled={isSummarizing}
          className={`button-primary flex items-center gap-2 ${
            isSummarizing ? 'opacity-75 cursor-not-allowed' : ''
          } ${
            isSummarized ? 'bg-green-900/50 text-green-400 hover:bg-green-900/70' : ''
          }`}
        >
          {isSummarizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="animate-text-pulse">Summarizing...</span>
            </>
          ) : isSummarized ? (
            <>
              <Check className="w-4 h-4" />
              Summarized
            </>
          ) : (
            'Summarize'
          )}
        </button>
      </div>
    </div>
    {url && (
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/50">
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={url}>
          {url}
        </p>
      </div>
    )}
  </div>
);