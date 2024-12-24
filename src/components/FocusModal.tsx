import React from 'react';
import { Globe, Layout, FileText, X } from 'lucide-react';

interface FocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScopeSelect: (scope: 'all' | 'domain' | 'page') => void;
  currentScope: 'all' | 'domain' | 'page';
}

export const FocusModal: React.FC<FocusModalProps> = ({
  isOpen,
  onClose,
  onScopeSelect,
  currentScope,
}) => {
  if (!isOpen) return null;

  const scopes = [
    {
      id: 'all',
      icon: Globe,
      title: 'All',
      description: 'Search across the entire internet',
    },
    {
      id: 'domain',
      icon: Layout,
      title: 'This Domain',
      description: 'Search across this domain',
    },
    {
      id: 'page',
      icon: FileText,
      title: 'This Page',
      description: "Search across this page's content",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[90%] max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Select Search Scope</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {scopes.map(({ id, icon: Icon, title, description }) => {
            const isSelected = currentScope === id;
            return (
              <button
                key={id}
                onClick={() => {
                  onScopeSelect(id as 'all' | 'domain' | 'page');
                  onClose();
                }}
                className={`w-full p-3 flex items-center gap-3 rounded-lg transition-colors text-left ${
                  isSelected 
                    ? 'bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/70' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isSelected 
                    ? 'bg-blue-100 dark:bg-blue-800' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isSelected 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className={`font-medium ${
                    isSelected 
                      ? 'text-blue-900 dark:text-blue-100' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>{title}</h3>
                  <p className={`text-sm ${
                    isSelected 
                      ? 'text-blue-600 dark:text-blue-300' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};