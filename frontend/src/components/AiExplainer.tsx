import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  Zap,
  Bookmark
} from 'lucide-react';
import type { PdfDocument, LanguageCode, ExplanationLevel, ChapterSummary } from '../types';
import { generateTopicExplanation, generateChapterSummaries, cleanTopicTitle } from '../services/aiService';

interface AiExplainerProps {
  document: PdfDocument | null;
  language: LanguageCode;
  onOpenUpload: () => void;
}

export const AiExplainer: React.FC<AiExplainerProps> = ({
  document,
  language,
  onOpenUpload
}) => {
  const [selectedTopic, setSelectedTopic] = useState('Core Concept Overview');
  const [customTopic, setCustomTopic] = useState('');
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>('ELI5');
  const [explanationText, setExplanationText] = useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [summaries, setSummaries] = useState<ChapterSummary[]>([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);

  useEffect(() => {
    if (!document) return;
    const topicToExplain = customTopic.trim() || selectedTopic;
    setIsLoadingExplanation(true);
    generateTopicExplanation(document, topicToExplain, explanationLevel, language)
      .then(res => setExplanationText(res))
      .finally(() => setIsLoadingExplanation(false));
  }, [document, selectedTopic, customTopic, explanationLevel, language]);

  useEffect(() => {
    if (!document) return;
    setIsLoadingSummaries(true);
    generateChapterSummaries(document, language)
      .then(res => setSummaries(res))
      .finally(() => setIsLoadingSummaries(false));
  }, [document, language]);

  if (!document) {
    return (
      <div className="text-center py-16 glass-card rounded-2xl p-8 border border-slate-800 space-y-4">
        <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-200">No Document Selected</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Please upload a document to unlock AI explanations & chapter summaries.
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

  const sampleTopics = summaries.length > 0 
    ? summaries.map(s => s.title)
    : ['Core Concept Overview', 'Key Algorithms & Formulas', 'Model Evaluation & Metrics'];

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">AI Concept Explainer</h2>
              <p className="text-xs text-slate-400">Simplifies tough textbook concepts into clear, multi-paragraph explanations</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {(['ELI5', 'Standard', 'Advanced'] as ExplanationLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setExplanationLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  explanationLevel === lvl
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl === 'ELI5' ? '🎈 ELI5 (Simple)' : lvl === 'Standard' ? '📘 Standard' : '🔬 Advanced'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Key Topic</label>
            <div className="space-y-1.5">
              {sampleTopics.slice(0, 5).map((top) => (
                <button
                  key={top}
                  onClick={() => {
                    setCustomTopic('');
                    setSelectedTopic(top);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    selectedTopic === top && !customTopic
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cleanTopicTitle(top)}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-3 flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Or Explain Custom Concept</label>
              <input
                type="text"
                placeholder="e.g., Information Gain formula, Confusion matrix..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-900 min-h-[260px] flex flex-col justify-between">
              {isLoadingExplanation ? (
                <div className="my-auto text-center space-y-3 py-10">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-indigo-300">Generating thorough explanation in selected language...</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {explanationText}
                </div>
              )}

              <div className="pt-4 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                <span>Explanation Mode: {explanationLevel}</span>
                <span>Document: {document.title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">Automatic Chapter Summaries</h2>
          </div>
          <span className="text-xs text-slate-400">{summaries.length} Sections Extracted</span>
        </div>

        {isLoadingSummaries ? (
          <div className="py-12 text-center text-xs text-indigo-300 animate-pulse">
            Extracting chapter summaries & key term definitions...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {summaries.map(sum => (
              <div key={sum.id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                    Chapter {sum.chapterNumber}
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm truncate max-w-[240px]" title={sum.title}>
                    {cleanTopicTitle(sum.title)}
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {sum.summary}
                </p>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Key Takeaways:
                  </span>
                  <ul className="space-y-1">
                    {sum.keyTakeaways.map((tk, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <span>{cleanTopicTitle(tk)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {sum.keyTerms && sum.keyTerms.length > 0 && (
                  <div className="pt-2 border-t border-slate-900 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Bookmark className="w-3 h-3 text-emerald-400" /> Key Term Definitions:
                    </span>
                    <div className="space-y-1">
                      {sum.keyTerms.map((kt, idx) => (
                        <div key={idx} className="text-xs bg-slate-950 p-2 rounded-lg border border-slate-900">
                          <span className="font-bold text-indigo-300">{cleanTopicTitle(kt.term)}: </span>
                          <span className="text-slate-400">{cleanTopicTitle(kt.definition)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
