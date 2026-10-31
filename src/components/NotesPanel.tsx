import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Note, NavView, NoteCategory } from '../types/note';
import { NoteCard } from './NoteCard';
import { EmptyState } from './EmptyState';

interface NotesPanelProps {
  notes: Note[];
  selectedNoteId: string;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  currentView: NavView;
  selectedCategory: NoteCategory | null;
  searchQuery: string;
  onEmptyTrash?: () => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onToggleFavorite,
  onTogglePin,
  currentView,
  selectedCategory,
  searchQuery,
  onEmptyTrash
}) => {
  // Determine header title
  const getHeaderTitle = () => {
    if (searchQuery) return 'Search Results';
    if (selectedCategory) return selectedCategory;
    switch (currentView) {
      case 'favorites':
        return 'Favorites';
      case 'recent':
        return 'Recent Notes';
      case 'trash':
        return 'Trash';
      case 'all':
      default:
        return 'All Notes';
    }
  };

  const noteCountText = `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`;

  return (
    <div className="w-full lg:w-[416px] flex-shrink-0 flex flex-col h-full overflow-hidden select-none">
      {/* Header Row */}
      <div className="px-3 pt-6 pb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-[#142039] dark:text-[#F1F5F9] leading-tight">
            {getHeaderTitle()}
          </h2>
          <p className="text-[13px] text-[#7183A6] dark:text-[#64748B] mt-0.5 font-normal">
            {noteCountText}
          </p>
        </div>

        {currentView === 'trash' ? (
          notes.length > 0 && (
            <button
              onClick={onEmptyTrash}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 rounded-xl text-[13.5px] font-medium transition-colors"
              title="Permanently remove all deleted notes"
            >
              <Trash2 className="w-4 h-4" />
              Empty Trash
            </button>
          )
        ) : (
          <button
            onClick={onCreateNote}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#5145FF] hover:bg-[#4336EA] active:bg-[#382BD8] text-white rounded-xl text-[14px] font-medium shadow-btn transition-all duration-150 transform active:scale-95"
            aria-label="Create new note"
          >
            <Plus className="w-[18px] h-[18px]" strokeWidth={2.4} />
            <span>New Note</span>
          </button>
        )}
      </div>

      {/* Note Cards List */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-2.5 custom-scrollbar">
        {notes.length === 0 ? (
          searchQuery ? (
            <EmptyState type="search" searchQuery={searchQuery} />
          ) : currentView === 'trash' ? (
            <EmptyState type="trash" />
          ) : currentView === 'favorites' ? (
            <EmptyState type="favorites" />
          ) : (
            <EmptyState type="empty" onCreateNote={onCreateNote} />
          )
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={note.id === selectedNoteId}
              onSelect={() => onSelectNote(note.id)}
              onToggleFavorite={(e) => onToggleFavorite(note.id, e)}
              onTogglePin={(e) => onTogglePin(note.id, e)}
            />
          ))
        )}
      </div>
    </div>
  );
};

