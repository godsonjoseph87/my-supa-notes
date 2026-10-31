import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  inputRef
}) => {
  return (
    <div className="relative w-full max-w-[560px] h-[42px] flex items-center">
      <div className="absolute left-3.5 text-[#8E9EB5] pointer-events-none flex items-center justify-center">
        <Search className="w-[18px] h-[18px]" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search notes..."
        className="w-full h-full pl-10 pr-16 bg-[#F6F8FC] dark:bg-[#131C2E] border border-[#E5E9F2] dark:border-[#283655] rounded-xl text-[14px] text-[#142039] dark:text-[#F1F5F9] placeholder-[#8E9EB5] focus:outline-none focus:border-[#5145FF] focus:ring-2 focus:ring-[#5145FF]/15 transition-all"
        aria-label="Search notes"
      />

      <div className="absolute right-3 flex items-center gap-1.5">
        {searchQuery ? (
          <button
            onClick={() => onSearchChange('')}
            className="p-1 text-[#8E9EB5] hover:text-[#142039] dark:hover:text-white rounded-md transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-medium text-[#8E9EB5] bg-[#E9EDF5] dark:bg-[#1E2B44] border border-[#D5DDEB] dark:border-[#2E3F61] rounded">
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  );
};

