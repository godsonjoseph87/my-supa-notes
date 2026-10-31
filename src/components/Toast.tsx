import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { ToastMessage } from '../types/note';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'error':
              return <AlertCircle className="w-4 h-4 text-rose-500" />;
            case 'info':
              return <Info className="w-4 h-4 text-blue-500" />;
            case 'success':
            default:
              return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
          }
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-[#151F30] text-white border border-[#2D3F63] rounded-xl shadow-2xl animate-in slide-in-from-bottom-3 fade-in duration-200"
          >
            <div className="flex items-center gap-2.5">
              {getIcon()}
              <span className="text-[13.5px] font-medium text-[#F4F6FF]">
                {toast.message}
              </span>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#8093BB] hover:text-white p-1 rounded transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

