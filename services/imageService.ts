import { Image } from 'models/image';
import { buildServerUrl } from './urlService';

/**
 * Builds an absolute URL for an Image path where preconfigured host name process.env.RUNTIME_IMAGE_SERVER_URL or process.env.RUNTIME_LITIUM_SERVER_URL is used.
 * @remarks A relative Url might be returned if running on Litium Cloud, to reduce the roundtrip
 * @param image a Image.
 * @param baseUrl in case of calling from Client Components, a base Url should be provided.
 * The value can be retreived from WebsiteContext.
 * The base Url can also be provided to explicitly define the base URL.
 * @returns an absolute image URL
 */
export function getAbsoluteImageUrl(
  image: Image | null,
  baseUrl?: string
): string {
  if (!image?.url) {
    return '';
  }
  return buildServerUrl(
    image.url,
    baseUrl ?? process.env.RUNTIME_IMAGE_SERVER_URL
  );
}
