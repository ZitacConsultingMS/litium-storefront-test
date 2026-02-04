/**
 * Utility functions for Motorsok category and product handling
 */

/**
 * Normalizes a URL by removing leading/trailing slashes.
 */
export function normalizeUrlPath(url: string): string {
  return url.replace(/^\//, '').replace(/\/$/, '');
}

/**
 * Gets path segments from a pathname.
 */
export function getPathSegments(pathname: string): string[] {
  return normalizeUrlPath(pathname).split('/').filter(Boolean);
}

/**
 * Gets category segments from a slug array (filters out 'motorsok' prefix).
 */
export function getCategorySegments(slugArray: string[]): string[] {
  return slugArray[0] === 'motorsok' ? slugArray.slice(1) : slugArray;
}

/**
 * Checks if a category is a valid level 1 category (brand).
 * Level 1 categories must have exactly 2 segments: motorsok/brand
 */
export function isLevel1Category(category: { url?: string }): boolean {
  if (!category?.url) return false;
  const urlPath = normalizeUrlPath(category.url);
  const segments = urlPath.split('/').filter(Boolean);
  return segments.length === 2 && segments[0] === 'motorsok';
}

/**
 * Checks if a category URL matches the current path.
 * For exact level (e.g., level 2 with 2 segments), uses exact match.
 * For deeper levels, uses prefix match.
 */
export function matchesPath(
  categoryUrl: string,
  currentPath: string,
  currentSegments: string[],
  targetLevel: number
): boolean {
  const catPath = normalizeUrlPath(categoryUrl);
  if (currentSegments.length === targetLevel) {
    return currentPath === catPath;
  }
  return currentPath === catPath || currentPath.startsWith(catPath + '/');
}

/**
 * Checks if content is a Motorsok category.
 */
export function isMotorsokCategory(content: {
  name?: string;
  url?: string;
}): boolean {
  if (!content) return false;
  const contentName = content.name?.toLowerCase() || '';
  const contentUrl = normalizeUrlPath(content.url || '');
  return (
    contentName.includes('motorsök') ||
    contentName.includes('motorsok') ||
    contentUrl === 'motorsok'
  );
}

/**
 * Finds a Motorsok parent in a parents array.
 */
export function findMotorsokParent(
  parents: Array<{ name?: string; url?: string }>
): { name?: string; url?: string } | null {
  return (
    parents?.find((parent) => {
      if (!parent?.name || !parent?.url) return false;
      const parentUrl = normalizeUrlPath(parent.url);
      const parentName = parent.name.toLowerCase();
      return (
        parentUrl === 'motorsok' ||
        parentName.includes('motorsök') ||
        parentName.includes('motorsok')
      );
    }) || null
  );
}

