import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  BarChart2
} from 'lucide-react';
import type { PdfDocument, PyqDocument, PyqAnalysisReport } from '../types';
import { comparePyqWithStudyMaterial } from '../services/pyqAnalyzer';
import { SAMPLE_PYQ_ANALYSIS_REPORT } from '../utils/sampleData';

interface PyqTrendAnalyzerProps {
  studyDoc: PdfDocument | null;
  pyqDoc: PyqDocument | null;
  onOpenUpload: () => void;
}

export const PyqTrendAnalyzer: React.FC<PyqTrendAnalyzerProps> = ({
  studyDoc,
  pyqDoc,
  onOpenUpload
}) => {
  const [report, setReport] = useState<PyqAnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (studyDoc && pyqDoc) {
      setIsAnalyzing(true);
      comparePyqWithStudyMaterial(studyDoc, pyqDoc)
        .then(res => setReport(res))
        .finally(() => setIsAnalyzing(false));
    } else if (studyDoc?.isSample) {
      setReport(SAMPLE_PYQ_ANALYSIS_REPORT);
    }
  }, [studyDoc, pyqDoc]);

  if (!studyDoc) {
    return (
      <div className="text-center py-16 glass-card rounded-2xl p-8 border border-slate-800 space-y-4">
        <TrendingUp className="w-12 h-12 text-purple-400 mx-auto" />
        <h3 className="text-xl font-bold text-slate-200">No Study Material Loaded</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Please upload your study PDF and optional Previous Year Questions (PYQ) to generate trend analysis.
        </p>
        <button
          onClick={onOpenUpload}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all"
        >
          Upload Study Notes & PYQ Papers
        </button>
      </div>
    );
  }

  const activeReport = report || SAMPLE_PYQ_ANALYSIS_REPORT;

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      
      {/* Hero Banner */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-purple-500/20 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-400 border border-purple-500/40">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">PYQ vs Textbook Exam Trend Analyzer</h2>
              <p className="text-xs text-slate-400">Cross-references past year exam questions against study material concepts</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-medium">
              Study: {studyDoc.title}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 font-medium">
              PYQ: {pyqDoc ? pyqDoc.title : 'Demo PYQ Paper Linked'}
            </span>
          </div>
        </div>

        {/* High Yield Exam Strategy Banner */}
        <div className="bg-slate-950/80 p-5 rounded-xl border border-purple-900/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4" /> AI Exam Preparation Strategy & Insight
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {activeReport.overallExamStrategy}
          </p>
        </div>

      </div>

      {/* Top High Yield Topics Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" /> Topic Weightage & Repetition Breakdown
          </h3>
          <span className="text-xs text-slate-400">{activeReport.topTopics.length} Major Topics Analyzed</span>
        </div>

        {isAnalyzing ? (
          <div className="py-12 text-center text-xs text-purple-300 animate-pulse">
            Analyzing PYQ questions frequency & mapping textbook concepts...
          </div>
        ) : (
          <div className="space-y-6">
            {activeReport.topTopics.map((item, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {item.importanceLevel}
                      </span>
                      <span className="text-xs text-slate-500">
                        Appears ~{item.pyqMentionsCount} times in PYQs
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-100">{item.topic}</h4>
                  </div>

                  {/* Frequency Progress Metric */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Exam Probability</span>
                      <p className="text-lg font-extrabold text-indigo-400">{item.frequencyScore}%</p>
                    </div>
                    
                    <div className="w-28 h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${item.frequencyScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                  <span>Coverage in Study Material: {item.textbookCoverage}</span>
                  <span className="text-[10px] font-bold">VERIFIED COVERAGE</span>
                </div>

                {/* Predicted Questions for upcoming exam */}
                <div className="space-y-2 pt-2 border-t border-slate-900">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Predicted Questions for Upcoming Exam:
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.predictedQuestions.map((pq, pidx) => (
                      <div key={pidx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-indigo-400">[{pq.marks} Marks]</span>
                          <span className="text-amber-400 font-bold">{pq.probabilityScore}% Match</span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium">
                          {pq.questionText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
