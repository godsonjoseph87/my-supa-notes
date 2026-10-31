import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Clock,
  Edit3,
  Star,
  Link as LinkIcon,
  MoreVertical,
  Check,
  ChevronRight,
  RotateCcw,
  Trash2,
  Save,
  Cloud,
  CloudUpload,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import LinkExtension from '@tiptap/extension-link';
import { Note, NoteCategory, NavView } from '../types/note';
import { CATEGORY_CONFIG } from './CategoryList';
import { formatFullDate, formatRelativeTime } from '../utils/date';
import { EditorToolbar } from './EditorToolbar';
import { EditorCallout } from './EditorCallout';
import { NoteActionsMenu } from './NoteActionsMenu';
import { useAuth } from '../context/AuthContext';
import { uploadNoteToDrive } from '../services/googleDrive';
import { enhanceNoteWithGemini, getGeminiApiKey } from '../services/geminiService';
import { GeminiApiKeyModal } from './GeminiApiKeyModal';

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (updated: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onRestoreNote?: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  currentView: NavView;
  selectedCategory: NoteCategory | null;
  onNavigateHome: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onUpdateNote,
  onDeleteNote,
  onRestoreNote,
  onDuplicateNote,
  onShowToast,
  currentView,
  selectedCategory,
  onNavigateHome
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isJustSaved, setIsJustSaved] = useState(false);
  const [titleValue, setTitleValue] = useState(note?.title || '');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Gemini AI formatting and Undo states
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [geminiSnapshot, setGeminiSnapshot] = useState<{
    title: string;
    content: string;
    preview: string;
  } | null>(null);
  const [canUndoGemini, setCanUndoGemini] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Reset Gemini Undo state when switching notes
  useEffect(() => {
    setCanUndoGemini(false);
    setGeminiSnapshot(null);
  }, [note?.id]);

  const {
    accessToken,
    driveConnected,
    requestDrivePermission,
    setDriveSyncStatus
  } = useAuth();

  // Sync title when active note changes
  useEffect(() => {
    if (note) {
      setTitleValue(note.title);
    }
  }, [note?.id]);

  // TipTap Rich Text Editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder: 'Start writing your thoughts, checklists, or project details...'
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#5145FF] underline cursor-pointer'
        }
      })
    ],
    content: note?.content || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none focus:outline-none min-h-[360px] text-[15.5px] leading-[1.75] text-[#142039] dark:text-[#E2E8F0] dark:prose-invert font-normal'
      }
    },
    onUpdate: ({ editor }) => {
      setSaveStatus('saving');
      // Hide Gemini undo if user begins editing manually
      if (!isGeminiLoading && canUndoGemini) {
        setCanUndoGemini(false);
        setGeminiSnapshot(null);
      }
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        const html = editor.getHTML();
        const text = editor.getText();
        const preview = text.slice(0, 120);

        const updatedFields = {
          content: html,
          preview: preview || 'No additional text'
        };

        onUpdateNote(updatedFields);
        setSaveStatus('saved');

        // Background auto-sync to Google Drive if connected
        if (accessToken && note) {
          uploadNoteToDrive(accessToken, {
            ...note,
            ...updatedFields,
            updatedAt: new Date().toISOString()
          }).catch((err) => console.warn('Drive auto-sync:', err));
        }
      }, 400);
    }
  });

  // Re-sync editor content when switching notes
  useEffect(() => {
    if (editor && note) {
      if (editor.getHTML() !== note.content) {
        editor.commands.setContent(note.content, false);
      }
    }
  }, [note?.id, editor]);

  if (!note) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-white dark:bg-[#1A233A] rounded-2xl border border-[#E9EDF5] dark:border-[#283655] m-4 p-8 text-center text-[#7183A6]">
        <div>
          <p className="text-[16px] font-medium text-[#142039] dark:text-white">
            No note selected
          </p>
          <p className="text-[13.5px] mt-1 text-[#7183A6]">
            Select a note from the list or create a new one to begin.
          </p>
        </div>
      </div>
    );
  }

  const handleForceSave = () => {
    if (!note) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    // Hide Gemini undo once user explicitly saves
    setCanUndoGemini(false);
    setGeminiSnapshot(null);

    const html = editor ? editor.getHTML() : note.content;
    const text = editor ? editor.getText() : note.preview;
    const preview = text.slice(0, 120);

    const updatedFields = {
      title: titleValue,
      content: html,
      preview: preview || 'No additional text'
    };

    onUpdateNote(updatedFields);

    setSaveStatus('saved');
    setIsJustSaved(true);

    // If Google Drive is authorized, upload the note to Google Drive
    if (accessToken) {
      setDriveSyncStatus('syncing');
      const completeNote: Note = {
        ...note,
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };

      uploadNoteToDrive(accessToken, completeNote)
        .then(() => {
          setDriveSyncStatus('synced');
          onShowToast('Note saved & synced to Google Drive!', 'success');
        })
        .catch((err) => {
          console.warn('Google Drive sync error:', err);
          setDriveSyncStatus('error');
          onShowToast('Saved locally (Google Drive sync failed)', 'warning');
        });
    } else {
      onShowToast('Note saved locally', 'success');
    }

    setTimeout(() => {
      setIsJustSaved(false);
    }, 2000);
  };

  // Keyboard shortcut Ctrl/Cmd+S inside editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleForceSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [note, titleValue, editor]);

  const handleTitleChange = (newTitle: string) => {
    setTitleValue(newTitle);
    setCanUndoGemini(false);
    setGeminiSnapshot(null);
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      onUpdateNote({ title: newTitle });
      setSaveStatus('saved');
    }, 400);
  };

  // Gemini AI formatting handler
  const executeGeminiEnhance = async (customApiKey?: string) => {
    if (!note) return;

    const currentHtml = editor ? editor.getHTML() : note.content;
    const currentText = editor ? editor.getText().trim() : '';

    if (!currentText || currentText === 'Start writing your thoughts, checklists, or project details...') {
      onShowToast('Write some content first to format with Gemini AI.', 'info');
      return;
    }

    setIsGeminiLoading(true);

    // Capture snapshot of original title and content before Gemini modification
    const snapshot = {
      title: titleValue,
      content: currentHtml,
      preview: note.preview
    };
    setGeminiSnapshot(snapshot);

    try {
      const { title: enhancedTitle, content: formattedHtml } = await enhanceNoteWithGemini(
        currentHtml,
        titleValue,
        customApiKey
      );

      const finalTitle = enhancedTitle && enhancedTitle.trim() ? enhancedTitle.trim() : titleValue;
      setTitleValue(finalTitle);

      if (editor) {
        editor.commands.setContent(formattedHtml, false);
      }

      const newPreview = editor ? editor.getText().slice(0, 120) : note.preview;
      onUpdateNote({
        title: finalTitle,
        content: formattedHtml,
        preview: newPreview || 'No additional text'
      });

      setCanUndoGemini(true);
      onShowToast('Note summarized, heading updated & content formatted!', 'success');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg === 'MISSING_API_KEY') {
        setIsApiKeyModalOpen(true);
      } else {
        console.error('Gemini error:', err);
        onShowToast(errorMsg || 'Failed to format note with Gemini AI.', 'error');
        setGeminiSnapshot(null);
        setCanUndoGemini(false);
      }
    } finally {
      setIsGeminiLoading(false);
    }
  };

  const handleGeminiEnhance = () => {
    const key = getGeminiApiKey();
    if (!key) {
      setIsApiKeyModalOpen(true);
      return;
    }
    executeGeminiEnhance(key);
  };

  const handleUndoGemini = () => {
    if (!geminiSnapshot) return;

    setTitleValue(geminiSnapshot.title);

    if (editor) {
      editor.commands.setContent(geminiSnapshot.content, false);
    }

    onUpdateNote({
      title: geminiSnapshot.title,
      content: geminiSnapshot.content,
      preview: geminiSnapshot.preview
    });

    setCanUndoGemini(false);
    setGeminiSnapshot(null);
    onShowToast('Reverted title and content to original version.', 'info');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#note=${note.id}`;
    navigator.clipboard.writeText(url).then(
      () => {
        onShowToast('Local note link copied to clipboard!', 'success');
      },
      () => {
        onShowToast('Could not copy link', 'error');
      }
    );
  };

  const handleExportMarkdown = () => {
    const content = `# ${note.title}\n\nCategory: ${note.category}\nUpdated: ${note.updatedAt}\n\n${editor?.getText() || note.content}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported note as Markdown file', 'info');
  };

  const handleToolbarFormat = (cmd: string, val?: string) => {
    if (!editor) return;

    if (cmd === 'bold') editor.chain().focus().toggleBold().run();
    else if (cmd === 'italic') editor.chain().focus().toggleItalic().run();
    else if (cmd === 'strikeThrough') editor.chain().focus().toggleStrike().run();
    else if (cmd === 'formatBlock' && val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
    else if (cmd === 'formatBlock' && val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
    else if (cmd === 'insertUnorderedList') editor.chain().focus().toggleBulletList().run();
    else if (cmd === 'insertOrderedList') editor.chain().focus().toggleOrderedList().run();
    else if (cmd === 'formatBlock' && val === 'blockquote') editor.chain().focus().toggleBlockquote().run();
    else if (cmd === 'formatBlock' && val === 'pre') editor.chain().focus().toggleCodeBlock().run();
    else if (cmd === 'createLink' && val) editor.chain().focus().setLink({ href: val }).run();
    else if (cmd === 'undo') editor.chain().focus().undo().run();
    else if (cmd === 'redo') editor.chain().focus().redo().run();
  };

  const catConfig = CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.Others;

  // Breadcrumb label
  const breadcrumbCategory = selectedCategory
    ? selectedCategory
    : currentView === 'favorites'
    ? 'Favorites'
    : currentView === 'trash'
    ? 'Trash'
    : 'All Notes';

  return (
    <main
      className="relative flex-1 h-full min-w-0 bg-white dark:bg-[#1A233A] rounded-2xl border border-[#E9EDF5] dark:border-[#283655] flex flex-col overflow-hidden shadow-soft transition-colors"
      aria-label="Note Editor"
    >
      {/* Top Header Row */}
      <div className="px-7 py-5 flex items-center justify-between border-b border-[#F0F2F8] dark:border-[#283655]/60 flex-shrink-0">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-[13.5px] text-[#7183A6] dark:text-[#94A3B8]">
          <button
            onClick={onNavigateHome}
            className="hover:text-[#142039] dark:hover:text-white transition-colors"
          >
            {breadcrumbCategory}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#A0AEC0]" />
          <span className="text-[#142039] dark:text-[#F1F5F9] font-medium truncate max-w-[240px]">
            {note.title || 'Untitled Note'}
          </span>
        </div>

        {/* Right Action Icons: Drive Sync, Save, Edit, Star, Link, Ellipsis */}
        <div className="flex items-center gap-2 relative">
          {/* Google Drive Sync Status / Connect Button */}
          {driveConnected ? (
            <div
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 text-[12px] font-medium select-none"
              title="Notes automatically upload to your Google Drive 'NoteNest' folder"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Drive Synced</span>
            </div>
          ) : (
            <button
              onClick={async () => {
                const granted = await requestDrivePermission();
                if (granted) {
                  onShowToast('Google Drive connected! Notes will auto-upload on save.', 'success');
                }
              }}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[#5A6E8C] dark:text-[#C5CEE4] hover:bg-[#F0EDFF] hover:text-[#5145FF] dark:hover:bg-[#253255] border border-dashed border-[#D5DDEB] dark:border-[#283655] text-[12px] font-medium transition-colors"
              title="Connect Google Drive to auto-upload notes on save"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Connect Drive</span>
            </button>
          )}

          {/* Save Button */}
          <button
            onClick={handleForceSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
              isJustSaved
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 shadow-sm'
                : 'bg-[#F0EDFF] hover:bg-[#E4DEFD] active:bg-[#D7CEFC] text-[#5145FF] dark:bg-[#232047] dark:hover:bg-[#2D285A] dark:text-[#A78BFA] border border-[#D4C6FC]/60 dark:border-[#4E3F78]/60 shadow-sm'
            }`}
            title="Save note (Ctrl+S)"
            aria-label="Save note"
          >
            {isJustSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in-75 duration-150" />
                <span className="font-semibold">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#5145FF] dark:text-[#A78BFA]" />
                <span className="font-semibold">Save</span>
              </>
            )}
          </button>

          {/* Edit / Formatting Bar Toggle */}
          <button
            onClick={() => setShowToolbar(!showToolbar)}
            className={`p-2 rounded-xl text-[#5A6E8C] dark:text-[#C5CEE4] hover:bg-[#F6F8FC] dark:hover:bg-[#253255] transition-colors ${
              showToolbar ? 'bg-[#F0EDFF] text-[#5145FF] dark:bg-[#2A2B55]' : ''
            }`}
            title="Toggle rich text toolbar"
            aria-label="Toggle rich text toolbar"
          >
            <Edit3 className="w-[18px] h-[18px]" />
          </button>

          {/* Star / Favorite */}
          <button
            onClick={() => {
              onUpdateNote({ favorite: !note.favorite });
              onShowToast(
                note.favorite ? 'Removed from favorites' : 'Added to favorites',
                'success'
              );
            }}
            className="p-2 rounded-xl text-[#5A6E8C] dark:text-[#C5CEE4] hover:bg-[#F6F8FC] dark:hover:bg-[#253255] transition-colors"
            title={note.favorite ? 'Favorited' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Star
              className={`w-[18px] h-[18px] transition-transform active:scale-125 ${
                note.favorite
                  ? 'fill-[#F59E0B] text-[#F59E0B]'
                  : 'hover:text-[#F59E0B]'
              }`}
            />
          </button>

          {/* Local Share Link */}
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl text-[#5A6E8C] dark:text-[#C5CEE4] hover:bg-[#F6F8FC] dark:hover:bg-[#253255] transition-colors"
            title="Copy local link to this note"
            aria-label="Copy note link"
          >
            <LinkIcon className="w-[18px] h-[18px]" />
          </button>

          {/* More actions menu toggle */}
          <button
            onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
            className={`p-2 rounded-xl text-[#5A6E8C] dark:text-[#C5CEE4] hover:bg-[#F6F8FC] dark:hover:bg-[#253255] transition-colors ${
              actionsMenuOpen ? 'bg-[#F0EDFF] dark:bg-[#253255]' : ''
            }`}
            title="More actions"
            aria-label="More actions"
          >
            <MoreVertical className="w-[18px] h-[18px]" />
          </button>

          {/* Actions Popover Menu */}
          <NoteActionsMenu
            note={note}
            isOpen={actionsMenuOpen}
            onClose={() => setActionsMenuOpen(false)}
            onUpdateCategory={(cat) => {
              onUpdateNote({ category: cat });
              onShowToast(`Category changed to ${cat}`, 'info');
            }}
            onTogglePin={() => {
              onUpdateNote({ pinned: !note.pinned });
              onShowToast(note.pinned ? 'Note unpinned' : 'Note pinned to top', 'info');
            }}
            onToggleFavorite={() => {
              onUpdateNote({ favorite: !note.favorite });
              onShowToast(
                note.favorite ? 'Removed from favorites' : 'Added to favorites',
                'success'
              );
            }}
            onDuplicate={() => onDuplicateNote(note)}
            onExport={handleExportMarkdown}
            onDelete={() => onDeleteNote(note.id)}
            onRestore={onRestoreNote ? () => onRestoreNote(note.id) : undefined}
          />
        </div>
      </div>

      {/* Editor Content Area (Scrollable independently) */}
      <div className="flex-1 overflow-y-auto px-8 py-7 custom-scrollbar">
        {/* Deleted Note Banner if in trash */}
        {note.deleted && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between">
            <span className="text-[13.5px] text-rose-700 dark:text-rose-300 font-medium">
              This note is in the Trash.
            </span>
            <div className="flex items-center gap-2">
              {onRestoreNote && (
                <button
                  onClick={() => onRestoreNote(note.id)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-[#1A233A] text-emerald-600 border border-emerald-300 dark:border-emerald-800 rounded-lg text-[12.5px] font-semibold hover:bg-emerald-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </button>
              )}
              <button
                onClick={() => onDeleteNote(note.id)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 text-white rounded-lg text-[12.5px] font-semibold hover:bg-rose-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Forever
              </button>
            </div>
          </div>
        )}

        {/* Optional Rich Text Toolbar */}
        {showToolbar && (
          <EditorToolbar
            onFormat={handleToolbarFormat}
            canUndo={editor?.can().undo()}
            canRedo={editor?.can().redo()}
          />
        )}

        {/* Note Title with Leading Emoji */}
        <div className="flex items-center gap-3.5 mb-3 group">
          {note.icon && (
            <span className="text-[32px] leading-none select-none flex-shrink-0">
              {note.icon}
            </span>
          )}
          <input
            ref={titleInputRef}
            type="text"
            value={titleValue}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            className="w-full text-[32px] font-bold text-[#142039] dark:text-[#F1F5F9] bg-transparent border-none outline-none tracking-[-0.6px] leading-[1.25] placeholder-[#B0BFD8] focus:ring-0 p-0"
            aria-label="Note Title"
          />
        </div>

        {/* Note Metadata Row */}
        <div className="flex items-center flex-wrap gap-4 text-[13px] text-[#5A6E8C] dark:text-[#94A3B8] mb-7 select-none">
          {/* Category Tag Badge */}
          <span
            className={`px-3 py-1 rounded-md text-[12px] font-semibold tracking-wide ${catConfig.bgClass} ${catConfig.textClass} ${catConfig.darkBgClass}`}
          >
            {note.category}
          </span>

          {/* Date info */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#8E9EB5]" />
            <span>{note.displayDate || formatFullDate(note.createdAt)}</span>
          </div>

          {/* Relative timestamp */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8E9EB5]" />
            <span>{formatRelativeTime(note.updatedAt)}</span>
          </div>

          {/* Auto-save status */}
          <div className="ml-auto text-[12px] flex items-center gap-1 text-[#8E9EB5]">
            {saveStatus === 'saving' ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Saved</span>
              </>
            )}
          </div>
        </div>

        {/* Main Document Body */}
        <div className="editor-content pb-4">
          <EditorContent editor={editor} />
        </div>

        {/* Callout section for Project Ideas or customizable callout */}
        {note.title.toLowerCase().includes('project ideas') && (
          <EditorCallout
            question="Which one should I build first?"
            supportingText="Let's decide based on your interest and available time!"
          />
        )}
      </div>

      {/* Floating Gemini AI Action Bar at Bottom of Editor */}
      <div className="absolute bottom-6 right-8 z-30 flex items-center gap-2.5 pointer-events-auto select-none">
        {canUndoGemini && (
          <button
            onClick={handleUndoGemini}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-[#1A233A] hover:bg-[#F6F8FC] dark:hover:bg-[#253255] text-[#42577D] dark:text-[#C5CEE4] border border-[#D5DDEB] dark:border-[#283655] rounded-2xl shadow-lg hover:shadow-xl text-[13px] font-semibold transition-all transform active:scale-95 animate-in slide-in-from-bottom-2 fade-in duration-200"
            title="Revert to original note before Gemini formatting"
            aria-label="Undo Gemini formatting"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#5145FF] dark:text-[#A78BFA]" />
            <span>Undo Gemini</span>
          </button>
        )}

        <button
          onClick={handleGeminiEnhance}
          disabled={isGeminiLoading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13.5px] font-semibold text-white shadow-lg transition-all duration-200 transform active:scale-95 ${
            isGeminiLoading
              ? 'bg-gradient-to-r from-[#6654FF] to-[#8B5CF6] opacity-90 cursor-wait'
              : 'bg-gradient-to-r from-[#5145FF] via-[#6654FF] to-[#8B5CF6] hover:from-[#4336EA] hover:to-[#7C3AED] hover:shadow-xl hover:-translate-y-0.5'
          }`}
          title="Restructure, format with headings & bullets, and correct grammar with Gemini"
          aria-label="Format with Gemini AI"
        >
          {isGeminiLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Formatting with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#FDE047] animate-pulse" />
              <span>Format with Gemini</span>
            </>
          )}
        </button>
      </div>

      {/* Gemini API Key Configuration Modal */}
      <GeminiApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveKey={(savedKey) => {
          onShowToast('Gemini API key saved!', 'success');
          executeGeminiEnhance(savedKey);
        }}
      />
    </main>
  );
};
