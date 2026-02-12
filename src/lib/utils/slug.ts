/**
 * Generates a URL-safe slug from text.
 * Converts to lowercase, removes special characters, and replaces spaces with hyphens.
 * 
 * @param text - The text to convert to a slug
 * @returns URL-safe slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove accents and special characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace non-word characters (except spaces and hyphens) with nothing
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces or hyphens with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates if a string is a valid slug format.
 * 
 * @param slug - The slug to validate
 * @returns true if the slug is valid
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Generates a unique slug by appending a number if the slug already exists.
 * 
 * @param baseSlug - The base slug to start with
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = generateSlug(baseSlug);
  let counter = 1;
  
  const existingSet = new Set(existingSlugs);
  
  while (existingSet.has(slug)) {
    slug = `${generateSlug(baseSlug)}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Truncates text and adds ellipsis if it exceeds max length.
 * Useful for creating slugs from longer titles.
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum length (default: 50)
 * @returns Truncated text
 */
export function truncateForSlug(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).replace(/-+$/, '');
}
