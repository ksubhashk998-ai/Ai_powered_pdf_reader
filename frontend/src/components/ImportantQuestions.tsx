import { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Star, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  CheckCircle2, 
  Bookmark,
  Sparkles
} from 'lucide-react';
import type { PdfDocument, LanguageCode, QuestionItem } from '../types';
import { generateImportantQuestions, cleanTopicTitle } from '../services/aiService';
import { fetchQuestionsFromBackend } from '../services/apiClient';
import { exportImportantQuestionsPdf, exportTextFile } from '../services/exportService';

interface ImportantQuestionsProps {
  document: PdfDocument | null;
  language: LanguageCode;
  onOpenUpload: () => void;
}

export const ImportantQuestions: React.FC<ImportantQuestionsProps> = ({
  document,
  language,
  onOpenUpload
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMarkFilter, setSelectedMarkFilter] = useState<number | 'all'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (!document) return;
    setIsLoading(true);

    // Try Express backend API first
    fetchQuestionsFromBackend(document)
      .then(backendQs => {
        if (backendQs && backendQs.length > 0) {
          setQuestions(backendQs);
        } else {
          return generateImportantQuestions(document, language).then(res => setQuestions(res));
        }
      })
      .finally(() => setIsLoading(false));
  }, [document, language]);

  if (!document) {
    return (
      <div className="text-center py-16 glass-card rounded-2xl p-8 border border-slate-800 space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-200">No Active PDF Document</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Please upload a study material PDF to identify high-priority exam questions.
        </p>
        <button
          onClick={onOpenUpload}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
        >
          Upload PDF Document
        </button>
      </div>
    );
  }

  const filteredQuestions = questions.filter(q => 
    selectedMarkFilter === 'all' ? true : q.marks === selectedMarkFilter
  );

  const handleExportPdf = () => {
    exportImportantQuestionsPdf(filteredQuestions, document.title);
  };

  const handleExportTxt = () => {
    let txt = `========================================================================\n`;
    txt += `          IMPORTANT EXAM QUESTIONS - ${document.title.toUpperCase()}\n`;
    txt += `========================================================================\n\n`;

    filteredQuestions.forEach((q, idx) => {
      txt += `Q${idx + 1}. [${q.importance} - ${q.marks} MARKS] (${cleanTopicTitle(q.topic)})\n`;
      txt += `${cleanTopicTitle(q.questionText)}\n\n`;
      txt += `MODEL ANSWER:\n${q.modelAnswer}\n`;
      txt += `------------------------------------------------------------------------\n\n`;
    });

    exportTextFile(txt, `${document.title}_Important_Questions.txt`);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-xl font-bold text-slate-100">AI Identified Important Questions</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Categorized by exam weightage (2, 5 & 10 marks) with complete 5-section model answers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {(['all', 2, 5, 10] as const).map(mark => (
              <button
                key={mark.toString()}
                onClick={() => setSelectedMarkFilter(mark)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedMarkFilter === mark
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mark === 'all' ? 'All Questions' : `${mark} Marks`}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>

          <button
            onClick={handleExportTxt}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all"
          >
            <FileText className="w-4 h-4" /> TXT
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-indigo-300 animate-pulse space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Extracting 18+ exam questions & generating rich 5-section 10-mark model answers...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, index) => {
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div key={q.id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        q.importance === 'Very Important'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : q.importance === 'Important'
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        ⭐ {q.importance}
                      </span>

                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {q.marks} Marks
                      </span>

                      {q.pageReference && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Bookmark className="w-3 h-3 text-indigo-400" /> Page {q.pageReference}
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 font-medium">
                        Topic: {cleanTopicTitle(q.topic)}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                      Q{index + 1}. {cleanTopicTitle(q.questionText)}
                    </h3>
                  </div>

                  <button
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {q.keyPoints && q.keyPoints.length > 0 && (
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" /> Key Exam Points to Include:
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {q.keyPoints.map((kp, idx) => (
                        <span key={idx} className="text-[11px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          • {cleanTopicTitle(kp)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {isExpanded && (
                  <div className="pt-4 border-t border-slate-800/80 space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Model Answer & Derivation Steps
                    </div>

                    <div className="bg-slate-950 p-5 rounded-xl border border-slate-900 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                      {q.modelAnswer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
