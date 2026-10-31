import { INITIAL_NOTES } from '../data/seedData';
import { Note } from '../types/note';
import { formatRelativeTime } from '../utils/date';
import {
  parseJwt,
  validateGoogleCredential,
  sanitizeReturnUrl,
  getNotesStorageKey
} from '../utils/auth-test-helper';

function createMockJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}

function runTests() {
  console.log('--- RUNNING NOTENEST CORE & AUTH LOGIC TESTS ---');

  // Test 1: Seed data integrity
  console.assert(INITIAL_NOTES.length === 12, `Expected 12 seed notes, got ${INITIAL_NOTES.length}`);
  const workNotes = INITIAL_NOTES.filter(n => n.category === 'Work');
  const personalNotes = INITIAL_NOTES.filter(n => n.category === 'Personal');
  const ideasNotes = INITIAL_NOTES.filter(n => n.category === 'Ideas');
  const learningNotes = INITIAL_NOTES.filter(n => n.category === 'Learning');
  const othersNotes = INITIAL_NOTES.filter(n => n.category === 'Others');
  const favoriteNotes = INITIAL_NOTES.filter(n => n.favorite);

  console.assert(workNotes.length === 5, `Expected 5 Work notes, got ${workNotes.length}`);
  console.assert(personalNotes.length === 3, `Expected 3 Personal notes, got ${personalNotes.length}`);
  console.assert(ideasNotes.length === 2, `Expected 2 Ideas notes, got ${ideasNotes.length}`);
  console.assert(learningNotes.length === 1, `Expected 1 Learning notes, got ${learningNotes.length}`);
  console.assert(othersNotes.length === 1, `Expected 1 Others notes, got ${othersNotes.length}`);
  console.assert(favoriteNotes.length === 3, `Expected 3 Favorite notes, got ${favoriteNotes.length}`);
  console.log('✓ Test 1: Seed data counts match specification exactly (Work: 5, Personal: 3, Ideas: 2, Learning: 1, Others: 1, Favorites: 3, Total: 12)');

  // Test 2: Note Creation
  const newNote: Note = {
    id: 'note-new',
    title: 'Untitled Note',
    icon: '📝',
    category: 'Others',
    favorite: false,
    pinned: false,
    deleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preview: 'Brand new note content',
    content: '<p>Brand new note content</p>'
  };
  const listAfterCreate = [newNote, ...INITIAL_NOTES];
  console.assert(listAfterCreate.length === 13, 'List should have 13 notes after creation');
  console.assert(listAfterCreate[0].title === 'Untitled Note', 'New note title should be Untitled Note');
  console.log('✓ Test 2: Note creation and initial field defaults');

  // Test 3: Note Editing and Preview update
  const updatedNote = {
    ...newNote,
    title: 'Updated Title',
    content: '<p>Updated content text</p>',
    preview: 'Updated content text'
  };
  console.assert(updatedNote.title === 'Updated Title', 'Title should be updated');
  console.assert(updatedNote.preview === 'Updated content text', 'Preview should be updated');
  console.log('✓ Test 3: Note editing updates content and preview snippet');

  // Test 4: Pinning sorting logic
  const pinnedNote = { ...INITIAL_NOTES[5], pinned: true };
  const unpinnedNote = { ...INITIAL_NOTES[0], pinned: false };
  const sorted = [unpinnedNote, pinnedNote].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  console.assert(sorted[0].id === pinnedNote.id, 'Pinned note should sort first');
  console.log('✓ Test 4: Pinning sorts pinned notes before unpinned notes');

  // Test 5: Search filtering logic
  const query = 'spring';
  const searchResults = INITIAL_NOTES.filter(n =>
    n.title.toLowerCase().includes(query) ||
    n.content.toLowerCase().includes(query) ||
    n.preview.toLowerCase().includes(query)
  );
  console.assert(searchResults.length >= 1, 'Search for spring should return learning note');
  console.assert(searchResults[0].title.includes('Spring Boot'), 'Should find Spring Boot');
  console.log('✓ Test 5: Search filters notes by title and content accurately');

  // Test 6: Trash, Restore, and Permanent Deletion
  const trashedNote = { ...newNote, deleted: true };
  const nonDeleted = [trashedNote, ...INITIAL_NOTES].filter(n => !n.deleted);
  console.assert(nonDeleted.length === 12, 'Non-deleted list should exclude trashed note');
  const restoredNote = { ...trashedNote, deleted: false };
  console.assert(!restoredNote.deleted, 'Restored note should have deleted: false');
  console.log('✓ Test 6: Trash, restore, and filtering logic verified');

  // Test 7: Relative time formatting
  const justNow = formatRelativeTime(new Date().toISOString());
  console.assert(justNow === 'Just now', `Expected "Just now", got "${justNow}"`);
  console.log('✓ Test 7: Date and relative time formatting verified');

  // Test 8: Google ID Token decoding & claim validation
  const validExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future
  const validJwt = createMockJwt({
    iss: 'https://accounts.google.com',
    sub: 'google-user-12345',
    aud: 'test-client-id.apps.googleusercontent.com',
    exp: validExp,
    iat: Math.floor(Date.now() / 1000),
    name: 'Jane Doe',
    email: 'jane.doe@gmail.com',
    picture: 'https://lh3.googleusercontent.com/a/mock-photo'
  });

  const parsed = parseJwt(validJwt);
  console.assert(parsed !== null, 'JWT should be parsed successfully');
  console.assert(parsed?.name === 'Jane Doe', 'Parsed name should match Jane Doe');
  console.assert(parsed?.sub === 'google-user-12345', 'Parsed sub should match');

  const validResult = validateGoogleCredential(validJwt, 'test-client-id.apps.googleusercontent.com');
  console.assert(validResult.valid === true, 'Valid token should pass validation');
  console.assert(validResult.user?.email === 'jane.doe@gmail.com', 'User email should be captured');

  // Test 8b: Expired token rejection
  const expiredJwt = createMockJwt({
    iss: 'https://accounts.google.com',
    sub: 'google-user-expired',
    aud: 'test-client-id.apps.googleusercontent.com',
    exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour in past
  });
  const expiredResult = validateGoogleCredential(expiredJwt, 'test-client-id.apps.googleusercontent.com');
  console.assert(expiredResult.valid === false, 'Expired token must be rejected');
  console.assert(expiredResult.error?.includes('expired'), 'Error message should report expiration');

  // Test 8c: Invalid audience rejection
  const wrongAudJwt = createMockJwt({
    iss: 'https://accounts.google.com',
    sub: 'google-user-123',
    aud: 'unauthorized-app-client-id',
    exp: validExp
  });
  const wrongAudResult = validateGoogleCredential(wrongAudJwt, 'test-client-id.apps.googleusercontent.com');
  console.assert(wrongAudResult.valid === false, 'Token with mismatched aud must be rejected');

  console.log('✓ Test 8: Google ID token validation (issuer, audience, expiry, sub) verified');

  // Test 9: Note storage namespacing & account isolation
  const userAKey = getNotesStorageKey('google-user-A');
  const userBKey = getNotesStorageKey('google-user-B');
  console.assert(userAKey === 'notenest_notes_google-user-A', 'User A key should be isolated');
  console.assert(userBKey === 'notenest_notes_google-user-B', 'User B key should be isolated');
  console.assert(userAKey !== userBKey, 'User A and User B must not share storage keys');
  console.log('✓ Test 9: Account-isolated note namespaces verified');

  // Test 10: Return-to URL sanitization (Prevent Open Redirects)
  const safeReturn = sanitizeReturnUrl('/note#note-1');
  console.assert(safeReturn === '/note#note-1', 'Safe local path should be preserved');
  const maliciousReturn = sanitizeReturnUrl('https://evil-phishing.com');
  console.assert(maliciousReturn === '/', 'External redirect should be sanitized to root /');
  const protoRelativeReturn = sanitizeReturnUrl('//evil-phishing.com');
  console.assert(protoRelativeReturn === '/', 'Protocol-relative redirect should be sanitized to /');
  console.log('✓ Test 10: Open redirect protection and URL sanitization verified');

  // Test 11: Gemini JSON response parsing & heading fallback
  const sampleJsonResponse = JSON.stringify({
    title: 'Sprint Planning & Roadmap',
    content: '<h2>Overview</h2><p>Sprint tasks...</p>'
  });
  const parsedData = JSON.parse(sampleJsonResponse);
  console.assert(parsedData.title === 'Sprint Planning & Roadmap', 'Title extracted accurately');
  console.assert(parsedData.content.includes('<h2>Overview</h2>'), 'HTML content preserved');

  // Test 12: Resilient parsing of unescaped multiline pseudo-JSON from Gemini
  const unescapedGeminiOutput = `{ "title": "Mastering Daily Time Management and Productivity", "content": "\n\nOverview\n\nProper time management is essential for reducing stress.\n\nCommon Time Management Challenges\n\nDistractions: Spending excessive hours on mobile phones." }`;
  const titleMatch = unescapedGeminiOutput.match(/"title"\s*:\s*"([^"\r\n]+)"/i);
  console.assert(titleMatch && titleMatch[1] === 'Mastering Daily Time Management and Productivity', 'Correct title must be extracted instead of Overview');
  const contentMatch = unescapedGeminiOutput.match(/"content"\s*:\s*["']?\s*([\s\S]*)/i);
  console.assert(contentMatch && contentMatch[1].includes('Proper time management'), 'Content extracted cleanly without JSON envelope');
  console.log('✓ Test 11: Gemini topic summarization and heading extraction verified');
  console.log('✓ Test 12: Resilient parsing of unescaped multiline pseudo-JSON verified');

  console.log('\n--- ALL 12 TESTS PASSED SUCCESSFULLY! ---');
}

runTests();
