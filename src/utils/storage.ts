import { Note, NotificationItem } from '../types/note';
import { INITIAL_NOTES, INITIAL_NOTIFICATIONS } from '../data/seedData';

const BASE_NOTES_KEY = 'notenest_notes_v1';
const THEME_KEY = 'notenest_theme_v1';
const NOTIFICATIONS_KEY = 'notenest_notifications_v1';
const BASE_ACTIVE_NOTE_KEY = 'notenest_active_note_v1';

// In-memory fallback
const memoryStore: Record<string, string> = {};

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key) ?? memoryStore[key] ?? null;
  } catch {
    return memoryStore[key] ?? null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // fallback
  }
  memoryStore[key] = value;
}

export function getNotesStorageKey(userSub?: string): string {
  if (userSub && userSub.trim()) {
    return `notenest_notes_${userSub.trim()}`;
  }
  return BASE_NOTES_KEY;
}

export function getActiveNoteStorageKey(userSub?: string): string {
  if (userSub && userSub.trim()) {
    return `notenest_active_note_${userSub.trim()}`;
  }
  return BASE_ACTIVE_NOTE_KEY;
}

/**
 * Loads notes namespaced by user sub.
 * If user has no existing notes, migrates legacy demo notes or seeds default data.
 * Never overwrites existing user notes with seed data.
 */
export function loadNotes(userSub?: string): Note[] {
  const key = getNotesStorageKey(userSub);
  const raw = safeGet(key);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing notes from storage', e);
    }
  }

  // If this is a specific user and no namespaced data exists yet,
  // check for legacy un-namespaced notes to migrate
  if (userSub) {
    const legacyRaw = safeGet(BASE_NOTES_KEY);
    if (legacyRaw) {
      try {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
          saveNotes(legacyParsed, userSub);
          return legacyParsed;
        }
      } catch {
        // Fall through to initial notes
      }
    }
  }

  // Default seed for first-time user
  saveNotes(INITIAL_NOTES, userSub);
  return INITIAL_NOTES;
}

export function saveNotes(notes: Note[], userSub?: string): void {
  const key = getNotesStorageKey(userSub);
  safeSet(key, JSON.stringify(notes));
}

export function loadTheme(): 'light' | 'dark' {
  const theme = safeGet(THEME_KEY);
  if (theme === 'dark' || theme === 'light') return theme;
  return 'light';
}

export function saveTheme(theme: 'light' | 'dark'): void {
  safeSet(THEME_KEY, theme);
}

export function loadNotifications(): NotificationItem[] {
  const raw = safeGet(NOTIFICATIONS_KEY);
  if (!raw) {
    saveNotifications(INITIAL_NOTIFICATIONS);
    return INITIAL_NOTIFICATIONS;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fallback
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveNotifications(notifications: NotificationItem[]): void {
  safeSet(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function loadActiveNoteId(availableNotes: Note[], userSub?: string): string {
  const key = getActiveNoteStorageKey(userSub);
  const savedId = safeGet(key);
  if (savedId && availableNotes.some((n) => n.id === savedId && !n.deleted)) {
    return savedId;
  }
  const first = availableNotes.find((n) => !n.deleted) || availableNotes[0];
  return first ? first.id : '';
}

export function saveActiveNoteId(id: string, userSub?: string): void {
  const key = getActiveNoteStorageKey(userSub);
  safeSet(key, id);
}
