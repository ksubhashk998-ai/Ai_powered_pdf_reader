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
import { uploadPdfToBackend } from '../services/apiClient';

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
      // Try server upload first
      const backendDoc = await uploadPdfToBackend(file);
      if (backendDoc) {
        setActiveDoc(backendDoc);
      } else {
        // Fallback to client-side extraction
        const extracted = await extractTextFromPdfFile(file);
        const doc = createDocumentFromUpload(file, extracted);
        setActiveDoc(doc);
      }
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



  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative overflow-hidden rounded-2xl glass-card p-8 border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Document Intelligence (Express Backend + React Frontend)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Read, Understand & Master <span className="gradient-text">Any Study Material</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Upload your course textbook, research paper, or notes. MindCraft AI scans the document, cleans watermark noise, extracts 18+ high-yield exam questions with 5-section 10-mark model answers, and builds custom model question papers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <p className="text-xs text-indigo-300">Scanning & parsing PDF pages via Express Server...</p>
                </div>
              ) : activeDoc ? (
                <div className="space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-semibold text-emerald-300 text-sm">{activeDoc.title}</p>
                  <p className="text-xs text-slate-400">{activeDoc.wordCount} words • {activeDoc.pages.length} pages loaded</p>
                  <button className="text-xs text-indigo-400 underline pt-1">Upload Different PDF</button>
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

        <div className={`glass-card rounded-2xl p-6 border flex flex-col justify-between space-y-4 transition-all ${
          activeDoc && !pyqDoc ? 'border-purple-500/40 shadow-lg shadow-purple-500/5' : 'border-slate-800'
        }`}>
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
              {activeDoc && !pyqDoc ? (
                <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded animate-pulse">
                  READY TO UPLOAD
                </span>
              ) : pyqDoc ? (
                <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                  ATTACHED
                </span>
              ) : (
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                  OPTIONAL
                </span>
              )}
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
                  : activeDoc
                  ? 'border-purple-500/50 bg-purple-950/20 hover:border-purple-400 hover:bg-purple-900/30 ring-1 ring-purple-500/30'
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
                  <Upload className={`w-8 h-8 mx-auto ${activeDoc ? 'text-purple-300' : 'text-purple-400'}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      {activeDoc ? 'Click to upload PYQ Exam PDF now' : 'Click to upload PYQ Exam PDF'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {activeDoc ? 'Cross-reference exam questions with your uploaded study notes' : 'Enables PYQ Trend Analyzer & Importance Scoring'}
                    </p>
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

      {activeDoc && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-900 border border-emerald-500/30 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-100">
                Study Material Scanned: <span className="text-emerald-300">{activeDoc.title}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {pyqDoc ? (
                  <span className="text-purple-300 font-medium">
                    ✓ PYQ Linked: {pyqDoc.title} • Exam prediction & trend heatmaps unlocked!
                  </span>
                ) : (
                  <span>
                    Ready! You can upload Previous Year Questions (PYQ) above, or proceed directly to study tools.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onContinue}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              {pyqDoc ? 'Open Chat & Study Tools' : 'Proceed to Chat & Study Tools'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
