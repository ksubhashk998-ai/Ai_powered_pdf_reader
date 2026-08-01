import { useState } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FileText,
  Bookmark
} from 'lucide-react';
import type { PdfDocument, LanguageCode, ChatMessage } from '../types';
import { askPdfQuestion } from '../services/aiService';
import { fetchChatFromBackend } from '../services/apiClient';

interface ChatWithPdfProps {
  document: PdfDocument | null;
  language: LanguageCode;
  onOpenUpload: () => void;
}

export const ChatWithPdf: React.FC<ChatWithPdfProps> = ({
  document,
  language,
  onOpenUpload
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: document 
        ? `Hello! I've scanned **${document.title}**. You can ask me any question about the concepts, formulas, algorithms, or definitions in this PDF.`
        : 'Welcome! Please upload a PDF document to start chatting with your study material.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const presetPrompts = [
    "Explain key concepts from Chapter 1",
    "List important formulas and equations",
    "What are the main definitions?",
    "Summarize core sections of this PDF"
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || !document) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Try Express backend first
      const backendRes = await fetchChatFromBackend(document, textToSend, language);
      if (backendRes && backendRes.answer) {
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: backendRes.answer,
          citations: backendRes.citations,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        const response = await askPdfQuestion(document, textToSend, language);
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response.answer,
          citations: response.citations,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!document) {
    return (
      <div className="text-center py-16 glass-card rounded-2xl p-8 border border-slate-800 space-y-4">
        <Bot className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-200">No Active PDF Document</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Please upload a document to enable AI chat capabilities.
        </p>
        <button
          onClick={onOpenUpload}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
        >
          Upload Study Material PDF
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <div className="glass-card rounded-2xl border border-slate-800 flex flex-col h-[650px] overflow-hidden">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">PDF AI Study Assistant</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3 text-emerald-400" />
                Bound to: <span className="text-slate-300 font-medium">{document.title}</span>
              </p>
            </div>
          </div>

          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
            Active Context Engine
          </span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
              }`}>
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Bookmark className="w-3 h-3 text-indigo-400" /> Cited Pages:
                    </span>
                    {msg.citations.map(page => (
                      <span
                        key={page}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      >
                        Page {page}
                      </span>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-indigo-300 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-300" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                Searching document text & generating answer...
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" /> Quick Prompts:
          </span>
          {presetPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-3 py-1 rounded-full bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-slate-700 text-slate-300 hover:text-white transition-all whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask anything about ${document.title}...`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
