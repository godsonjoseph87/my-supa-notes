import { Note } from '../types/note';

export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

let cachedFolderId: string | null = null;

export function clearDriveCache(): void {
  cachedFolderId = null;
}

/**
 * Searches for or creates a dedicated 'NoteNest' folder in the user's Google Drive.
 */
export async function getOrCreateNoteNestFolder(accessToken: string): Promise<string> {
  if (cachedFolderId) return cachedFolderId;

  const searchQuery = "mimeType = 'application/vnd.google-apps.folder' and name = 'NoteNest' and trashed = false";
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=${encodeURIComponent('files(id,name)')}&spaces=drive`;

  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    console.warn(`Query Google Drive folder notice (${searchRes.status}): ${errorText}`);
    if (searchRes.status === 401) {
      throw new Error('Google Drive access expired. Please sign in again.');
    }
  } else {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      cachedFolderId = data.files[0].id;
      return cachedFolderId!;
    }
  }

  // Create 'NoteNest' folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'NoteNest',
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create NoteNest folder in Google Drive: ${errorText}`);
  }

  const folderData = await createRes.json();
  cachedFolderId = folderData.id;
  return cachedFolderId!;
}

/**
 * Uploads or updates a single note in the user's Google Drive NoteNest folder.
 */
export async function uploadNoteToDrive(
  accessToken: string,
  note: Note
): Promise<{ fileId: string; updated: boolean }> {
  const folderId = await getOrCreateNoteNestFolder(accessToken);
  const fileName = `notenest_${note.id}.json`;

  // Check if file already exists in folder
  const searchQuery = `name = '${fileName}' and '${folderId}' in parents and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=${encodeURIComponent('files(id,name)')}&spaces=drive`;

  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  let existingFileId: string | null = null;
  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      existingFileId = data.files[0].id;
    }
  }

  const fileContent = JSON.stringify(note, null, 2);

  if (existingFileId) {
    // Update existing file content
    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: fileContent
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Failed to update note in Google Drive: ${err}`);
    }

    return { fileId: existingFileId, updated: true };
  } else {
    // Multipart create new file in folder
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId],
      description: `NoteNest note: ${note.title}`
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const createUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/related; boundary=${boundary}'
      },
      body: multipartRequestBody
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to upload note to Google Drive: ${err}`);
    }

    const createdData = await createRes.json();
    return { fileId: createdData.id, updated: false };
  }
}

/**
 * Fetches all saved notes from Google Drive:
 * 1. Checks dedicated NoteNest folder.
 * 2. Also checks any NoteNest note files across the drive for seamless recovery.
 */
export async function fetchNotesFromDrive(accessToken: string): Promise<Note[]> {
  const folderId = await getOrCreateNoteNestFolder(accessToken);

  // Search files inside NoteNest folder
  const folderQuery = `'${folderId}' in parents and trashed = false`;
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(folderQuery)}&fields=${encodeURIComponent('files(id,name,mimeType,modifiedTime)')}&pageSize=100&spaces=drive`;

  const listRes = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!listRes.ok) {
    const err = await listRes.text();
    throw new Error(`Failed to list files from Google Drive: ${err}`);
  }

  const data = await listRes.json();
  const fileMap = new Map<string, { id: string; name: string; mimeType?: string }>();

  (data.files || []).forEach((f: { id: string; name: string; mimeType?: string }) => {
    if (f.mimeType !== 'application/vnd.google-apps.folder') {
      fileMap.set(f.id, f);
    }
  });

  // Also search for any files matching 'notenest' across Drive (in case folder moved or created earlier)
  try {
    const fallbackQuery = "name contains 'notenest' and trashed = false";
    const fallbackUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(fallbackQuery)}&fields=${encodeURIComponent('files(id,name,mimeType,modifiedTime)')}&pageSize=100&spaces=drive`;
    const fallbackRes = await fetch(fallbackUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      (fallbackData.files || []).forEach((f: { id: string; name: string; mimeType?: string }) => {
        if (f.mimeType !== 'application/vnd.google-apps.folder') {
          fileMap.set(f.id, f);
        }
      });
    }
  } catch {
    // Non-blocking fallback
  }

  const files = Array.from(fileMap.values());
  const notes: Note[] = [];

  // Download content for each note file in parallel
  const downloadPromises = files.map(async (file) => {
    try {
      const fileUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
      const fileRes = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (fileRes.ok) {
        const noteJson = await fileRes.json();
        if (noteJson && noteJson.id && (noteJson.title || noteJson.content !== undefined)) {
          notes.push(noteJson);
        }
      }
    } catch (e) {
      console.warn(`Could not read note file ${file.name}`, e);
    }
  });

  await Promise.all(downloadPromises);
  return notes;
}

/**
 * Deletes a note file from Google Drive when permanently deleted.
 */
export async function deleteNoteFromDrive(
  accessToken: string,
  noteId: string
): Promise<boolean> {
  try {
    const folderId = await getOrCreateNoteNestFolder(accessToken);
    const fileName = `notenest_${noteId}.json`;

    const searchQuery = `name = '${fileName}' and ('${folderId}' in parents or name contains 'notenest_')`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=${encodeURIComponent('files(id)')}&spaces=drive`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        for (const file of data.files) {
          await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` }
          });
        }
        return true;
      }
    }
    return false;
  } catch (err) {
    console.warn(`Error deleting note ${noteId} from Google Drive:`, err);
    return false;
  }
}


