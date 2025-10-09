/**
 * Generate a URL-safe slug from a WanderList name
 */
export function generateWanderListSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
}

/**
 * Generate the WanderList URL from a list name
 */
export function getWanderListUrl(name: string): string {
  const slug = generateWanderListSlug(name);
  return `/wanderlists/${slug}`;
}
