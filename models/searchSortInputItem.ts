import { SearchParams } from './searchParams';

export default class SearchSortItemInput {
  field?: string;
  order?: SearchSortOrder;
  [key: string]: any;

  constructor(_field?: string) {
    if (_field) {
      this.field = SearchSortItemInput.normalizeString(_field);
    }
  }

  /**
   * Creates an array SearchSortItemInput from a SearchParams.
   * @param params a searchParams object, returned by Pages (Server Components): https://beta.nextjs.org/docs/api-reference/file-conventions/page#searchparams-optional
   * @returns an array SearchSortItemInput
   */
  static fromSearchParams(params: SearchParams): SearchSortItemInput[] {
    const result = new SearchSortItemInput();
    const mappingKeys = Object.keys(SearchSortItemInput.paramMapping);

    Object.keys(params).forEach((param) => {
      if (mappingKeys.includes(param)) {
        result[SearchSortItemInput.paramMapping[param].name] =
          SearchSortItemInput.paramMapping[param].fn(params[param]);
      }
    });
    return Object.keys(result).length ? [result] : [];
  }
  static paramMapping: { [key: string]: { name: string; fn: Function } } = {
    sort_by: { name: 'field', fn: SearchSortItemInput.normalizeString },
    sort_direction: {
      name: 'order',
      fn: SearchSortItemInput.normalizeEnum,
    },
  };

  static normalizeString(param: string): string {
    if (param === '_name') {
      return param;
    }
    return `#${param}`;
  }

  static normalizeEnum(param: string): string {
    return param.toUpperCase();
  }

  static defaultProductSorting = [
    { field: '#articleNumber', order: 'ASCENDING' },
  ];
}

export enum SearchSortOrder {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
}
