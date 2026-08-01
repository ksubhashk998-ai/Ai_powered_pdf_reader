import { useRef, useState } from 'react';
import { 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';
import type { PdfDocument, PyqDocument } from '../types';
import { extractTextFromPdfFile, createDocumentFromUpload, createPyqDocumentFromUpload } from '../services/pdfService';
import { SAMPLE_STUDY_DOC, SAMPLE_PYQ_DOC } from '../utils/sampleData';

interface DocumentUploadProps {
  activeDoc: PdfDocument | null;
  setActiveDoc: (doc: PdfDocument) => void;
  pyqDoc: PyqDocument | null;
  setPyqDoc: (doc: PyqDocument) => void;
  onContinue: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  activeDoc,
  setActiveDoc,
  pyqDoc,
  setPyqDoc,
  onContinue
}) => {
  const [isProcessingStudy, setIsProcessingStudy] = useState(false);
  const [isProcessingPyq, setIsProcessingPyq] = useState(false);
  const studyInputRef = useRef<HTMLInputElement>(null);
  const pyqInputRef = useRef<HTMLInputElement>(null);

  const handleStudyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingStudy(true);
    try {
      const extracted = await extractTextFromPdfFile(file);
      const doc = createDocumentFromUpload(file, extracted);
      setActiveDoc(doc);
    } catch (err) {
      console.error("Error processing study PDF:", err);
    } finally {
      setIsProcessingStudy(false);
    }
  };

  const handlePyqUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingPyq(true);
    try {
      const extracted = await extractTextFromPdfFile(file);
      const doc = createPyqDocumentFromUpload(file, extracted);
      setPyqDoc(doc);
    } catch (err) {
      console.error("Error processing PYQ PDF:", err);
    } finally {
      setIsProcessingPyq(false);
    }
  };

  const handleLoadSampleData = () => {
    setActiveDoc(SAMPLE_STUDY_DOC);
    setPyqDoc(SAMPLE_PYQ_DOC);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-8 border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Document Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Read, Understand & Master <span className="gradient-text">Any Study Material</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Upload your course textbook, research paper, or notes. MindCraft AI analyzes the content, simplifies complex concepts in your language, extracts top exam questions (2, 5 & 10 marks), and builds custom model question papers.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleLoadSampleData}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Load Demo ML Notes & PYQs
            </button>
            <span className="text-xs text-slate-400">or upload your custom PDF files below</span>
          </div>
        </div>
      </div>

      {/* Dual Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Primary PDF Upload (Textbook/Notes) */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">1. Study Material PDF</h3>
                  <p className="text-xs text-slate-400">Textbook, Notes, Syllabus, or Research Paper</p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">REQUIRED</span>
            </div>

            <input
              type="file"
              ref={studyInputRef}
              onChange={handleStudyUpload}
              accept=".pdf,.txt"
              className="hidden"
            />

            <div
              onClick={() => studyInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                activeDoc 
                  ? 'border-emerald-500/40 bg-emerald-500/5' 
                  : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/50'
              }`}
            >
              {isProcessingStudy ? (
                <div className="space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-indigo-300">Extracting text & analyzing pages...</p>
                </div>
              ) : activeDoc ? (
                <div className="space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-semibold text-emerald-300 text-sm">{activeDoc.title}</p>
                  <p className="text-xs text-slate-400">{activeDoc.wordCount} words • {activeDoc.pages.length} pages loaded</p>
                  <button className="text-xs text-indigo-400 underline pt-1">Change PDF</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Click to upload Study Material PDF</p>
                    <p className="text-xs text-slate-400 mt-1">Supports PDF & TXT documents up to 50MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            Used for Chat, Summaries, ELI5 Explanations & Model Papers
          </p>
        </div>

        {/* 2. Secondary PYQ Upload (Previous Year Papers) */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">2. Previous Year Questions (PYQ)</h3>
                  <p className="text-xs text-slate-400">Past Exam Papers & Mid-term question sets</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">OPTIONAL</span>
            </div>

            <input
              type="file"
              ref={pyqInputRef}
              onChange={handlePyqUpload}
              accept=".pdf,.txt"
              className="hidden"
            />

            <div
              onClick={() => pyqInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                pyqDoc 
                  ? 'border-purple-500/40 bg-purple-500/5' 
                  : 'border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/50'
              }`}
            >
              {isProcessingPyq ? (
                <div className="space-y-2">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-purple-300">Extracting PYQ text...</p>
                </div>
              ) : pyqDoc ? (
                <div className="space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-purple-400 mx-auto" />
                  <p className="font-semibold text-purple-300 text-sm">{pyqDoc.title}</p>
                  <p className="text-xs text-slate-400">{pyqDoc.pages.length} pages loaded</p>
                  <button className="text-xs text-purple-400 underline pt-1">Change PYQ PDF</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-8 h-8 text-purple-400 mx-auto" />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Click to upload PYQ Exam PDF</p>
                    <p className="text-xs text-slate-400 mt-1">Enables PYQ Trend Analyzer & Importance Scoring</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI cross-references PYQs with notes to find highly probable questions
          </p>
        </div>

      </div>

      {/* Ready Action Bar */}
      {activeDoc && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-slate-100">Document Ready: {activeDoc.title}</p>
              <p className="text-xs text-slate-400">
                {pyqDoc ? `PYQ Paper Linked: ${pyqDoc.title}` : 'You can start asking questions or generate exam papers!'}
              </p>
            </div>
          </div>

          <button
            onClick={onContinue}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30"
          >
            Open Chat & Study Tools
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
