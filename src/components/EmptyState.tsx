import React from 'react';
import { FileQuestion, Plus, Trash2, Search } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'trash' | 'empty' | 'favorites';
  onCreateNote?: () => void;
  searchQuery?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onCreateNote,
  searchQuery
}) => {
  if (type === 'search') {
    return (
      <div className="py-16 px-4 text-center select-none">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#F0EDFF] dark:bg-[#232047] text-[#5145FF] flex items-center justify-center">
          <Search className="w-6 h-6" />
        </div>
        <h4 className="text-[15px] font-bold text-[#142039] dark:text-white mb-1">
          No matches found
        </h4>
        <p className="text-[13px] text-[#7183A6] dark:text-[#94A3B8] max-w-xs mx-auto">
          No notes found matching &ldquo;{searchQuery}&rdquo;. Try another term.
        </p>
      </div>
    );
  }

  if (type === 'trash') {
    return (
      <div className="py-16 px-4 text-center select-none">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
          <Trash2 className="w-6 h-6" />
        </div>
        <h4 className="text-[15px] font-bold text-[#142039] dark:text-white mb-1">
          Trash is empty
        </h4>
        <p className="text-[13px] text-[#7183A6] dark:text-[#94A3B8] max-w-xs mx-auto">
          Notes moved to trash will appear here. You can restore or delete them permanently.
        </p>
      </div>
    );
  }

  if (type === 'favorites') {
    return (
      <div className="py-16 px-4 text-center select-none">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h4 className="text-[15px] font-bold text-[#142039] dark:text-white mb-1">
          No favorite notes yet
        </h4>
        <p className="text-[13px] text-[#7183A6] dark:text-[#94A3B8] max-w-xs mx-auto mb-4">
          Click the star icon on any note to pin it here for quick access.
        </p>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 text-center select-none">
      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#F0EDFF] dark:bg-[#232047] text-[#5145FF] flex items-center justify-center">
        <FileQuestion className="w-6 h-6" />
      </div>
      <h4 className="text-[15px] font-bold text-[#142039] dark:text-white mb-1">
        No notes yet
      </h4>
      <p className="text-[13px] text-[#7183A6] dark:text-[#94A3B8] max-w-xs mx-auto mb-4">
        Capture your first thought, meeting note, or project idea.
      </p>
      {onCreateNote && (
        <button
          onClick={onCreateNote}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5145FF] text-white rounded-xl text-[13.5px] font-medium shadow-btn hover:bg-[#4336EA] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Note
        </button>
      )}
    </div>
  );
};

