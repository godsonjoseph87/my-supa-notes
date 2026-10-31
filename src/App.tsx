import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopToolbar } from './components/TopToolbar';
import { NotesPanel } from './components/NotesPanel';
import { NoteEditor } from './components/NoteEditor';
import { Toast } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Note, NoteCategory, NavView, ToastMessage, NotificationItem } from './types/note';
import {
  loadNotes,
  saveNotes,
  loadTheme,
  saveTheme,
  loadNotifications,
  saveNotifications,
  loadActiveNoteId,
  saveActiveNoteId
} from './utils/storage';
import { ArrowLeft } from 'lucide-react';
import { fetchNotesFromDrive, deleteNoteFromDrive } from './services/googleDrive';

const MainDashboard: React.FC = () => {
  const { user, accessToken, setDriveSyncStatus } = useAuth();

  // Notes state namespaced by the authenticated Google user's sub
  const [notes, setNotes] = useState<Note[]>(() => loadNotes(user?.sub));
  const [selectedNoteId, setSelectedNoteId] = useState<string>(() =>
    loadActiveNoteId(notes, user?.sub)
  );

  const [currentView, setCurrentView] = useState<NavView>('all');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadNotifications()
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);

  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Toast notification helper
  const addToast = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Reload notes whenever user changes (switch account or restore)
  useEffect(() => {
    if (user?.sub) {
      const userNotes = loadNotes(user.sub);
      setNotes(userNotes);
      setSelectedNoteId(loadActiveNoteId(userNotes, user.sub));
    } else {
      // Clear in-memory notes on logout
      setNotes([]);
      setSelectedNoteId('');
    }
  }, [user?.sub]);

  // Sync notes from Google Drive
  const handleSyncDrive = useCallback(async (isManual = false) => {
    if (!accessToken || !user?.sub) return;

    setDriveSyncStatus('syncing');
    if (isManual) {
      addToast('Syncing with Google Drive...', 'info');
    }

    try {
      const driveNotes = await fetchNotesFromDrive(accessToken);

      if (driveNotes && driveNotes.length > 0) {
        setNotes((localNotes) => {
          const mergedMap = new Map<string, Note>();
          localNotes.forEach((n) => mergedMap.set(n.id, n));

          driveNotes.forEach((driveNote) => {
            const local = mergedMap.get(driveNote.id);
            if (!local) {
              mergedMap.set(driveNote.id, driveNote);
            } else {
              const driveTime = new Date(driveNote.updatedAt || 0).getTime();
              const localTime = new Date(local.updatedAt || 0).getTime();
              if (driveTime >= localTime) {
                mergedMap.set(driveNote.id, driveNote);
              }
            }
          });

          const merged = Array.from(mergedMap.values());
          saveNotes(merged, user.sub);
          return merged;
        });

        // Auto-select the newest note from Google Drive so it's immediately visible
        const sorted = [...driveNotes].sort(
          (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        );
        if (sorted[0]?.id) {
          setSelectedNoteId(sorted[0].id);
        }

        addToast(
          `Synced ${driveNotes.length} note${driveNotes.length > 1 ? 's' : ''} from Google Drive`,
          'success'
        );
      } else if (isManual) {
        addToast('Google Drive synced: no new notes found', 'info');
      }

      setDriveSyncStatus('synced');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Drive sync failed';
      console.warn('Drive sync error:', err);
      setDriveSyncStatus('error');
      addToast(`Drive sync: ${message}`, 'warning');
    }
  }, [accessToken, user?.sub, addToast, setDriveSyncStatus]);

  // Initial sync with Google Drive when authorized
  useEffect(() => {
    if (!accessToken || !user?.sub) return;
    handleSyncDrive(false);
  }, [accessToken, user?.sub, handleSyncDrive]);

  // Apply theme class to <html>
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Persist notes namespaced by user.sub
  useEffect(() => {
    if (user?.sub && notes.length > 0) {
      saveNotes(notes, user.sub);
    }
  }, [notes, user?.sub]);

  // Persist notifications
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Persist active note ID namespaced by user.sub
  useEffect(() => {
    if (selectedNoteId && user?.sub) {
      saveActiveNoteId(selectedNoteId, user.sub);
    }
  }, [selectedNoteId, user?.sub]);

  // Check URL hash for direct note linking (e.g. #note=note-1)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#note=')) {
        const id = hash.replace('#note=', '');
        const target = notes.find((n) => n.id === id);
        if (target) {
          setSelectedNoteId(id);
          if (target.deleted) setCurrentView('trash');
          else if (selectedCategory && target.category !== selectedCategory) {
            setSelectedCategory(target.category);
          }
          setMobileEditorOpen(true);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [notes, selectedCategory]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<NoteCategory, number> = {
      Work: 0,
      Personal: 0,
      Ideas: 0,
      Learning: 0,
      Others: 0
    };
    notes.forEach((note) => {
      if (!note.deleted && counts[note.category] !== undefined) {
        counts[note.category]++;
      }
    });
    return counts;
  }, [notes]);

  // Compute top-level navigation counts
  const allCount = useMemo(() => notes.filter((n) => !n.deleted).length, [notes]);
  const favoritesCount = useMemo(
    () => notes.filter((n) => !n.deleted && n.favorite).length,
    [notes]
  );
  const trashCount = useMemo(() => notes.filter((n) => n.deleted).length, [notes]);

  // Filtered and sorted notes list
  const filteredNotes = useMemo(() => {
    let result = notes.filter((n) => {
      if (currentView === 'trash') {
        return n.deleted;
      }
      if (n.deleted) return false;

      if (selectedCategory && n.category !== selectedCategory) {
        return false;
      }

      if (currentView === 'favorites' && !n.favorite) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = n.title.toLowerCase().includes(query);
        const contentMatch = n.content.toLowerCase().includes(query);
        const previewMatch = n.preview.toLowerCase().includes(query);
        const categoryMatch = n.category.toLowerCase().includes(query);
        return titleMatch || contentMatch || previewMatch || categoryMatch;
      }

      return true;
    });

    if (currentView === 'recent') {
      return [...result].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    return [...result].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, currentView, selectedCategory, searchQuery]);

  // Active note instance
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // Fallback active note selection
  useEffect(() => {
    if (filteredNotes.length > 0) {
      const existsInFiltered = filteredNotes.some((n) => n.id === selectedNoteId);
      if (!existsInFiltered) {
        setSelectedNoteId(filteredNotes[0].id);
      }
    }
  }, [filteredNotes, selectedNoteId]);

  // Create Note Action
  const handleCreateNote = useCallback(() => {
    const newNoteId = 'note-' + Date.now();
    const nowIso = new Date().toISOString();

    const newNote: Note = {
      id: newNoteId,
      title: 'Untitled Note',
      icon: '📝',
      category: selectedCategory || 'Others',
      favorite: false,
      pinned: false,
      deleted: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      preview: 'Start writing your new note...',
      content: '<p></p>'
    };

    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNoteId);
    setMobileEditorOpen(true);
    addToast('New note created', 'success');
  }, [selectedCategory, addToast]);

  // Update Note Action
  const handleUpdateNote = useCallback(
    (updatedFields: Partial<Note>) => {
      if (!selectedNoteId) return;

      const nowIso = new Date().toISOString();
      setNotes((prev) =>
        prev.map((note) =>
          note.id === selectedNoteId
            ? {
                ...note,
                ...updatedFields,
                updatedAt: nowIso
              }
            : note
        )
      );
    },
    [selectedNoteId]
  );

  // Toggle Favorite
  const handleToggleFavorite = useCallback(
    (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id === id) {
            const nextFav = !n.favorite;
            addToast(nextFav ? 'Added to favorites' : 'Removed from favorites', 'info');
            return { ...n, favorite: nextFav };
          }
          return n;
        })
      );
    },
    [addToast]
  );

  // Toggle Pin
  const handleTogglePin = useCallback(
    (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id === id) {
            const nextPinned = !n.pinned;
            addToast(nextPinned ? 'Note pinned to top' : 'Note unpinned', 'info');
            return { ...n, pinned: nextPinned };
          }
          return n;
        })
      );
    },
    [addToast]
  );

  // Move to Trash or Permanent Delete
  const handleDeleteNote = useCallback(
    (id: string) => {
      const target = notes.find((n) => n.id === id);
      if (!target) return;

      if (!target.deleted) {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, deleted: true } : n))
        );
        addToast('Note moved to Trash', 'info');
      } else {
        setConfirmDialog({
          isOpen: true,
          title: 'Delete Note Permanently?',
          message: `Are you sure you want to permanently delete "${target.title}"? This action cannot be undone.`,
          onConfirm: () => {
            setNotes((prev) => prev.filter((n) => n.id !== id));
            if (accessToken) {
              deleteNoteFromDrive(accessToken, id).catch((e) => console.warn(e));
            }
            setConfirmDialog((d) => ({ ...d, isOpen: false }));
            addToast('Note permanently deleted', 'warning');
          }
        });
      }
    },
    [notes, addToast]
  );

  // Restore Note from Trash
  const handleRestoreNote = useCallback(
    (id: string) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, deleted: false } : n))
      );
      addToast('Note restored from Trash', 'success');
    },
    [addToast]
  );

  // Empty Trash Action
  const handleEmptyTrash = useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      title: 'Empty Trash?',
      message:
        'Are you sure you want to permanently delete all notes in the Trash? This cannot be undone.',
      onConfirm: () => {
        setNotes((prev) => prev.filter((n) => !n.deleted));
        setConfirmDialog((d) => ({ ...d, isOpen: false }));
        addToast('Trash emptied permanently', 'warning');
      }
    });
  }, [addToast]);

  // Duplicate Note Action
  const handleDuplicateNote = useCallback(
    (noteToDuplicate: Note) => {
      const duplicateId = 'note-' + Date.now();
      const nowIso = new Date().toISOString();

      const duplicated: Note = {
        ...noteToDuplicate,
        id: duplicateId,
        title: `${noteToDuplicate.title} (Copy)`,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      setNotes((prev) => [duplicated, ...prev]);
      setSelectedNoteId(duplicateId);
      addToast('Note duplicated', 'success');
    },
    [addToast]
  );

  // Navigation handlers
  const handleSelectView = (view: NavView) => {
    setCurrentView(view);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleSelectCategory = (cat: NoteCategory | null) => {
    setSelectedCategory(cat);
    if (cat) {
      setCurrentView('all');
    }
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'info');
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    addToast('Notifications cleared', 'info');
  };

  // Keyboard Shortcuts: Ctrl/Cmd + N, Ctrl/Cmd + K, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNote();
        return;
      }

      if (e.key === 'Escape') {
        setSidebarMobileOpen(false);
        setConfirmDialog((d) => ({ ...d, isOpen: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCreateNote]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F6F8FC] dark:bg-[#0F172A] text-[#142039] dark:text-[#F1F5F9] font-sans antialiased">
      {/* 1. Dark Navy Fixed Sidebar */}
      <Sidebar
        currentView={currentView}
        selectedCategory={selectedCategory}
        onSelectView={handleSelectView}
        onSelectCategory={handleSelectCategory}
        allCount={allCount}
        favoritesCount={favoritesCount}
        trashCount={trashCount}
        categoryCounts={categoryCounts}
        isOpenMobile={sidebarMobileOpen}
        onCloseMobile={() => setSidebarMobileOpen(false)}
        onSyncDrive={() => handleSyncDrive(true)}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 lg:pl-[284px] transition-[padding] duration-300">
        {/* 2. Top Toolbar */}
        <TopToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
          onClearNotifications={handleClearNotifications}
          searchInputRef={searchInputRef}
          onToggleSidebarMobile={() => setSidebarMobileOpen(true)}
        />

        {/* 3. Main Workspace Area: Middle Notes List + Right Editor */}
        <div className="flex-1 flex min-h-0 overflow-hidden p-4 lg:p-5 lg:pt-4 gap-4">
          {/* Notes List Column */}
          <div
            className={`w-full lg:w-[416px] h-full flex flex-col ${
              mobileEditorOpen ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <NotesPanel
              notes={filteredNotes}
              selectedNoteId={selectedNoteId}
              onSelectNote={(id) => {
                setSelectedNoteId(id);
                setMobileEditorOpen(true);
              }}
              onCreateNote={handleCreateNote}
              onToggleFavorite={handleToggleFavorite}
              onTogglePin={handleTogglePin}
              currentView={currentView}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onEmptyTrash={handleEmptyTrash}
            />
          </div>

          {/* Note Editor Column */}
          <div
            className={`flex-1 h-full min-w-0 flex flex-col ${
              mobileEditorOpen ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {mobileEditorOpen && (
              <div className="lg:hidden mb-2">
                <button
                  onClick={() => setMobileEditorOpen(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1A233A] border border-[#E9EDF5] dark:border-[#283655] rounded-xl text-[13px] font-medium text-[#42577D] dark:text-[#C5CEE4]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to notes list
                </button>
              </div>
            )}

            <NoteEditor
              note={activeNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onRestoreNote={handleRestoreNote}
              onDuplicateNote={handleDuplicateNote}
              onShowToast={addToast}
              currentView={currentView}
              selectedCategory={selectedCategory}
              onNavigateHome={() => {
                setCurrentView('all');
                setSelectedCategory(null);
                setMobileEditorOpen(false);
              }}
            />
          </div>
        </div>
      </div>

      {/* Global Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((d) => ({ ...d, isOpen: false }))}
      />

      {/* Global Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export const App: React.FC = () => {
  // Simple, robust client-side routing tracking window.location.pathname
  const [currentPath, setCurrentPath] = useState<string>(
    () => window.location.pathname || '/'
  );

  const navigate = useCallback((to: string) => {
    if (window.location.pathname + window.location.search !== to) {
      window.history.pushState({}, '', to);
    }
    const cleanPath = to.split('?')[0] || '/';
    setCurrentPath(cleanPath);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <AuthProvider>
      {currentPath === '/login' ? (
        <PublicOnlyRoute onRedirect={navigate}>
          <LoginPage onSuccess={navigate} />
        </PublicOnlyRoute>
      ) : (
        <ProtectedRoute onRedirect={navigate}>
          <MainDashboard />
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
};

export default App;
