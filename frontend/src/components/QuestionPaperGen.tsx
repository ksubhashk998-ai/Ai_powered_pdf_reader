import { useState } from 'react';
import { 
  FileCheck, 
  Printer, 
  Download, 
  Sparkles, 
  Eye, 
  CheckCircle,
  FileText
} from 'lucide-react';
import type { PdfDocument, QuestionPaperConfig, GeneratedQuestionPaper } from '../types';
import { generateQuestionPaper, cleanTopicTitle } from '../services/aiService';
import { exportQuestionPaperPdf, exportTextFile, formatQuestionPaperAsTxt } from '../services/exportService';

interface QuestionPaperGenProps {
  document: PdfDocument | null;
  onOpenUpload: () => void;
}

export const QuestionPaperGen: React.FC<QuestionPaperGenProps> = ({
  document,
  onOpenUpload
}) => {
  const [config, setConfig] = useState<QuestionPaperConfig>({
    institutionName: 'Department of Computer Science & Engineering',
    subjectName: cleanTopicTitle(document?.title || 'Machine Learning'),
    courseCode: 'CS-601',
    duration: '3 Hours',
    totalMarks: 100,
    partA: { count: 5, marksEach: 2 },
    partB: { count: 3, marksEach: 5 },
    partC: { count: 2, marksEach: 10 },
    includeAnswers: true
  });

  const [generatedPaper, setGeneratedPaper] = useState<GeneratedQuestionPaper | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);

  const handleGenerate = async () => {
    if (!document) return;
    setIsGenerating(true);
    try {
      const paper = await generateQuestionPaper(document, config);
      setGeneratedPaper(paper);
    } catch (err) {
      console.error("Paper generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    if (generatedPaper) {
      exportQuestionPaperPdf(generatedPaper);
    }
  };

  const handleExportTxt = () => {
    if (generatedPaper) {
      const txt = formatQuestionPaperAsTxt(generatedPaper);
      exportTextFile(txt, `${generatedPaper.subjectName}_Model_Question_Paper.txt`);
    }
  };

  if (!document) {
    return (
      <div className="text-center py-16 glass-card rounded-2xl p-8 border border-slate-800 space-y-4">
        <FileCheck className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-200">No Document Uploaded</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Upload a textbook or notes PDF to generate custom examination model question papers.
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

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6 no-print">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Question Paper Generator</h2>
              <p className="text-xs text-slate-400">Creates formatted exam papers according to university blueprint standards</p>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Paper...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Generate Model Exam Paper
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Exam Header Info</label>
            <input
              type="text"
              placeholder="Institution Name"
              value={config.institutionName}
              onChange={(e) => setConfig({ ...config, institutionName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Subject Name"
                value={config.subjectName}
                onChange={(e) => setConfig({ ...config, subjectName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Course Code"
                value={config.courseCode}
                onChange={(e) => setConfig({ ...config, courseCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Duration & Total Marks</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400">Duration</span>
                <input
                  type="text"
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Max Marks</span>
                <input
                  type="number"
                  value={config.totalMarks}
                  onChange={(e) => setConfig({ ...config, totalMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Blueprint Section Distribution</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-900">
                <span>Part A (Short 2 Marks)</span>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={config.partA.count}
                  onChange={(e) => setConfig({ ...config, partA: { ...config.partA, count: Number(e.target.value) } })}
                  className="w-12 px-2 py-0.5 rounded bg-slate-900 text-center border border-slate-800"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-900">
                <span>Part B (Medium 5 Marks)</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={config.partB.count}
                  onChange={(e) => setConfig({ ...config, partB: { ...config.partB, count: Number(e.target.value) } })}
                  className="w-12 px-2 py-0.5 rounded bg-slate-900 text-center border border-slate-800"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-900">
                <span>Part C (Long 10 Marks)</span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={config.partC.count}
                  onChange={(e) => setConfig({ ...config, partC: { ...config.partC, count: Number(e.target.value) } })}
                  className="w-12 px-2 py-0.5 rounded bg-slate-900 text-center border border-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {generatedPaper ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl glass-card border border-slate-800 no-print">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle className="w-4 h-4" /> Paper Ready to Print & Download
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white"
              >
                <Eye className="w-3.5 h-3.5" />
                {showAnswers ? 'Hide Answer Hints' : 'Show Answer Hints'}
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
              >
                <Printer className="w-4 h-4" /> Print Paper
              </button>

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

          <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl border border-slate-200 font-sans print-paper max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-1.5 border-b border-slate-900 pb-4">
              <h1 className="text-lg font-extrabold tracking-wide uppercase">{generatedPaper.institutionName}</h1>
              <h2 className="text-base font-bold text-slate-800">{generatedPaper.subjectName} ({generatedPaper.courseCode})</h2>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 pt-2 px-2">
                <span>Duration: {generatedPaper.duration}</span>
                <span>Date: {generatedPaper.generatedDate}</span>
                <span>Maximum Marks: {generatedPaper.totalMarks}</span>
              </div>
            </div>

            <div className="space-y-6">
              {generatedPaper.sections.map(section => (
                <div key={section.sectionLetter} className="space-y-3">
                  <div className="border-b border-slate-300 pb-1">
                    <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                      {section.sectionTitle}
                    </h3>
                    <p className="text-xs italic text-slate-600">
                      Note: {section.instructions}
                    </p>
                  </div>

                  <div className="space-y-4 pt-1">
                    {section.questions.map(q => (
                      <div key={q.number} className="space-y-1">
                        <div className="flex justify-between items-start text-xs sm:text-sm text-slate-900">
                          <div className="font-semibold pr-4">
                            Q{q.number}. {cleanTopicTitle(q.questionText)}
                          </div>
                          <span className="font-bold shrink-0">[{q.marks} Marks]</span>
                        </div>

                        {showAnswers && (
                          <div className="text-xs bg-slate-100 p-2 rounded border border-slate-300 text-slate-700 font-sans no-print">
                            <span className="font-bold text-indigo-700">Answer Hint / Solution Key: </span>
                            {q.answerHint}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-8 border-t border-slate-300 text-xs font-bold uppercase tracking-widest text-slate-600">
              *** END OF QUESTION PAPER ***
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 glass-card rounded-2xl p-8 border border-slate-800 space-y-3">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">Ready to Generate Exam Paper</h3>
          <p className="text-xs text-slate-400">Click "Generate Model Exam Paper" above to build your question paper.</p>
        </div>
      )}
    </div>
  );
};
