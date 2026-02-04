import { gql } from '@apollo/client';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockFacetedFiltersData from '__mock__/facetedFiltersData';
import { ProductSearchQueryInput } from 'models/productSearchQueryInput';
import { SearchFacetItemInput } from 'models/searchFacetItemInput';
import keyCode from 'rc-util/lib/KeyCode';
import * as dataServiceClient from 'services/dataService.client';
import FacetedFilterCompact from './FacetedFilterCompact';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: jest.fn().mockReturnValue('/'),
  useSearchParams: jest.fn(),
}));
jest.mock('services/dataService.client', () => ({
  queryClient: jest.fn(),
}));

describe('FacetedFilterCompact component', () => {
  test('should show popup filter on click Filter button', async () => {
    const facetedFilters = mockFacetedFiltersData;
    render(
      <FacetedFilterCompact facetedFilters={facetedFilters} totalCount={10} />
    );
    await userEvent.click(screen.getByTestId('faceted-filter__summary'));
    expect(screen.getByTestId('faceted-filter__popup')).toHaveClass(
      '!-inset-y-0 opacity-100'
    );
  });
  describe('on open popup', () => {
    beforeEach(async () => {
      const facetedFilters = [
        {
          field: 'Color',
          name: 'Color',
          __typename: 'DistinctFacet',
          items: [
            {
              name: 'Black',
              count: 55,
              selected: false,
              value: 'Black',
            },
            {
              name: 'Green',
              count: 31,
              selected: false,
              value: 'Green',
            },
          ],
        },
        {
          field: '#Price',
          name: 'Price',
          __typename: 'RangeFacet',
          items: [
            {
              min: 300,
              max: 3500,
              selectedMin: null,
              selectedMax: null,
            },
          ],
        },
      ];
      render(
        <FacetedFilterCompact
          facetedFilters={facetedFilters}
          totalCount={10}
          categoryId={'foo'}
        />
      );
      await userEvent.click(screen.getByTestId('faceted-filter__summary'));
    });
    test('should hide popup filter on click close button', async () => {
      await userEvent.click(screen.getByTestId('faceted-filter__close-btn'));
      expect(screen.getByTestId('faceted-filter__popup')).not.toHaveClass(
        '!-inset-y-0 opacity-100'
      );
    });
    test('should show zero selected filter on clicking the clear button', async () => {
      jest.spyOn(dataServiceClient, 'queryClient').mockResolvedValue({
        productSearch: {
          totalCount: 0,
        },
      });
      await userEvent.click(screen.getByTestId('faceted-filter__clear-btn'));
      expect(
        screen.getByTestId('faceted-filter__selected-filter-count')
      ).toHaveTextContent('0');
    });
    test('should show correctly total products on selecting filters', async () => {
      jest.spyOn(dataServiceClient, 'queryClient').mockResolvedValue({
        productSearch: {
          totalCount: 1,
        },
      });
      await userEvent.click(
        screen.queryAllByTestId('faceted-filter-checkbox__label--Color')[0]
      );
      expect(
        screen.getByTestId('faceted-filter__total-count')
      ).toHaveTextContent('1');
    });
    test('should keep URL when changing filter and close popup', async () => {
      const originalUrl = location.href;
      await userEvent.click(
        screen.queryAllByTestId('faceted-filter-checkbox__label--Size')[0]
      );
      await userEvent.click(
        screen.queryAllByTestId('faceted-filter-checkbox__label--Size')[1]
      );
      await userEvent.click(screen.getByTestId('faceted-filter__close-btn'));
      const currentURL = location.href;
      expect(originalUrl).toEqual(currentURL);
    });
    test('should have correctly URL on clicking the show button', async () => {
      jest.spyOn(dataServiceClient, 'queryClient').mockResolvedValueOnce({
        productSearch: {
          totalCount: 12,
        },
      });
      await userEvent.click(
        screen.queryAllByTestId('faceted-filter-checkbox__label--Color')[0]
      );
      await userEvent.click(
        screen.queryAllByTestId('faceted-filter-checkbox__label--Color')[1]
      );
      await userEvent.click(screen.getByTestId('faceted-filter__show-btn'));
      expect(mockPush).toHaveBeenCalledWith('/?Color=Black&Color=Green');
    });
    test('should send correctly categoryId value for API product search in category page', async () => {
      const getProductSearch = jest.spyOn(dataServiceClient, 'queryClient');
      getProductSearch.mockResolvedValueOnce({
        productSearch: {
          totalCount: 12,
        },
      });
      const productParams = new ProductSearchQueryInput({
        text: '',
        categoryId: 'foo',
      });
      const SEARCH = gql`
        query GetProductSearch(
          $productQuery: ProductSearchQueryInput!
          $facets: [SearchFacetItemInput!]
        ) {
          productSearch(query: $productQuery, facets: $facets) {
            totalCount
          }
        }
      `;
      const facets = SearchFacetItemInput.fromSearchParams({
        abc: 'test',
        toogle: () => {},
      });
      await userEvent.click(
        screen.queryAllByTestId('faceted-filter-checkbox__label--Color')[0]
      );
      expect(getProductSearch).toHaveBeenCalledWith({
        query: SEARCH,
        variables: {
          productQuery: { ...productParams },
          facets,
        },
      });
      expect(
        screen.getByTestId('faceted-filter__total-count')
      ).toHaveTextContent('12');
    });
    test('should render correct URL when slider is changed', async () => {
      jest.spyOn(dataServiceClient, 'queryClient').mockResolvedValueOnce({
        productSearch: {
          totalCount: 12,
        },
      });
      const slider = screen.getByTestId('faceted-filter-slider__range');
      const minThumb = slider.getElementsByClassName('rc-slider-handle')[0];

      // Simulate slider change
      fireEvent.keyDown(minThumb, {
        keyCode: keyCode.RIGHT,
      });

      await userEvent.click(screen.getByTestId('faceted-filter__show-btn'), {
        delay: 200,
      });

      expect(mockPush).toHaveBeenCalledWith('/?Price=301-3500');
    });
  });
  describe('on open popup without selected filter before', () => {
    beforeEach(async () => {
      const facetedFilters = [
        {
          field: 'Color',
          name: 'Color',
          __typename: 'DistinctFacet',
          items: [
            {
              name: 'Black',
              count: 55,
              selected: false,
              value: 'Black',
            },
            {
              name: 'Green',
              count: 31,
              selected: false,
              value: 'Green',
            },
          ],
        },
      ];
      render(
        <FacetedFilterCompact facetedFilters={facetedFilters} totalCount={10} />
      );
      await userEvent.click(screen.getByTestId('faceted-filter__summary'));
    });
    test('should show correct selected filter', async () => {
      jest.spyOn(dataServiceClient, 'queryClient').mockResolvedValue({
        productSearch: {
          totalCount: 1,
        },
      });
      expect(
        screen.getByTestId('faceted-filter__selected-filter-count')
      ).toHaveTextContent('0');
      await userEvent.click(
        screen.queryAllByTestId('faceted-filter-checkbox__label--Color')[0]
      );
      expect(
        screen.getByTestId('faceted-filter__selected-filter-count')
      ).toHaveTextContent('1');
      await userEvent.click(
        screen.queryAllByTestId('faceted-filter-checkbox__label--Color')[1]
      );
      expect(
        screen.getByTestId('faceted-filter__selected-filter-count')
      ).toHaveTextContent('2');
    });
  });
  describe('on open popup with selected filter before', () => {
    beforeEach(async () => {
      const facetedFilters = [
        {
          field: 'Color',
          name: 'Color',
          __typename: 'DistinctFacet',
          items: [
            {
              name: 'Black',
              count: 55,
              selected: true,
              value: 'Black',
            },
            {
              name: 'Green',
              count: 31,
              selected: false,
              value: 'Green',
            },
          ],
        },
      ];
      render(
        <FacetedFilterCompact facetedFilters={facetedFilters} totalCount={10} />
      );
      await userEvent.click(screen.getByTestId('faceted-filter__summary'));
    });
    test('should show correct selected filter', async () => {
      jest.spyOn(dataServiceClient, 'queryClient').mockResolvedValue({
        productSearch: {
          totalCount: 1,
        },
      });
      const filterCheckboxColors = screen.queryAllByTestId(
        'faceted-filter-checkbox__label--Color'
      );
      expect(
        screen.getByTestId('faceted-filter__selected-filter-count')
      ).toHaveTextContent('1');
      await userEvent.click(filterCheckboxColors[0]);
      expect(
        screen.getByTestId('faceted-filter__selected-filter-count')
      ).toHaveTextContent('0');

      await userEvent.click(filterCheckboxColors[1]);
      expect(
        screen.getByTestId('faceted-filter__selected-filter-count')
      ).toHaveTextContent('1');
    });
  });
});
