import { describe, expect, test } from '@jest/globals';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { SearchParams, SearchQueryInput } from './searchParams';

describe('fromSearchParams', () => {
  describe('with text query param', () => {
    test('Should add text param', () => {
      expect(
        SearchQueryInput.fromSearchParams(new SearchParams({ q: 'tops' }))
      ).toEqual({
        text: 'tops',
      });
    });
  });
  describe('with size param', () => {
    test('Should add size param', () => {
      expect(
        SearchQueryInput.fromSearchParams(new SearchParams({ Size: 'S' }))
      ).toEqual({
        tags: [{ key: 'Size', value: ['S'] }],
      });
    });
    test('Should add multiple sizes', () => {
      expect(
        SearchQueryInput.fromSearchParams(
          new SearchParams({ Size: ['S', 'M'] })
        )
      ).toEqual({
        tags: [{ key: 'Size', value: ['S', 'M'] }],
      });
    });
  });
  describe('with price range param', () => {
    test('Should add price range param', () => {
      expect(
        SearchQueryInput.fromSearchParams(
          new SearchParams({ price_range: '300-600' })
        )
      ).toEqual({
        '#Price': '300-600',
      });
    });
  });
  describe('with paging params', () => {
    test('Should paging params', () => {
      expect(
        SearchQueryInput.fromSearchParams(
          new SearchParams({
            page: '2',
          })
        )
      ).toEqual({ pageNumber: 2 });
    });
  });
  describe('with multiple param', () => {
    test('Should add all params', () => {
      expect(
        SearchQueryInput.fromSearchParams(
          new SearchParams({
            Size: ['M', 'S'],
            Color: ['Black', 'Red'],
            page: '2',
            sort_by: 'popular',
            sort_direction: 'ASCENDING',
            price_range: '300-600',
          })
        )
      ).toEqual({
        tags: [
          { key: 'Size', value: ['M', 'S'] },
          { key: 'Color', value: ['Black', 'Red'] },
          { key: 'sort_by', value: ['popular'] },
          { key: 'sort_direction', value: ['ASCENDING'] },
        ],
        pageNumber: 2,
        '#Price': '300-600',
      });
    });
  });
});

describe('fromURLSearchParams', () => {
  describe('with text query param', () => {
    test('Should add text param', () => {
      expect(
        SearchQueryInput.fromReadonlyURLSearchParams(
          new ReadonlyURLSearchParams(new URLSearchParams('q=tops'))
        )
      ).toEqual({
        text: 'tops',
      });
    });
  });
  describe('with size param', () => {
    test('Should add size param', () => {
      expect(
        SearchQueryInput.fromReadonlyURLSearchParams(
          new ReadonlyURLSearchParams(new URLSearchParams('Size=S'))
        )
      ).toEqual({
        tags: [{ key: 'Size', value: ['S'] }],
      });
    });
    test('Should add multiple sizes', () => {
      expect(
        SearchQueryInput.fromReadonlyURLSearchParams(
          new ReadonlyURLSearchParams(new URLSearchParams('Size=S&Size=M'))
        )
      ).toEqual({
        tags: [{ key: 'Size', value: ['S', 'M'] }],
      });
    });
  });
  describe('with price range param', () => {
    test('Should add price range param', () => {
      expect(
        SearchQueryInput.fromReadonlyURLSearchParams(
          new ReadonlyURLSearchParams(
            new URLSearchParams('price_range=300-600')
          )
        )
      ).toEqual({
        '#Price': '300-600',
      });
    });
  });
  describe('with paging params', () => {
    test('Should paging params', () => {
      expect(
        SearchQueryInput.fromReadonlyURLSearchParams(
          new ReadonlyURLSearchParams(
            new URLSearchParams(new URLSearchParams('page=2'))
          )
        )
      ).toEqual({ pageNumber: 2 });
    });
  });
  describe('with multiple param', () => {
    test('Should add all params', () => {
      expect(
        SearchQueryInput.fromReadonlyURLSearchParams(
          new ReadonlyURLSearchParams(
            new URLSearchParams(
              'page=2&sort_by=popular&Size=M&Size=S&price_range=300-600&Color=Black&Color=Red&sort_direction=ASCENDING'
            )
          )
        )
      ).toEqual({
        '#Price': '300-600',
        pageNumber: 2,
        tags: [
          { key: 'sort_by', value: ['popular'] },
          { key: 'Size', value: ['M', 'S'] },
          { key: 'Color', value: ['Black', 'Red'] },
          { key: 'sort_direction', value: ['ASCENDING'] },
        ],
      });
    });
  });

  describe('with singleSelect param', () => {
    test('Should add singleSelect param', () => {
      const searchParams = new ReadonlyURLSearchParams(
        new URLSearchParams('sort_by=popular&sort_direction=ASCENDING')
      );
      expect(
        SearchQueryInput.fromReadonlyURLSearchParams(searchParams)
      ).toEqual({
        tags: [
          { key: 'sort_by', value: ['popular'] },
          { key: 'sort_direction', value: ['ASCENDING'] },
        ],
      });
    });
  });
});

describe('updateFilter', () => {
  describe('with search params', () => {
    describe('with singleSelect is false', () => {
      test('Should add new filter to empty params', () => {
        const searchParams = new SearchParams();
        const filter = new SearchParams({
          Size: 'L',
        });
        searchParams.toogle(filter);
        expect(searchParams.toString()).toBe('?Size=L');
      });
      test('Should add new filter to URL', () => {
        const searchParams = SearchParams.fromReadonlyURLSearchParams(
          new ReadonlyURLSearchParams(new URLSearchParams('Size=S'))
        );
        const filter = new SearchParams({
          Size: 'L',
        });
        searchParams.toogle(filter);
        expect(searchParams.toString()).toBe('?Size=S&Size=L');
      });

      test('Should remove existed filter from URL', () => {
        const searchParams = SearchParams.fromReadonlyURLSearchParams(
          new ReadonlyURLSearchParams(new URLSearchParams('Size=S'))
        );
        const filter = new SearchParams({
          Size: 'S',
        });
        searchParams.toogle(filter);
        expect(searchParams.toString()).toBe('');
      });
    });

    describe('with singleSelect is true', () => {
      test('Should add new filter to empty params', () => {
        const searchParams = new SearchParams();
        const filter = new SearchParams({
          sort_by: 'popular',
        });
        searchParams.toogle(filter, true);
        expect(searchParams.toString()).toBe('?sort_by=popular');
      });
      test('Should replace existed filter from URL with new filter', () => {
        const searchParams = SearchParams.fromReadonlyURLSearchParams(
          new ReadonlyURLSearchParams(new URLSearchParams('sort_by=name'))
        );
        const filter = new SearchParams({
          sort_by: 'popular',
        });
        searchParams.toogle(filter, true);
        expect(searchParams.toString()).toBe('?sort_by=popular');
      });
    });
  });

  describe('without search params', () => {
    test('Should add filter to URL start with ?', () => {
      const searchParams = SearchParams.fromReadonlyURLSearchParams(
        new ReadonlyURLSearchParams(new URLSearchParams(''))
      );
      const filter = new SearchParams({
        Size: 'S',
      });
      searchParams.toogle(filter);
      expect(searchParams.toString()).toBe('?Size=S');
    });
  });
});
