import React, { useState } from 'react';
import { Sparkles, Key, ExternalLink, X } from 'lucide-react';
import { getGeminiApiKey, saveGeminiApiKey } from '../services/geminiService';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
}

export const GeminiApiKeyModal: React.FC<GeminiApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaveKey
}) => {
  const [apiKey, setApiKey] = useState(() => getGeminiApiKey());
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter a valid Gemini API key.');
      return;
    }
    saveGeminiApiKey(apiKey.trim());
    onSaveKey(apiKey.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-[460px] bg-white dark:bg-[#1A233A] border border-[#E9EDF5] dark:border-[#283655] rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8E9EB5] hover:text-[#142039] dark:hover:text-white p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6654FF] to-[#A78BFA] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-[#142039] dark:text-white leading-tight">
              Configure Gemini AI
            </h3>
            <p className="text-[12.5px] text-[#7183A6] dark:text-[#94A3B8]">
              Power intelligent note formatting with Google Gemini
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#142039] dark:text-[#E2E8F0] mb-1.5">
              Gemini API Key
            </label>
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-[#8E9EB5] absolute left-3 pointer-events-none" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError('');
                }}
                placeholder="AIzaSy..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#F6F8FC] dark:bg-[#131C2E] border border-[#E5E9F2] dark:border-[#283655] rounded-xl text-[13.5px] text-[#142039] dark:text-white placeholder-[#8E9EB5] focus:outline-none focus:border-[#6654FF] focus:ring-2 focus:ring-[#6654FF]/15 font-mono"
                autoFocus
              />
            </div>
            {error && <p className="text-rose-500 text-[12px] mt-1">{error}</p>}
          </div>

          <div className="p-3 bg-[#F6F8FC] dark:bg-[#151F30] rounded-xl border border-[#E9EDF5] dark:border-[#283655] text-[12px] text-[#5A6E8C] dark:text-[#94A3B8] space-y-1">
            <p>Don't have an API key yet?</p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[#5145FF] dark:text-[#A78BFA] font-semibold hover:underline"
            >
              <span>Get a free key from Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-[11px] text-[#8E9EB5] mt-1">
              You can also add it permanently as <code className="font-mono">VITE_GEMINI_API_KEY</code> in <code className="font-mono">.env.local</code>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13.5px] font-medium text-[#5A6E8C] dark:text-[#C5CEE4] hover:bg-[#F6F8FC] dark:hover:bg-[#253255] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-[13.5px] font-medium text-white bg-[#5145FF] hover:bg-[#4336EA] rounded-xl shadow-btn transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save & Format</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

