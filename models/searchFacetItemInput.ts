import { ReadonlyURLSearchParams } from 'next/navigation';
import { SearchParams } from './searchParams';

interface IDistinctFacetItemInput {
  field: string;
  selected: string[];
}

interface IRangeFacetItemInput {
  field: string;
  selected: { min: string; max: string }[];
  maxBucketCount: number;
}

/**
 * A search facet item input to send to GraphQL
 */
export class SearchFacetItemInput {
  distinct?: IDistinctFacetItemInput;
  range?: IRangeFacetItemInput;

  static normalizeFacetDistinct(
    key: string,
    param: SearchParams
  ): SearchFacetItemInput {
    const result = new SearchFacetItemInput();
    result.distinct = {
      field: key,
      selected: key in param ? param[key] : [],
    };
    return result;
  }

  static normalizeFacetRange(
    key: string,
    param: SearchParams,
    maxBucketCount?: number
  ): SearchFacetItemInput {
    const result = new SearchFacetItemInput();
    let selected = [];
    const encodeKey = encodeId(key);
    if (encodeKey in param) {
      const arr = Array.isArray(param[encodeKey])
        ? param[encodeKey]
        : [param[encodeKey]];
      selected = arr.map((p: any) => {
        const [min, max] = p.split('-');
        return {
          min,
          max,
        };
      });
    }
    result.range = {
      field: key,
      maxBucketCount: maxBucketCount || 1,
      selected,
    };
    return result;
  }

  /**
   * Creates an array SearchFacetItemInput from an ReadonlyURLSearchParams.
   * @param searchParams a search params, usually returned by useSearchParams: https://beta.nextjs.org/docs/api-reference/use-search-params
   * @param filters an array of product filter fields
   * @returns an array SearchFacetItemInput
   */
  static fromReadonlyURLSearchParams(
    searchParams: ReadonlyURLSearchParams,
    filters?: { field: string }[]
  ): SearchFacetItemInput[] {
    const param = SearchParams.fromReadonlyURLSearchParams(searchParams);
    return SearchFacetItemInput.fromSearchParams(param, filters);
  }

  /**
   * Creates an array SearchFacetItemInput from an SearchParams.
   * @param params a searchParams object, returned by Pages (Server Components): https://beta.nextjs.org/docs/api-reference/file-conventions/page#searchparams-optional
   * @param filters an array of product filter fields
   * @returns an array SearchFacetItemInput
   */
  static fromSearchParams(
    params: SearchParams,
    filters?: { field: string }[]
  ): SearchFacetItemInput[] {
    const result: SearchFacetItemInput[] = [];
    if (filters) {
      filters.forEach((key) => {
        if (key.field === '#Price') {
          result.push({
            ...SearchFacetItemInput.normalizeFacetRange(key.field, params),
          });
        } else {
          result.push({
            ...SearchFacetItemInput.normalizeFacetDistinct(key.field, params),
          });
        }
      });
    }
    return result;
  }
}

export function encodeId(id: string) {
  return id.replace('#', '');
}
