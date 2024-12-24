import React from 'react';
import { ArrowRight, Loader2, Search, Globe, Layout, FileText } from 'lucide-react';

interface QuestionInputProps {
  question: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFocusClick: () => void;
  searchScope: 'all' | 'domain' | 'page';
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  loading,
  onChange,
  onSubmit,
  onFocusClick,
  searchScope,
}) => {
  const ScopeIcon = {
    all: Globe,
    domain: Layout,
    page: FileText,
  }[searchScope];

  return (
    <form onSubmit={onSubmit}>
      <div className="input-container">
        <button
          type="button"
          onClick={onFocusClick}
          className="pl-3 pr-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
        >
          <ScopeIcon className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={question}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Search ${searchScope === 'all' ? 'everywhere' : 
            searchScope === 'domain' ? 'this domain' : 
            'this page'}...`}
          className="input-field !pl-0"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ArrowRight className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
};