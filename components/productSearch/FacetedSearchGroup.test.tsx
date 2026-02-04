import { render, screen } from '@testing-library/react';
import mockFacetFiltersData from '__mock__/facetedFiltersData';

import CartContextProvider, { EmptyCart } from 'contexts/cartContext';
import WebsiteContextProvider, { EmptyWebsite } from 'contexts/websiteContext';
import FacetedSearchGroup from './FacetedSearchGroup';

describe('Facet Search Group Component', () => {
  test('should render 10 filters of color', () => {
    const group = mockFacetFiltersData[0];

    render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={EmptyCart}>
          <FacetedSearchGroup group={group} />
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(
      screen.queryAllByTestId('faceted-filter-checkbox__label--Color').length
    ).toBe(5);
  });
  test('should render 4 filters of brand', () => {
    const group = mockFacetFiltersData[1];

    render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={EmptyCart}>
          <FacetedSearchGroup group={group} />
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(
      screen.queryAllByTestId('faceted-filter-checkbox__label--Brand').length
    ).toBe(4);
  });
  test('should render 4 filters of size', () => {
    const group = mockFacetFiltersData[2];

    render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={EmptyCart}>
          <FacetedSearchGroup group={group} />
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(
      screen.queryAllByTestId('faceted-filter-checkbox__label--Size').length
    ).toBe(4);
  });
  test('should render RangeFacet group if available', () => {
    const group = mockFacetFiltersData[3];

    render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={EmptyCart}>
          <FacetedSearchGroup group={group} />
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(
      screen.queryByTestId('faceted-filter-slider__range')
    ).toBeInTheDocument();
  });
});
