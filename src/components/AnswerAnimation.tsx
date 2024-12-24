import React from 'react';
import { BookOpen, Lightbulb, Search } from 'lucide-react';

interface AnswerAnimationProps {
  type: 'define' | 'elaborate' | 'search';
}

export const AnswerAnimation: React.FC<AnswerAnimationProps> = ({ type }) => (
  <div className="flex flex-col items-center justify-center py-6 animate-fade-up">
    <div className="relative">
      <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" />
      <div className="relative bg-blue-50 p-3 rounded-full">
        {type === 'define' ? (
          <BookOpen className="w-6 h-6 text-blue-500 animate-pulse" />
        ) : type === 'search' ? (
          <Search className="w-6 h-6 text-purple-500 animate-pulse" />
        ) : (
          <Lightbulb className="w-6 h-6 text-amber-500 animate-pulse" />
        )}
      </div>
    </div>
    <p className="mt-3 text-sm font-medium text-gray-600">
      {type === 'define' ? 'Defining...' : 
       type === 'search' ? 'Searching...' : 
       'Elaborating...'}
    </p>
  </div>
);