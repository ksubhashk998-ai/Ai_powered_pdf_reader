import { useState } from 'react';
import { 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  BookOpen,
  Sparkles
} from 'lucide-react';
import type { PdfDocument } from '../types';

interface PdfViewerProps {
  document: PdfDocument | null;
  onOpenUpload: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ document, onOpenUpload }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!document) {
    return (
      <div className="text-center py-16 glass-card rounded-2xl p-8 border border-slate-800 space-y-4">
        <FileText className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-200">No PDF Document Uploaded</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Please upload a study material PDF or click the demo button to start analyzing documents.
        </p>
        <button
          onClick={onOpenUpload}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
        >
          Go to Upload Center
        </button>
      </div>
    );
  }

  const selectedPageObj = document.pages.find(p => p.pageNum === currentPage) || document.pages[0];

  const handleCopyPageText = () => {
    if (selectedPageObj) {
      navigator.clipboard.writeText(selectedPageObj.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredPages = document.pages.filter(p => 
    searchQuery ? p.text.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl glass-card border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">{document.title}</h2>
            <p className="text-xs text-slate-400">
              {document.wordCount} Words • {document.pages.length} Pages • Est. Reading Time: {Math.ceil(document.wordCount / 200)} mins
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in PDF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-48 sm:w-60"
            />
          </div>

          <button
            onClick={handleCopyPageText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Page'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 glass-card rounded-2xl p-4 border border-slate-800 space-y-3 h-[600px] flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Page Index</span>
            <span className="text-xs text-indigo-400">{filteredPages.length} pages</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredPages.map(page => (
              <button
                key={page.pageNum}
                onClick={() => setCurrentPage(page.pageNum)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                  currentPage === page.pageNum
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>Page {page.pageNum}</span>
                  {currentPage === page.pageNum && <Sparkles className="w-3 h-3 text-indigo-400" />}
                </div>
                <p className="line-clamp-2 text-[11px] text-slate-500 font-normal">
                  {page.text.substring(0, 100)}...
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6 flex flex-col justify-between min-h-[600px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-semibold text-slate-300">
                Page {currentPage} of {document.pages.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage >= document.pages.length}
                  onClick={() => setCurrentPage(prev => Math.min(document.pages.length, prev + 1))}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-6 border border-slate-900 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans overflow-y-auto max-h-[480px]">
              {selectedPageObj?.text || 'No text found on this page.'}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-900">
            <span>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</span>
            <span>Document ID: {document.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
