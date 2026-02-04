/**
 * Builds an absolute URL for a simple URL string where preconfigured host name process.env.RUNTIME_IMAGE_SERVER_URL or process.env.RUNTIME_LITIUM_SERVER_URL is used.
 * @param urlString a URL string.
 * @param baseUrl in case of calling from Client Components, a base Url should be provided.
 * The value can be retreived from WebsiteContext.
 * @returns an absolute image URL
 */
export function getAbsoluteUrlFromString(
  urlString: string | null | undefined,
  baseUrl?: string
): string {
  if (!urlString) {
    return '';
  }
  const base =
    baseUrl ??
    (process.env.RUNTIME_IMAGE_SERVER_URL ||
      process.env.RUNTIME_LITIUM_SERVER_URL);
  if (!base) {
    return '';
  }
  return new URL(urlString, base).href;
}
