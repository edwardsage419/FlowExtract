export type DocumentSourceKind = 'pdf' | 'image';

export interface DocumentRecord {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  text: string;
  pages: string[];
  sourceKind: DocumentSourceKind;
  ocrUsed: boolean;
}

export interface ParseDocumentOptions {
  ocrLanguage?: string;
  minTextCharsPerPage?: number;
  onProgress?: (message: string) => void;
}
