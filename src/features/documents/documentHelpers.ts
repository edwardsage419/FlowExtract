const ACCEPTED_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);
const ACCEPTED_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg']);

export function isAcceptedDocument(name: string, mimeType: string): boolean {
  if (ACCEPTED_MIME_TYPES.has(mimeType.toLowerCase())) return true;
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  return ACCEPTED_EXTENSIONS.has(extension);
}

export function joinPageText(pages: string[]): string {
  return pages.map((text, index) => `=== Page ${index + 1} ===\n${text.trim()}`).join('\n\n');
}
