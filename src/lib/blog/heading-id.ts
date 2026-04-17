/**
 * Converts a heading text to a URL-friendly ID.
 * Used by both MarkdownRenderer (sets `id` on headings) and TableOfContents
 * (builds anchor hrefs) to keep TOC links consistent.
 */
export function headingToId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
