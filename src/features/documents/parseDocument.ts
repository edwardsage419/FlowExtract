import { isAcceptedDocument, joinPageText } from './documentHelpers';
import type { DocumentRecord, ParseDocumentOptions } from './types';

function sourceKind(file: File): 'pdf' | 'image' {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return file.type === 'application/pdf' || extension === 'pdf' ? 'pdf' : 'image';
}

async function createOcrWorker(language: string) {
  const { createWorker } = await import('tesseract.js');
  return createWorker(language);
}

async function ocrImage(file: File, language: string, onProgress?: (message: string) => void): Promise<string> {
  onProgress?.('Loading local OCR engine...');
  const worker = await createOcrWorker(language);
  try {
    onProgress?.('Running OCR locally...');
    const result = await worker.recognize(file);
    return result.data.text.trim();
  } finally {
    await worker.terminate();
  }
}

async function parsePdf(file: File, options: ParseDocumentOptions): Promise<{ pages: string[]; ocrUsed: boolean }> {
  const pdfjs = await import('pdfjs-dist');
  const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const pages: string[] = [];
  const pagesNeedingOcr: number[] = [];
  const threshold = options.minTextCharsPerPage ?? 20;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    options.onProgress?.(`Reading PDF page ${pageNumber} of ${pdf.numPages}...`);
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push(text);
    if (text.length < threshold) pagesNeedingOcr.push(pageNumber);
  }

  if (pagesNeedingOcr.length === 0) return { pages, ocrUsed: false };

  const language = options.ocrLanguage ?? 'eng';
  const worker = await createOcrWorker(language);
  try {
    for (const pageNumber of pagesNeedingOcr) {
      options.onProgress?.(`OCR page ${pageNumber} of ${pdf.numPages} locally...`);
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.8 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Browser canvas is unavailable for scanned PDF OCR.');
      await page.render({ canvasContext: context, canvas, viewport }).promise;
      const result = await worker.recognize(canvas);
      pages[pageNumber - 1] = result.data.text.trim();
    }
  } finally {
    await worker.terminate();
  }

  return { pages, ocrUsed: true };
}

export async function parseDocument(file: File, options: ParseDocumentOptions = {}): Promise<DocumentRecord> {
  if (!isAcceptedDocument(file.name, file.type)) {
    throw new Error('Unsupported file type. Use PDF, PNG, JPG, or JPEG.');
  }

  const kind = sourceKind(file);
  let pages: string[];
  let ocrUsed = false;

  if (kind === 'pdf') {
    const parsed = await parsePdf(file, options);
    pages = parsed.pages;
    ocrUsed = parsed.ocrUsed;
  } else {
    const text = await ocrImage(file, options.ocrLanguage ?? 'eng', options.onProgress);
    pages = [text];
    ocrUsed = true;
  }

  return {
    id: crypto.randomUUID(),
    name: file.name,
    mimeType: file.type || (kind === 'pdf' ? 'application/pdf' : 'image/jpeg'),
    size: file.size,
    createdAt: new Date().toISOString(),
    text: joinPageText(pages),
    pages,
    sourceKind: kind,
    ocrUsed,
  };
}
