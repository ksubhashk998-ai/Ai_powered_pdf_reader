import { useState } from 'react';
import { Key, X, Check, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../services/aiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [keyInput, setKeyInput] = useState(getStoredApiKey());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(keyInput);
    setSaved(true);
    onKeySaved();
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 space-y-6 relative shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Google Gemini API Key</h3>
            <p className="text-xs text-slate-400">Unlock live real-time AI PDF understanding & explanations</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Enter your API Key</label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
          />

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline flex items-center gap-1"
            >
              Get a free Gemini API key <ExternalLink className="w-3 h-3" />
            </a>
            <span>Key stored locally in browser</span>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Seamless Offline Fallback
          </div>
          <p className="text-slate-400">
            Even without an API key, MindCraft AI works with built-in heuristic parsing, sample document extraction, and pre-configured exam generators out of the box!
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
            {saved ? 'Saved Successfully!' : 'Save & Connect'}
          </button>
        </div>

      </div>
    </div>
  );
};
