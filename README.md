# NoteNest 🪶

A minimal, airy, productivity-focused desktop notes web application built with **React**, **TypeScript**, **Tailwind CSS**, **TipTap**, and **Google Identity Services (Frontend-Only Authentication)**. NoteNest faithfully reproduces the design specifications of the provided reference interface at 1536 × 1024.

---

## ✨ Features

- **Google Sign-In (Frontend-Only)**:
  - Official Google Identity Services (GIS) integration using `google.accounts.id`.
  - Dedicated `/login` split-screen page matching NoteNest design with mountain illustration.
  - Automatic session restoration, client-side expiration checks, focus/visibility monitoring, and clean logout.
  - Open redirect protection (`sanitizeReturnUrl`).
  - Graceful configuration prompt if `VITE_GOOGLE_CLIENT_ID` is not yet configured.
- **Multi-Account Note Isolation**:
  - Notes are automatically namespaced by Google user subject ID (`notenest_notes_<sub_id>`).
  - Different Google accounts on the same browser have completely separated notes.
  - Demo notes are preserved without overwriting existing accounts.
- **AI Formatting with Google Gemini**:
  - Floating action button at the bottom of the editor.
  - Sends note content to Gemini to restructure into clean headings, bullet points, and fix spelling/grammar mistakes.
  - Replaces editor content seamlessly with animated loading state.
  - Contextual **Undo Gemini** button lets you revert back to your original note at any time until you make a new edit or save.
  - Configurable via `VITE_GEMINI_API_KEY` in `.env.local` or directly through the in-app modal.
- **Pixel-Accurate UI**: Faithfully matches the reference design layout, typography, proportions, colors, and shadows.
- **Deep Navy Sidebar (284px)**:
  - Custom vector brand feather logo with gradient illumination.
  - Active navigation highlight (`#303B59`) with note count badges.
  - Category tags with matching color dots: Work (5), Personal (3), Ideas (2), Learning (1), Others (1).
  - High-fidelity inline SVG mountain illustration card ("Small notes make big ideas").
  - Google authenticated profile with avatar picture, user name, and working Logout action.
- **Top Toolbar (72px)**:
  - Search field (560px × 42px) with instant search across titles, content, and categories.
  - Theme toggle (Light / Dark mode).
  - Interactive notification bell popover with unread dot counter.
- **Middle Notes List (416px)**:
  - Header with dynamic title, count badge, and violet-blue **+ New Note** button.
  - Floating note cards with emojis, title, 2-line snippet, category tag, relative timestamps (`2h ago`, `Yesterday`, etc.), and star/pin badges.
  - Selected card styled with soft lavender background (`#F0EDFF`) and lavender border.
  - Supports pinning notes to the top.
- **Rich Document Editor**:
  - Independent scrolling canvas with breadcrumbs (`All Notes > Project Ideas`).
  - Actions: Save button, rich text toolbar toggle, favorite star, local note link copy, and three-dot options menu.
  - Note title with leading emoji and auto-saving title input.
  - Metadata row with category badge, formatted date, relative time, and auto-save indicator.
  - TipTap rich text engine with headings, bold, italic, strikethrough, bullet lists, numbered lists, blockquotes, code blocks, and links.
  - Spec-accurate callout box for *Project Ideas* ("Which one should I build first?").
- **Trash & Soft Deletion**:
  - Move notes to Trash with restore capability.
  - Permanent deletion with accessible confirmation modal.
  - "Empty Trash" bulk action.
- **Keyboard Shortcuts**:
  - `⌘N` / `Ctrl+N`: Create new note
  - `⌘K` / `Ctrl+K`: Focus search bar
  - `⌘S` / `Ctrl+S`: Force save note
  - `Esc`: Dismiss popovers, menus, and modals

---

## 🔐 Google Cloud Console Setup (OAuth 2.0 Client ID)

To enable live Google Sign-In:

