import { ReadonlyURLSearchParams } from 'next/navigation';

/**
 * Url search params, which comes from the request Url.
 */
export class SearchParams {
  [key: string]: any;

  constructor(data?: { [key: string]: any }) {
    data &&
      Object.keys(data).forEach((key) => {
        this[key] = data[key];
      });
  }

  /**
   * Creates a SearchParams from an ReadonlyURLSearchParams.
   * @param searchParams an ReadonlyURLSearchParams, usually returned by useSearchParams: https://beta.nextjs.org/docs/api-reference/use-search-params
   * @returns a SearchParams object.
   */
  static fromReadonlyURLSearchParams(
    searchParams: ReadonlyURLSearchParams
  ): SearchParams {
    const param = new SearchParams();
    if (searchParams) {
      searchParams.forEach((_, key) => {
        if (param[key]) {
          param[key] = searchParams.getAll(key);
        } else {
          param[key] = searchParams.get(key) || '';
        }
      });
    }
    return param;
  }

  /**
   * Clears filter from the query string.
   * @param searchParams an ReadonlyURLSearchParams, usually returned by useSearchParams: https://beta.nextjs.org/docs/api-reference/use-search-params
   * @returns a SearchParams object.
   */
  static clearFilter(searchParams: ReadonlyURLSearchParams): SearchParams {
    const param = new SearchParams();
    searchParams.forEach((_, key) => {
      if (key == 'q' || key == 'sort_by' || key == 'sort_direction') {
        if (param[key]) {
          param[key] = searchParams.getAll(key);
        } else {
          param[key] = searchParams.get(key) || '';
        }
      }
    });
    return param;
  }

  /**
   * Returns a query string suitable for use in a URL.
   * @returns A string, with the question mark. (Returns an empty string if no search parameters have been set.)
   */
  public toString(): string {
    const toQuery = (key: string, value: string) => {
      if (value) {
        return `${key}=${encodeURIComponent(value)}`;
      }
      return null;
    };
    const str = Object.keys(this)
      .map((key) => {
        if (Array.isArray(this[key])) {
          return this[key]
            .map((value: string) => toQuery(key, value))
            .filter((value: string) => value)
            .join('&');
        }
        return toQuery(key, this[key]);
      })
      .filter((value) => value)
      .join('&');
    return str ? '?' + str.toString() : '';
  }

  /**
   * Toogles a filter, remove it if it was selected, or add it if it was not.
   * @param filter a key-value filter object to toggle.
   * @param singleSelect flag to indicate if the filter is single or multiple select.
   * If singleSelect is true, only one item is added, the new one overrides the old one.
   * Otherwise, multiple items are added.
   */
  public toogle(filter: { [key: string]: any }, singleSelect = false) {
    Object.keys(filter).forEach((key) => {
      if (Object.hasOwn(this, key) && !singleSelect) {
        const value = filter[key];
        this[key] = Array.isArray(this[key]) ? this[key] : [this[key]];
        if (this[key].includes(value)) {
          this[key].splice(this[key].indexOf(value), 1);
        } else {
          this[key].push(value);
        }
      } else {
        this[key] = filter[key];
      }
    });
  }
}

/**
 * A search query to send to GraphQL
 */
export class SearchQueryInput {
  text?: string;
  tags?: ITagModelInput[];
  priceRanges?: IPriceRangeModelInput[];
  pageSize?: number;
  pageNumber?: number;
  sortBy?: string;
  sortDirection?: string;
  [key: string]: any;

  /**
   * Creates a SearchQueryInput from an ReadonlyURLSearchParams.
   * @param searchParams a search params, usually returned by useSearchParams: https://beta.nextjs.org/docs/api-reference/use-search-params
   * @returns a SearchQueryInput
   */
  static fromReadonlyURLSearchParams(
    searchParams: ReadonlyURLSearchParams
  ): SearchQueryInput {
    const param = SearchParams.fromReadonlyURLSearchParams(searchParams);
    return SearchQueryInput.fromSearchParams(param);
  }

  /**
   * Creates a SearchQueryInput from an SearchParams.
   * @param params a searchParams object, returned by Pages (Server Components): https://beta.nextjs.org/docs/api-reference/file-conventions/page#searchparams-optional
   * @returns a SearchQueryInput
   */
  static fromSearchParams(params: SearchParams): SearchQueryInput {
    const result = new SearchQueryInput();
    const mappingKeys = Object.keys(SearchQueryInput.paramMapping);
    Object.keys(params).forEach((param) => {
      if (mappingKeys.includes(param)) {
        result[SearchQueryInput.paramMapping[param].name] =
          SearchQueryInput.paramMapping[param].fn(params[param]);
      } else {
        result.tags = [
          ...(result.tags || []),
          SearchQueryInput.normalizeStringArray(param, params[param]),
        ];
      }
    });
    return result;
  }

  static paramMapping: { [key: string]: { name: string; fn: Function } } = {
    q: { name: 'text', fn: SearchQueryInput.normalizeString },
    price_range: { name: '#Price', fn: SearchQueryInput.normalizeEnum },
    page: { name: 'pageNumber', fn: SearchQueryInput.normalizeNumber },
    // TODO these fields should be returned from the server side so we can skip not-allowed fields
    //   'Size',
    //   'Color',
  };

  static normalizeStringArray(
    key: string,
    param: string | string[] | number
  ): ITagModelInput {
    return {
      key,
      value: Array.isArray(param) ? param : [param as string],
    };
  }

  static normalizeNumber(param: string): number {
    return +param;
  }

  static normalizeRange(param: string | string[]): IPriceRangeModelInput[] {
    const arr = Array.isArray(param) ? param : [param];
    return arr.map((p) => {
      const [from, to] = p.split('-');
      return {
        from: +from,
        to: +to,
      };
    });
  }

  static normalizeEnum(param: string): string {
    return param.toUpperCase();
  }

  static normalizeString(param: string): string {
    return param;
  }
}

export interface ITagModelInput {
  key: string;
  value: string[];
}

export interface IPriceRangeModelInput {
  from: number;
  to: number;
}
