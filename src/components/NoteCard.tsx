import React from 'react';
import { Star, Pin } from 'lucide-react';
import { Note } from '../types/note';
import { CATEGORY_CONFIG } from './CategoryList';
import { formatRelativeTime } from '../utils/date';

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  onTogglePin?: (e: React.MouseEvent) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isSelected,
  onSelect,
  onToggleFavorite,
  onTogglePin
}) => {
  const catConfig = CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.Others;

  // Clean preview text: strip HTML tags if preview contains HTML
  const cleanPreview = note.preview
    ? note.preview.replace(/<[^>]*>?/gm, '')
    : note.content.replace(/<[^>]*>?/gm, '').slice(0, 100);

  return (
    <div
      onClick={onSelect}
      className={`group relative p-[17px] rounded-2xl cursor-pointer transition-all duration-160 select-none ${
        isSelected
          ? 'bg-[#F0EDFF] dark:bg-[#232047] border border-[#D4C6FC] dark:border-[#4E3F78] shadow-sm'
          : 'bg-white dark:bg-[#1A233A] border border-[#F0F2F8] dark:border-[#283655] hover:border-[#DFE3F5] dark:hover:border-[#3B4D75] hover:shadow-sm'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`Select note: ${note.title}`}
    >
      {/* Top Row: Icon + Title + Status Icons */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {note.icon && (
            <span className="text-[17px] leading-none flex-shrink-0 select-none">
              {note.icon}
            </span>
          )}
          <h3 className="font-bold text-[15px] leading-snug text-[#142039] dark:text-[#F1F5F9] truncate">
            {note.title || 'Untitled Note'}
          </h3>
        </div>

        {/* Favorite or Pin indicator */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {note.pinned && (
            <span
              onClick={onTogglePin}
              className="text-[#42577D] dark:text-[#94A3B8] hover:text-[#142039] transition-transform hover:scale-110"
              title="Pinned note"
            >
              <Pin className="w-[15px] h-[15px] fill-current -rotate-45" />
            </span>
          )}

          {note.favorite ? (
            <span
              onClick={onToggleFavorite}
              className="text-[#F59E0B] hover:text-[#D97706] transition-transform hover:scale-110"
              title="Favorited note"
            >
              <Star className="w-[15px] h-[15px] fill-[#F59E0B]" />
            </span>
          ) : (
            <button
              onClick={onToggleFavorite}
              className="opacity-0 group-hover:opacity-100 text-[#8E9EB5] hover:text-[#F59E0B] transition-all"
              title="Add to favorites"
            >
              <Star className="w-[15px] h-[15px]" />
            </button>
          )}
        </div>
      </div>

      {/* Preview Snippet (2 lines) */}
      <p className="text-[#5A6E8C] dark:text-[#94A3B8] text-[13.5px] leading-[1.48] line-clamp-2 mb-3">
        {cleanPreview}
      </p>

      {/* Bottom Metadata: Category Tag + Relative Time */}
      <div className="flex items-center justify-between pt-1">
        <span
          className={`px-2.5 py-0.5 rounded-md text-[12px] font-semibold tracking-normal transition-colors ${catConfig.bgClass} ${catConfig.textClass} ${catConfig.darkBgClass}`}
        >
          {note.category}
        </span>

        <span className="text-[12px] text-[#7183A6] dark:text-[#64748B] font-normal">
          {formatRelativeTime(note.updatedAt)}
        </span>
      </div>
    </div>
  );
};

