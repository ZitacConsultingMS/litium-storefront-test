import { SearchParams } from 'models/searchParams';
import { ReadonlyURLSearchParams } from 'next/navigation';

/**
 * Builds a relative URL including searchParams.
 * @param path a pathname, usually returned by usePathname: https://nextjs.org/docs/app/api-reference/functions/use-pathname.
 * @param searchParams a search params, usually returned by useSearchParams: https://beta.nextjs.org/docs/api-reference/use-search-params.
 * @param filter a key-value filter object to toggle.
 * @param singleSelect flag to indicate if the filter is single or multiple select.
 * @returns a relative URL
 */
export function buildUrl(
  pathname: string,
  searchParams: ReadonlyURLSearchParams,
  filter: { [key: string]: any },
  singleSelect = false
): string {
  const searchParamsObj =
    SearchParams.fromReadonlyURLSearchParams(searchParams);
  searchParamsObj.toogle(filter, singleSelect);
  return `${pathname}${searchParamsObj.toString()}`;
}

/**
 * Builds an absolute URL to the Litium server, for a path where preconfigured host name process.env.RUNTIME_IMAGE_SERVER_URL or process.env.RUNTIME_LITIUM_SERVER_URL is used.
 * @remarks A relative Url might be returned if running on Litium Cloud, to reduce the roundtrip
 * @param pathname a pathname.
 * @param baseUrl in case of calling from Client Components, a base Url should be provided.
 * The value can be retreived from WebsiteContext.
 * The base Url can also be provided to explicitly define the base URL.
 * @returns an absolute URL to the Litium server
 */
export function buildServerUrl(pathname: string, baseUrl?: string): string {
  if (!baseUrl && process.env.RUNNING_IN_LITIUM_CLOUD === 'true') {
    // running in Litium Cloud
    return pathname;
  }
  let base = baseUrl || process.env.RUNTIME_LITIUM_SERVER_URL;
  if (!base) {
    return '';
  }
  return new URL(pathname, base).href;
}
