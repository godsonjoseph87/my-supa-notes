export type NoteCategory = 'Work' | 'Personal' | 'Ideas' | 'Learning' | 'Others';

export type NavView = 'all' | 'favorites' | 'recent' | 'trash';

export interface Note {
  id: string;
  title: string;
  icon?: string;
  preview: string;
  content: string; // HTML or markdown formatted content
  category: NoteCategory;
  favorite: boolean;
  pinned: boolean;
  deleted: boolean;
  displayDate?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: 'info' | 'success' | 'tip';
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
