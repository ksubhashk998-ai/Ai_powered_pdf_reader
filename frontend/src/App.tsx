import { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  DocumentUpload 
} from './components/DocumentUpload';
import { 
  PdfViewer 
} from './components/PdfViewer';
import { 
  ChatWithPdf 
} from './components/ChatWithPdf';
import { 
  AiExplainer 
} from './components/AiExplainer';
import { 
  ImportantQuestions 
} from './components/ImportantQuestions';
import { 
  QuestionPaperGen 
} from './components/QuestionPaperGen';
import { 
  PyqTrendAnalyzer 
} from './components/PyqTrendAnalyzer';
import { 
  ApiKeyModal 
} from './components/ApiKeyModal';
import type { 
  ActiveTab, 
  LanguageCode, 
  PdfDocument, 
  PyqDocument 
} from './types';
import { 
  getStoredApiKey 
} from './services/aiService';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [activeDoc, setActiveDoc] = useState<PdfDocument | null>(null);
  const [pyqDoc, setPyqDoc] = useState<PyqDocument | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(!!getStoredApiKey());

  useEffect(() => {
    setHasApiKey(!!getStoredApiKey());
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDoc={activeDoc}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={hasApiKey}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!activeDoc ? (
          <DocumentUpload
            activeDoc={activeDoc}
            setActiveDoc={setActiveDoc}
            pyqDoc={pyqDoc}
            setPyqDoc={setPyqDoc}
            onContinue={() => setActiveTab('chat')}
          />
        ) : (
          <>
            {activeTab === 'pdf-viewer' && (
              <div className="space-y-8">
                <DocumentUpload
                  activeDoc={activeDoc}
                  setActiveDoc={setActiveDoc}
                  pyqDoc={pyqDoc}
                  setPyqDoc={setPyqDoc}
                  onContinue={() => setActiveTab('chat')}
                />
                <PdfViewer
                  document={activeDoc}
                  onOpenUpload={() => setActiveTab('pdf-viewer')}
                />
              </div>
            )}

            {activeTab === 'chat' && (
              <ChatWithPdf
                key={activeDoc.id}
                document={activeDoc}
                language={selectedLanguage}
                onOpenUpload={() => setActiveTab('pdf-viewer')}
              />
            )}

            {activeTab === 'explain' && (
              <AiExplainer
                key={activeDoc.id}
                document={activeDoc}
                language={selectedLanguage}
                onOpenUpload={() => setActiveTab('pdf-viewer')}
              />
            )}

            {activeTab === 'questions' && (
              <ImportantQuestions
                key={activeDoc.id}
                document={activeDoc}
                language={selectedLanguage}
                onOpenUpload={() => setActiveTab('pdf-viewer')}
              />
            )}

            {activeTab === 'exam-gen' && (
              <QuestionPaperGen
                key={activeDoc.id}
                document={activeDoc}
                onOpenUpload={() => setActiveTab('pdf-viewer')}
              />
            )}

            {activeTab === 'pyq-analyzer' && (
              <PyqTrendAnalyzer
                key={`${activeDoc.id}-${pyqDoc?.id || 'none'}`}
                studyDoc={activeDoc}
                pyqDoc={pyqDoc}
                onOpenUpload={() => setActiveTab('pdf-viewer')}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 no-print">
        <p>MindCraft AI PDF Reader, Explainer & Question Generator • Express Backend + React Frontend Architecture</p>
      </footer>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={() => setHasApiKey(!!getStoredApiKey())}
      />
    </div>
  );
}

export default App;
