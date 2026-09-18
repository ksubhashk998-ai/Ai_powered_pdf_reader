import { 
  Sparkles, 
  FileText, 
  Key, 
  BookOpen, 
  MessageSquare, 
  HelpCircle, 
  FileCheck, 
  TrendingUp,
  Eye,
  Languages,
  Upload
} from 'lucide-react';
import type { ActiveTab, LanguageCode, PdfDocument } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/sampleData';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeDoc: PdfDocument | null;
  selectedLanguage: LanguageCode;
  setSelectedLanguage: (lang: LanguageCode) => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeDoc,
  selectedLanguage,
  setSelectedLanguage,
  onOpenApiKeyModal,
  hasApiKey
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'upload', label: 'Upload Center', icon: <Upload className="w-4 h-4" /> },
    { id: 'chat', label: 'Chat with PDF', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'explain', label: 'AI Explainer', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'questions', label: 'Important Qs', icon: <HelpCircle className="w-4 h-4" />, badge: '2/5/10 Marks' },
    { id: 'exam-gen', label: 'Question Paper', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'pyq-analyzer', label: 'PYQ Analyzer', icon: <TrendingUp className="w-4 h-4" />, badge: 'PYQ vs PDF' },
    { id: 'pdf-viewer', label: 'PDF Inspector', icon: <Eye className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-heading">MindCraft</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI PDF Suite
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Reader, Explainer & Intelligent Exam Generator</p>
            </div>
          </div>

          {activeDoc && (
            <button
              onClick={() => setActiveTab('upload')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs hover:border-indigo-500/40 hover:bg-slate-800/60 transition-all cursor-pointer text-left"
              title="Click to view/change files in Upload Center"
            >
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium text-slate-300 max-w-[200px] truncate" title={activeDoc.fileName}>
                {activeDoc.title}
              </span>
              <span className="text-slate-500">({activeDoc.pages.length} pgs)</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 gap-1.5 text-xs text-slate-300">
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                hasApiKey 
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Configure Gemini API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{hasApiKey ? 'Gemini Connected' : 'Set Gemini Key'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-900">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isDisabled = !activeDoc && tab.id !== 'upload';
            return (
              <button
                key={tab.id}
                disabled={isDisabled}
                onClick={() => !isDisabled && setActiveTab(tab.id)}
                title={isDisabled ? 'Upload study material first to unlock this tool' : undefined}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed text-slate-600'
                    : isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 cursor-pointer'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
