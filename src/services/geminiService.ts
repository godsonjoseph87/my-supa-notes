const STORAGE_KEY = 'notenest_gemini_api_key';

export interface GeminiEnhancedResult {
  title: string;
  content: string;
}

export function getGeminiApiKey(): string {
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  if (envKey && envKey !== 'your-gemini-api-key') {
    return envKey;
  }
  return (localStorage.getItem(STORAGE_KEY) || '').trim();
}

export function saveGeminiApiKey(key: string): void {
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// In-memory cache for dynamically auto-resolved model
let cachedAutoModel: string | null = null;

/**
 * Auto-discovers and resolves available Gemini models supporting generateContent
 * for the provided API key. Queries Google's ListModels endpoint dynamically
 * and maintains a deep fallback list so 503/404/429 issues switch seamlessly.
 */
export async function resolveGeminiModels(apiKey: string): Promise<string[]> {
  let modelList: string[] = [];

  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { method: 'GET' }
    );

    if (listRes.ok) {
      const data = await listRes.json();
      const models = (data.models || []) as Array<{
        name: string;
        supportedGenerationMethods?: string[];
      }>;

      // Filter only models that support 'generateContent' and exclude audio/TTS/embedding models
      const valid = models
        .filter((m) => {
          const name = m.name.toLowerCase();
          if (
            name.includes('-tts') ||
            name.includes('-audio') ||
            name.includes('embedding') ||
            name.includes('imagen')
          ) {
            return false;
          }
          return m.supportedGenerationMethods?.includes('generateContent');
        })
        .map((m) => m.name.replace(/^models\//, ''));

      if (valid.length > 0) {
        // Priority scoring: Always start with Gemini 3.5, then 3.8, then latest Flash models
        valid.sort((a, b) => {
          const score = (name: string) => {
            if (name === 'gemini-3.5-flash') return 1000;
            if (name.includes('3.5-flash')) return 950;
            if (name.includes('3.5')) return 900;
            if (name === 'gemini-3.8-flash') return 800;
            if (name.includes('3.8-flash')) return 750;
            if (name.includes('3.8')) return 700;
            if (name.includes('3.0-flash')) return 600;

            const versionMatch = name.match(/gemini-(\d+(?:\.\d+)?)/i);
            const version = versionMatch ? parseFloat(versionMatch[1]) : 1.0;
            const isFlash = name.includes('flash');
            const isPro = name.includes('pro');

            let multiplier = 100;
            if (isFlash) multiplier = 200;
            else if (isPro) multiplier = 60;

            return version * multiplier;
          };
          return score(b) - score(a);
        });

        modelList = valid;
      }
    }
  } catch (err) {
    console.warn('Dynamic model discovery failed, using fallback list:', err);
  }

  // Comprehensive fallback models across generations starting with Gemini 3.5
  const defaults = [
    'gemini-3.5-flash',
    'gemini-3.5-pro',
    'gemini-3.8-flash',
    'gemini-3.8-pro',
    'gemini-3.0-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-pro-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro'
  ];

  for (const d of defaults) {
    if (!modelList.includes(d)) {
      modelList.push(d);
    }
  }

  // If a previously successful model was cached, prioritize it first while keeping all fallbacks
  if (cachedAutoModel && modelList.includes(cachedAutoModel)) {
    modelList = [cachedAutoModel, ...modelList.filter((m) => m !== cachedAutoModel)];
  }

  return modelList;
}

/**
 * Converts structured plain text or unformatted content into semantic HTML
 * with <h2> headings, <p> paragraphs, and <ul><li> bullet lists.
 */
export function formatPlainTextToHtml(text: string): string {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return '<p>No content</p>';

  const htmlParts: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line looks like a heading
    const isHeading =
      line.length < 60 &&
      !line.endsWith('.') &&
      !line.endsWith(',') &&
      (
        line.toLowerCase() === 'overview' ||
        line.toLowerCase().includes('challenges') ||
        line.toLowerCase().includes('strategies') ||
        line.toLowerCase().includes('summary') ||
        line.toLowerCase().includes('key points') ||
        line.toLowerCase().includes('takeaways') ||
        line.toLowerCase().includes('action items') ||
        line.toLowerCase().includes('conclusion') ||
        /^[A-Z0-9\s:_-]{3,40}$/.test(line)
      );

    const bulletMatch = line.match(/^[-*•]\s*(.*)$/) || line.match(/^(\d+\.)\s*(.*)$/);
    const colonItemMatch = line.match(/^([A-Za-z0-9\s_-]+):\s*(.*)$/);

    if (isHeading) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<h2>${line}</h2>`);
    } else if (bulletMatch) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      const itemText = bulletMatch[2] || bulletMatch[1];
      htmlParts.push(`<li>${itemText}</li>`);
    } else if (colonItemMatch && colonItemMatch[1].length < 35 && !line.startsWith('http')) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li><strong>${colonItemMatch[1]}:</strong> ${colonItemMatch[2]}</li>`);
    } else {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<p>${line}</p>`);
    }
  }

  if (inList) {
    htmlParts.push('</ul>');
  }

  return htmlParts.join('');
}

/**
 * Robust parser that extracts clean { title, content } from Gemini's response,
 * gracefully handling RFC JSON, markdown fences, unescaped newlines in JSON strings,
 * or raw HTML/text without letting raw JSON leak into the content.
 */
export function parseGeminiResponse(rawText: string, defaultTitle: string): GeminiEnhancedResult {
  let title = defaultTitle;
  let content = '';

  // 1. Try standard JSON.parse first
  try {
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    const parsed = JSON.parse(cleanJson);
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.title === 'string' && parsed.title.trim()) {
        title = parsed.title.trim();
      }
      if (typeof parsed.content === 'string' && parsed.content.trim()) {
        content = parsed.content.trim();
      }
    }
  } catch {
    // JSON.parse failed (likely due to unescaped multiline strings in model output)
  }

  // 2. If content is still empty, extract title and content via resilient regex
  if (!content) {
    const titleMatch = rawText.match(/"title"\s*:\s*"([^"\r\n]+)"/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    // Match "content": " ... " or "content": ` ... `
    const contentMatch = rawText.match(/"content"\s*:\s*(?:"""|"|'|`)([\s\S]*?)(?:"""|"|'|`)\s*\}?\s*$/i);
    if (contentMatch && contentMatch[1]) {
      content = contentMatch[1].trim();
    } else {
      // If closing quote is missing or malformed, extract everything after "content": "
      const startMatch = rawText.match(/"content"\s*:\s*["']?\s*([\s\S]*)/i);
      if (startMatch && startMatch[1]) {
        let extracted = startMatch[1].trim();
        // Remove trailing quotes, brackets, or braces
        extracted = extracted.replace(/["'}\s]+$/, '').trim();
        content = extracted;
      }
    }
  }

  // Strip markdown fences from content if present
  if (content.startsWith('```html')) {
    content = content.replace(/^```html\s*/i, '').replace(/\s*```$/, '');
  } else if (content.startsWith('```')) {
    content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // 3. If content does not have HTML tags, format it into clean semantic HTML
  if (content && !content.includes('<p>') && !content.includes('<h2>') && !content.includes('<div>') && !content.includes('<ul>')) {
    content = formatPlainTextToHtml(content);
  }

  // 4. Final safety fallback: If content is still empty, clean rawText and format it
  if (!content) {
    const cleanedRaw = rawText
      .replace(/^\s*\{?\s*"title":\s*"[^"]*",?\s*/i, '')
      .replace(/"content":\s*"?/i, '')
      .replace(/["'}\s]+$/, '')
      .trim();
    content = formatPlainTextToHtml(cleanedRaw || rawText);
  }

  return { title, content };
}

/**
 * Sends note content to Google Gemini to:
 * 1. Automatically detect active Gemini model (Auto Mode).
 * 2. Fall back seamlessly across alternative models if 503 (high demand), 429 (rate limit), or 404 occur.
 * 3. Summarize topic and extract a clear, concise title/heading.
 * 4. Restructure and format note content with headings, executive summary, bullet points, and grammar correction.
 */
export async function enhanceNoteWithGemini(
  content: string,
  title?: string,
  customApiKey?: string
): Promise<GeminiEnhancedResult> {
  const apiKey = customApiKey || getGeminiApiKey();

  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const prompt = `You are an expert editor, executive assistant, and note-taking specialist.
Analyze the following note content and perform two tasks:
1. Summarize the topic into a clear, concise title/heading (3 to 7 words, title case, capturing the core subject).
2. Restructure and format the note content in clean, semantic HTML:
   - Begin with a concise 1-2 sentence executive overview section (<h2>Overview</h2><p>...</p>).
   - Use <h2> or <h3> for section headings.
   - Use <p> for paragraphs.
   - Use <ul> and <li> for bullet lists, <ol> and <li> for sequential steps.
   - Use <strong> or <em> for emphasis and key concepts.
   - Fix all grammar, spelling, and punctuation errors.
   - Preserve all original facts, code snippets, links, and intent.
   - Do NOT wrap with markdown \`\`\`html code blocks. Output clean HTML.

You MUST respond strictly with a valid JSON object in this format:
{
  "title": "A Concise Title Summarizing The Topic",
  "content": "<h2>Overview</h2><p>Summary of note...</p><h2>Key Points</h2><ul><li><strong>Item:</strong> Details</li></ul>"
}

Current Note Title: ${title || 'Untitled'}
Current Note Content:
${content}`;

  // Automatically resolve active models with deep fallbacks
  const candidateModels = await resolveGeminiModels(apiKey);
  let lastError = '';

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
            maxOutputTokens: 3500
          }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let message = `Gemini API error (${response.status})`;

        const isRecoverable =
          response.status === 503 ||
          response.status === 429 ||
          response.status === 404 ||
          response.status === 400 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 504;

        try {
          const parsed = JSON.parse(errorBody);
          if (parsed.error?.message) {
            message = parsed.error.message;

            // If Google suggests a replacement model in the error text, queue it up next
            const match = message.match(/use models\/(gemini-[\w.-]+)/i);
            if (match && match[1]) {
              const suggested = match[1];
              if (!candidateModels.includes(suggested)) {
                candidateModels.splice(i + 1, 0, suggested);
              }
            }
          }
        } catch {
          // ignore parsing error
        }

        if (isRecoverable) {
          console.warn(
            `Gemini model "${model}" returned ${response.status} (${message}). Automatically falling back to next available model...`
          );
          if (cachedAutoModel === model) {
            cachedAutoModel = null;
          }
          lastError = message;
          continue;
        }

        throw new Error(message);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('No content returned from Gemini.');
      }

      // Model successfully answered! Cache this as the winning model
      cachedAutoModel = model;

      // Parse with resilient multi-tier parser
      const parsedResult = parseGeminiResponse(rawText, title || 'Untitled Note');
      return parsedResult;
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err.message.includes('not found') ||
          err.message.includes('modalities') ||
          err.message.includes('high demand') ||
          err.message.includes('temporarily') ||
          err.message.includes('503') ||
          err.message.includes('429'))
      ) {
        lastError = err.message;
        continue;
      }
      throw err;
    }
  }

  if (lastError.includes('high demand') || lastError.includes('503')) {
    throw new Error('Gemini models are currently experiencing high demand. Please retry in a few moments.');
  }

  throw new Error(lastError || 'All Gemini model candidates failed to respond.');
}
