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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Browser from 'webextension-polyfill';
import { WelcomeScreen } from './components/WelcomeScreen';
import { FeaturesPage } from './components/FeaturesPage';

interface SearchResult {
  id: string;
  content: string;
  timestamp: number;
  type: 'search' | 'define' | 'elaborate';
  images?: string[];
}

type OnboardingStep = "welcome" | "features" | "complete";

const storageKey = 'harv_extension';

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
  const [darkMode, setDarkMode] = useState(true);
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
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [scale, setScale] = useState(1);
  const [isDoubleTapped, setIsDoubleTapped] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("welcome");

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

      // Check if selection is within header
      const headerElement = document.querySelector('.border-b.border-gray-200');
      const anchorNode = selection?.anchorNode;
      if (headerElement && anchorNode && headerElement.contains(anchorNode)) {
        setSelectionPopup(prev => ({ ...prev, visible: false }));
        return;
      }

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
        type: 'search',
        images: imagesData
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageClick = (image: string, index: number, images: string[]) => {
    setSelectedImagePreview(image);
    setSelectedImageIndex(index);
    setCurrentImages(images);
    setScale(1);
    setIsDoubleTapped(false);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 3));
    }
  };

  const handleDoubleClick = () => {
    setIsDoubleTapped(!isDoubleTapped);
    setScale(isDoubleTapped ? 1 : 2);
  };

  const handleKeyDown = (e: KeyboardEvent, images: string[]) => {
    if (selectedImagePreview) {
      if (e.key === 'ArrowLeft' && selectedImageIndex > 0) {
        setSelectedImageIndex(prev => prev - 1);
        setSelectedImagePreview(images[selectedImageIndex - 1]);
        setScale(1);
      } else if (e.key === 'ArrowRight' && selectedImageIndex < images.length - 1) {
        setSelectedImageIndex(prev => prev + 1);
        setSelectedImagePreview(images[selectedImageIndex + 1]);
        setScale(1);
      } else if (e.key === 'Escape') {
        setSelectedImagePreview(null);
        setScale(1);
      }
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const currentAnswer = answers.find(answer => answer.images?.includes(selectedImagePreview || ''));
      if (currentAnswer?.images) {
        handleKeyDown(e, currentAnswer.images);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImagePreview, selectedImageIndex, answers]);

  useEffect(() => {
    // Initialize dark mode on mount
    document.documentElement.classList.add('dark');
    
    const loadState = async () => {
      const tabs = await Browser.tabs.query({ active: true, currentWindow: true });
      const url = tabs[0]?.url;
      if (!url) return;
      
      const storageKey = `tab_${url}`;
      const result = await Browser.storage.session.get([storageKey]);
      const tabData = result[storageKey];
      
      if (tabData) {
        if (tabData.summary) setSummary(tabData.summary);
        if (tabData.answers) setAnswers(tabData.answers);
        if (tabData.searchResults) setSearchResults(tabData.searchResults);
        if (tabData.darkMode !== undefined) {
          setDarkMode(tabData.darkMode);
          if (tabData.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        if (tabData.isSummarized !== undefined) {
          setIsSummarized(tabData.isSummarized);
        }
        if (tabData.isFirstVisit !== undefined) {
          setIsFirstVisit(tabData.isFirstVisit);
        }
      }
    };

    loadState();
    if (!isSummarized) {
      summarizeCurrentPage();
    }
    getCurrentUrl();
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add effect to handle dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const saveState = async () => {
      const tabs = await Browser.tabs.query({ active: true, currentWindow: true });
      const url = tabs[0]?.url;
      if (!url) return;
      
      const storageKey = `tab_${url}`;
      await Browser.storage.session.set({
        [storageKey]: {
          summary,
          answers,
          searchResults,
          darkMode,
          isSummarized,
          isFirstVisit
        }
      });
    };

    saveState();
  }, [summary, answers, searchResults, darkMode, isSummarized, isFirstVisit]);

  const handleGetStarted = () => {
    setOnboardingStep("features");
  };

  const handleContinue = () => {
    setOnboardingStep("complete");
    setIsFirstVisit(false);
    // Save to storage that onboarding is complete
    chrome.storage.local.set({ [`${storageKey}_onboarding_complete`]: true });
  };

  if (isFirstVisit) {
    return (
      <div className="app-container">
        {darkMode && <div className="fixed-gradient" />}
        {onboardingStep === "welcome" ? (
          <WelcomeScreen onGetStarted={handleGetStarted} />
        ) : onboardingStep === "features" ? (
          <FeaturesPage onContinue={handleContinue} />
        ) : null}
      </div>
    );
  }

  return (
    <div className="app-container">
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
        
        {isSummarizing ? (
          <div className="answer-container">
            <div className="flex justify-between items-center mb-3">
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded shimmer" />
              <div className="h-4 w-[90%] bg-gray-200 dark:bg-gray-700 rounded shimmer" />
              <div className="h-4 w-[95%] bg-gray-200 dark:bg-gray-700 rounded shimmer" />
              <div className="h-4 w-[85%] bg-gray-200 dark:bg-gray-700 rounded shimmer" />
            </div>
          </div>
        ) : summary && (
          <ContentSection title="Page Summary" content={summary} />
        )}
        
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
              {answer.images && answer.images.length > 0 && (
                <div className="mb-4 overflow-x-auto">
                  <div className="flex gap-4 py-2 min-w-min">
                    {answer.images.map((image, imgIndex) => (
                      <div key={imgIndex} className="relative flex-shrink-0">
                        <img 
                          src={image}
                          alt={`Uploaded image ${imgIndex + 1}`}
                          className="h-24 w-auto rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleImageClick(image, imgIndex, answer.images || [])}
                        />
                        <span className="absolute top-1 left-1 bg-black/50 text-white px-2 py-0.5 rounded-md text-xs font-medium">
                          Image {imgIndex + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

      {selectedImagePreview && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => {
            setSelectedImagePreview(null);
            setScale(1);
          }}
        >
          <div className="relative max-w-[90%] max-h-[90vh] flex items-center gap-4"
               onClick={e => e.stopPropagation()}>
            {selectedImageIndex > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full 
                  bg-black/70 hover:bg-black/90 text-white transition-all z-50
                  shadow-lg backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = selectedImageIndex - 1;
                  setSelectedImageIndex(newIndex);
                  setSelectedImagePreview(currentImages[newIndex]);
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <img 
              src={selectedImagePreview} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] rounded-lg shadow-xl animate-in fade-in select-none"
              style={{ 
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                cursor: scale > 1 ? 'grab' : 'zoom-in',
                userSelect: 'none'
              }}
              onWheel={handleWheel}
              onDoubleClick={handleDoubleClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              draggable={false}
            />

            {selectedImageIndex < currentImages.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full 
                  bg-black/70 hover:bg-black/90 text-white transition-all z-50
                  shadow-lg backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = selectedImageIndex + 1;
                  setSelectedImageIndex(newIndex);
                  setSelectedImagePreview(currentImages[newIndex]);
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;