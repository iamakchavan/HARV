import React, { useState, useEffect, useCallback, useRef } from 'react';
import { analyzeCurrentPage, askQuestion } from './utils/ai';
import { Header } from './components/Header';
import { QuestionInput } from './components/QuestionInput';
import { ContentSection } from './components/ContentSection';
import { FocusModal } from './components/FocusModal';
import { SelectionPopup } from './components/SelectionPopup';
import { AnswerAnimation } from './components/AnswerAnimation';
import { FloatingSearch } from './components/FloatingSearch';
import { ModelSelector, type AIModel } from './components/ModelSelector';
import { setAIModel } from './utils/ai';
import Browser from 'webextension-polyfill';

interface SearchResult {
  id: string;
  content: string;
  timestamp: number;
  type: 'search' | 'define' | 'elaborate';
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<SearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [answerType, setAnswerType] = useState<'define' | 'elaborate' | 'search' | null>(null);
  const [summary, setSummary] = useState('');
  const [url, setUrl] = useState('');
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [searchScope, setSearchScope] = useState<'all' | 'domain' | 'page'>('page');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSummarized, setIsSummarized] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');
  const [selectionPopup, setSelectionPopup] = useState<{
    position: { x: number; y: number } | null;
    text: string;
    visible: boolean;
  }>({
    position: null,
    text: '',
    visible: false
  });

  const answerRef = useRef<HTMLDivElement>(null);
  const searchAnswerRef = useRef<HTMLDivElement>(null);
  const latestSearchRef = useRef<HTMLDivElement>(null);
  const latestAnswerRef = useRef<HTMLDivElement>(null);

  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
    setAIModel(model);
    setIsSummarized(false);
  };

  const getCurrentUrl = async () => {
    const tabs = await Browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.url) {
      setUrl(tabs[0].url);
    }
  };

  const summarizeCurrentPage = async () => {
    setIsSummarizing(true);
    setLoading(true);
    try {
      const summary = await analyzeCurrentPage();
      setSummary(summary);
      setIsSummarized(true);
    } catch (error) {
      console.error('Error analyzing page:', error);
    }
    setLoading(false);
    setIsSummarizing(false);
  };

  const handleTextSelection = useCallback((event: MouseEvent) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (rect) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const popupWidth = 300;
        const popupHeight = 150;

        let x = rect.left + (rect.width / 2);
        let y = rect.top;

        if (x - popupWidth/2 < 0) {
          x = popupWidth/2;
        } else if (x + popupWidth/2 > windowWidth) {
          x = windowWidth - popupWidth/2;
        }

        if (y - popupHeight < 0) {
          y = rect.bottom + 10;
        } else {
          y = rect.top - 10;
        }

        setSelectionPopup({
          position: { x, y },
          text: selectedText,
          visible: true
        });
      }
    } else {
      setSelectionPopup(prev => ({ ...prev, visible: false }));
    }
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const popup = document.querySelector('.selection-popup');
    if (!popup?.contains(event.target as Node)) {
      setSelectionPopup(prev => ({ ...prev, visible: false }));
    }
  }, []);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await askQuestion(question, searchScope);
      setAnswers(prev => [...prev, {
        id: Date.now().toString(),
        content: response,
        timestamp: Date.now(),
        type: 'search'
      }]);
      setQuestion('');
      scrollToAnswer();
    } catch (error) {
      console.error('Error getting answer:', error);
    }
    setLoading(false);
  };

  const scrollToAnswer = () => {
    setTimeout(() => {
      latestAnswerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSearch = (answer: string) => {
    const newSearchResult: SearchResult = {
      id: Date.now().toString(),
      content: answer,
      timestamp: Date.now(),
      type: 'search'
    };
    setSearchResults(prev => [...prev, newSearchResult]);
    setAnswerType('search');
  };

  const handleFloatingSearch = async (query: string, images?: File[]) => {
    setLoading(true);
    try {
      const match = query.match(/^\[(ALL|DOMAIN|PAGE)\]\s*(.+)$/);
      const scope = match ? match[1].toLowerCase() as 'all' | 'domain' | 'page' : 'page';
      const cleanQuery = match ? match[2] : query;
      
      const previousContext = answers.length > 0 
        ? `Previous context:\n${answers.map(a => `Q: ${a.content}`).join('\n')}\n\nNew question: ` 
        : '';
      
      let imagesData: string[] = [];
      if (images && images.length > 0) {
        imagesData = await Promise.all(images.map(image => 
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(image);
          })
        ));
      }
      
      const response = await askQuestion(
        previousContext + cleanQuery,
        scope,
        imagesData
      );
      
      const newAnswer: SearchResult = {
        id: Date.now().toString(),
        content: response,
        timestamp: Date.now(),
        type: 'search'
      };
      setAnswers(prev => [...prev, newAnswer]);
      scrollToAnswer();
    } catch (error) {
      console.error('Error getting answer:', error);
    }
    setLoading(false);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const loadState = async () => {
      const tabs = await Browser.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      if (!tabId) return;
      
      const storageKey = `tab_${tabId}`;
      const result = await Browser.storage.local.get([storageKey]);
      const tabData = result[storageKey];
      
      if (tabData) {
        if (tabData.summary) setSummary(tabData.summary);
        if (tabData.answers) setAnswers(tabData.answers);
        if (tabData.searchResults) setSearchResults(tabData.searchResults);
        if (tabData.darkMode !== undefined) {
          setDarkMode(tabData.darkMode);
          if (tabData.darkMode) {
            document.documentElement.classList.add('dark');
          }
        }
      }
    };

    loadState();
    summarizeCurrentPage();
    getCurrentUrl();
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const saveState = async () => {
      const tabs = await Browser.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      if (!tabId) return;
      
      const storageKey = `tab_${tabId}`;
      await Browser.storage.local.set({
        [storageKey]: {
          summary,
          answers,
          searchResults,
          darkMode
        }
      });
    };

    saveState();
  }, [summary, answers, searchResults, darkMode]);

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      {darkMode && <div className="fixed-gradient" />}
      <Header 
        url={url} 
        onSummarize={summarizeCurrentPage}
        isSummarizing={isSummarizing}
        isSummarized={isSummarized}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      
      <div className="p-4 space-y-4">
        <QuestionInput
          question={question}
          loading={loading}
          onChange={setQuestion}
          onSubmit={handleQuestionSubmit}
          onFocusClick={() => setShowFocusModal(true)}
          searchScope={searchScope}
        />

        <div className="mt-2">
          <ModelSelector
            selectedModel={selectedModel}
            onModelSelect={handleModelChange}
          />
        </div>
        
        {summary && <ContentSection title="Page Summary" content={summary} />}
        
        <div ref={answerRef}>
          {loading && answerType && !answers.length && (
            <AnswerAnimation type={answerType} />
          )}
          {answers.map((answer, index) => (
            <div 
              key={answer.id} 
              ref={index === answers.length - 1 ? latestAnswerRef : null}
              className="answer-container animate-fade-up"
            >
              <ContentSection
                title={`Answer - ${new Date(answer.timestamp).toLocaleTimeString()}`}
                content={answer.content}
              />
            </div>
          ))}
        </div>

        <div ref={searchAnswerRef} id="search-answer">
          {searchResults.map((result, index) => (
            <div 
              key={result.id} 
              ref={index === searchResults.length - 1 ? latestSearchRef : null}
            >
              <ContentSection 
                title={`Search Result (${new Date(result.timestamp).toLocaleTimeString()})`}
                content={result.content} 
              />
            </div>
          ))}
        </div>
      </div>

      <SelectionPopup
        position={selectionPopup.position}
        selectedText={selectionPopup.text}
        onDefine={() => {}}
        onExplain={() => {}}
        onSearch={handleSearch}
        visible={selectionPopup.visible}
        darkMode={darkMode}
      />

      <FocusModal
        isOpen={showFocusModal}
        onClose={() => setShowFocusModal(false)}
        onScopeSelect={setSearchScope}
        currentScope={searchScope}
      />

      <FloatingSearch 
        isSummarized={isSummarized}
        onSearch={handleFloatingSearch}
      />
    </div>
  );
};

export default App;