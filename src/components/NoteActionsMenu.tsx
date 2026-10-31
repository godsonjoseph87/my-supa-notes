import React from 'react';
import {
  Tag,
  Pin,
  Star,
  Copy,
  Download,
  Trash2,
  RotateCcw,
  Check
} from 'lucide-react';
import { Note, NoteCategory } from '../types/note';
import { CATEGORY_CONFIG } from './CategoryList';

interface NoteActionsMenuProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCategory: (category: NoteCategory) => void;
  onTogglePin: () => void;
  onToggleFavorite: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete: () => void;
  onRestore?: () => void;
}

export const NoteActionsMenu: React.FC<NoteActionsMenuProps> = ({
  note,
  isOpen,
  onClose,
  onUpdateCategory,
  onTogglePin,
  onToggleFavorite,
  onDuplicate,
  onExport,
  onDelete,
  onRestore
}) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [categorySubmenu, setCategorySubmenu] = React.useState(false);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories: NoteCategory[] = ['Work', 'Personal', 'Ideas', 'Learning', 'Others'];

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-10 w-[220px] bg-white dark:bg-[#1A233A] border border-[#E9EDF5] dark:border-[#283655] rounded-2xl shadow-popover z-50 p-1.5 text-[13.5px] text-[#42577D] dark:text-[#C5CEE4] select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Category picker item */}
      <div className="relative">
        <button
          onClick={() => setCategorySubmenu(!categorySubmenu)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F6F8FC] dark:hover:bg-[#253255] transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <Tag className="w-4 h-4 text-[#7183A6]" />
            <span>Category: <strong className="text-[#142039] dark:text-white font-medium">{note.category}</strong></span>
          </div>
        </button>

        {categorySubmenu && (
          <div className="my-1 pl-6 pr-2 py-1 space-y-0.5 border-l-2 border-[#5145FF]/30 ml-3">
            {categories.map((cat) => {
              const isSelected = note.category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    onUpdateCategory(cat);
                    setCategorySubmenu(false);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#F0EDFF] dark:hover:bg-[#253255] text-[12.5px] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_CONFIG[cat].dotColor }}
                    />
                    <span className={isSelected ? 'font-semibold text-[#5145FF] dark:text-[#8EA7E9]' : ''}>
                      {cat}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#5145FF]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-[1px] bg-[#E9EDF5] dark:bg-[#283655] my-1" />

      {/* Pin / Unpin */}
      <button
        onClick={() => {
          onTogglePin();
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F6F8FC] dark:hover:bg-[#253255] transition-colors text-left"
      >
        <Pin className="w-4 h-4 text-[#7183A6]" />
        <span>{note.pinned ? 'Unpin note' : 'Pin to top'}</span>
      </button>

      {/* Favorite / Unfavorite */}
      <button
        onClick={() => {
          onToggleFavorite();
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F6F8FC] dark:hover:bg-[#253255] transition-colors text-left"
      >
        <Star className="w-4 h-4 text-[#7183A6]" />
        <span>{note.favorite ? 'Remove from favorites' : 'Add to favorites'}</span>
      </button>

      {/* Duplicate */}
      <button
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F6F8FC] dark:hover:bg-[#253255] transition-colors text-left"
      >
        <Copy className="w-4 h-4 text-[#7183A6]" />
        <span>Duplicate note</span>
      </button>

      {/* Export as Markdown */}
      <button
        onClick={() => {
          onExport();
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F6F8FC] dark:hover:bg-[#253255] transition-colors text-left"
      >
        <Download className="w-4 h-4 text-[#7183A6]" />
        <span>Export as .md</span>
      </button>

      <div className="h-[1px] bg-[#E9EDF5] dark:bg-[#283655] my-1" />

      {/* Trash or Restore / Delete */}
      {note.deleted ? (
        <>
          {onRestore && (
            <button
              onClick={() => {
                onRestore();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors text-left"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore note</span>
            </button>
          )}
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete permanently</span>
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
        >
          <Trash2 className="w-4 h-4" />
          <span>Move to Trash</span>
        </button>
      )}
    </div>
  );
};

