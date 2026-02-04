import { Website } from 'models/website';

/**
 * Checks if a website is configured for B2B (Business-to-Business) customers.
 * B2B websites are identified by having zsThemeID === 'af'.
 * 
 * const isB2B = getIsB2B(zsThemeID);
 *
 * @param website - The website object to check, or a zsThemeID string
 * @returns true if the website is B2B, false otherwise
 */
export function getIsB2B(
  website: Website | { zsThemeID?: string } | string
): boolean {
  if (typeof website === 'string') {
    return website === 'af';
  }
  return website.zsThemeID === 'af';
}