1. Open the **[Google Cloud Console](https://console.cloud.google.com/apis/credentials)**.
2. Select or create a project.
3. Go to **APIs & Services > OAuth consent screen**:
   - Choose **External** (or Internal for Google Workspace).
   - Fill in app name (e.g. `NoteNest`) and support email.
   - Add your email under test users if publishing in testing mode.
4. Go to **APIs & Services > Library**:
   - Search for **Google Drive API** and click **ENABLE**.
5. Go to **APIs & Services > Credentials > Create Credentials > OAuth client ID**:
   - Application type: **Web application**
   - Name: `NoteNest Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for local development)
     - `http://localhost:5173` (Vite fallback)
     - Your Cloudflare Pages domain (e.g. `https://your-app.pages.dev`)
   - *Note: No Authorized redirect URIs are required for Google Identity Services popup button mode.*
6. Copy the generated **Client ID** (format: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com`).
7. In your project directory, create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
   Add your Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```
8. Restart the development server (`./run.sh`).

---

## ☁️ Google Drive Sync Architecture

- **Scope**: `https://www.googleapis.com/auth/drive.file` (Non-sensitive; grants access **only** to files and folders created by NoteNest).
- **Dedicated Folder**: Automatically creates and uses a `NoteNest` folder in the authenticated user's Google Drive.
- **Auto-Upload on Save**: Every manual or debounced save uploads or updates `notenest_<id>.json` directly in Google Drive.
- **Initial Sync on Login**: Automatically checks Google Drive on login to restore or merge notes saved from other devices.
- **Permanent Deletion Sync**: Permanently deleted notes are cleaned up from Google Drive.
- **Offline Resilient**: Notes always save locally first to `localStorage`, so the app functions seamlessly even without an internet connection.

> ⚠️ **IMPORTANT**: Never provide a Google Client Secret. In a frontend-only application, a client secret is neither needed nor allowed.

---

## 🛡️ Security Limitations of Frontend-Only Authentication

- **No Server-Side Verification**: Because this application has no backend, the Google ID token's cryptographic signature cannot be verified server-side.
- **Client-Side Decoding**: The token payload is parsed on the client to extract profile fields (`name`, `email`, `picture`, `sub`) and expiration for UI rendering and session management.
- **Prototype / Local-Only Model**: This setup is intended for client-side prototypes, personal tools, and local storage workflows. It does not constitute a security boundary for highly sensitive or protected multi-tenant cloud data.
- **Device Local Storage**: Notes are persisted in browser `localStorage` namespaced by Google user ID. Notes do not leave this device or synchronize to Google Cloud.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or newer recommended)
- npm or yarn

### Quick Start

```bash
# 1. Run the local launch helper
./run.sh
```

Or with standard npm:
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm run preview
```

---

## 🏛️ Component Architecture

```
src/
├── types/
│   ├── auth.ts              # AuthUser, GoogleIdTokenPayload, AuthContextType
│   ├── google.d.ts          # Window.google.accounts.id global typings
│   └── note.ts              # Note, Category, NavView, Notification & Toast types
├── utils/
│   ├── auth.ts              # JWT parsing, claims validation, storage & expiry monitoring
│   ├── storage.ts           # Account-isolated storage (notenest_notes_<sub_id>)
│   └── date.ts              # Relative ("2h ago") & full date formatting
├── context/
│   └── AuthContext.tsx      # Central AuthProvider with auto-expiration & logout
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx    # Split-screen login view with mountain artwork & Google button
│   │   ├── ProtectedRoute.tsx # Route guard: redirects unauthenticated users to /login
│   │   ├── PublicOnlyRoute.tsx# Route guard: redirects authenticated users to /
│   │   └── LoadingScreen.tsx# Dark navy session validation screen (zero UI flash)
│   ├── BrandLogo.tsx        # Vector quill/feather logo SVG
│   ├── Sidebar.tsx          # 284px fixed navigation with Google profile & logout
│   ├── SidebarNavigation.tsx# Top navigation items with badges
│   ├── CategoryList.tsx     # 5 color-coded categories with counts
│   ├── SidebarPromoCard.tsx # Layered geometric mountain artwork card
│   ├── TopToolbar.tsx       # 72px top bar with search, theme, & bell
│   ├── SearchBar.tsx        # Search bar with clear button & ⌘K
│   ├── NotificationsPopover.tsx # Bell dropdown
│   ├── NotesPanel.tsx       # 416px middle list with + New Note
│   ├── NoteCard.tsx         # Note card with status indicators & tags
│   ├── NoteEditor.tsx       # Document canvas with breadcrumbs & TipTap
│   ├── EditorToolbar.tsx    # Rich formatting toolbar (H1, H2, Bold, Lists, Link)
│   ├── EditorCallout.tsx    # Pale blue callout card
│   ├── NoteActionsMenu.tsx  # Context menu (category picker, pin, duplicate, trash)
│   ├── ConfirmDialog.tsx    # Accessible modal dialog for permanent deletion
│   ├── Toast.tsx            # Floating action toasts
│   └── EmptyState.tsx       # Empty states for zero notes, search, & trash
├── test/
│   └── appLogic.test.ts     # 10 comprehensive core & auth logic unit tests
├── App.tsx                  # Root state orchestration, routing, & auth gates
├── main.tsx                 # Entry point
└── index.css                # Custom scrollbars, design tokens, & TipTap styles
```
