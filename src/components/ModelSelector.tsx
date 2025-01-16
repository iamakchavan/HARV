import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Bot, Zap } from 'lucide-react';

export type AIModel = 'gemini' | 'perplexity' | 'xai';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelSelect: (model: AIModel) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const models = [
    {
      id: 'gemini' as AIModel,
      name: 'Gemini',
      description: 'Powered by Google Gemini 1.5 Flash',
      icon: Sparkles,
    },
    {
      id: 'xai' as AIModel,
      name: 'xAI',
      description: 'Grok-Beta Model',
      icon: Zap,
    },
    {
      id: 'perplexity' as AIModel,
      name: 'Perplexity',
      description: 'Llama 3.1 Sonar Small 128k Online',
      icon: Bot,
    },
  ];

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
          bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-lg
          hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200
          backdrop-blur-sm backdrop-saturate-150"
      >
        <div className="flex items-center gap-2">
          {selectedModelData && (
            <>
              <selectedModelData.icon className="w-4 h-4 text-blue-500" />
              <span>{selectedModelData.name}</span>
            </>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-white/90 dark:bg-gray-800/90 border border-gray-200 
            dark:border-gray-700 rounded-lg shadow-lg overflow-hidden transform origin-top 
            animate-in slide-in-from-top-2 duration-200 backdrop-blur-sm backdrop-saturate-150">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelSelect(model.id);
                  setIsOpen(false);
                }}
                className={`w-full flex flex-col px-4 py-2 text-left transition-colors
                  ${selectedModel === model.id 
                    ? 'bg-blue-50 dark:bg-blue-900/50' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <div className="flex items-center gap-2">
                  <model.icon className={`w-4 h-4 ${
                    selectedModel === model.id 
                      ? 'text-blue-500' 
                      : 'text-gray-400'
                  }`} />
                  <span className={selectedModel === model.id 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300'}>
                    {model.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                  {model.description}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};