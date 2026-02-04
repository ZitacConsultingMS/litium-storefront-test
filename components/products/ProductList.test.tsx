import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  generateImages,
  generateProductSearchResultData,
} from '__mock__/generateMockData';
import ProductList from 'components/products/ProductList';
import { EmptyWebsite, WebsiteContext } from 'contexts/websiteContext';
import { ProductSearchConnection } from 'models/products';
import { Website } from 'models/website';
import React from 'react';
import * as dataServiceClient from 'services/dataService.client';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual<typeof React>('react'),
  preload: jest.fn(),
}));

jest.mock('services/dataService.client', () => ({
  queryClient: jest.fn(),
}));

const MockWebsite: Website = {
  ...EmptyWebsite,
  imageServerUrl: 'https://localhost/',
};

describe('Product List Component', () => {
  test('should not render product on empty data', () => {
    const mockDataWithoutProduct: ProductSearchConnection =
      generateProductSearchResultData(0, 0);
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <ProductList {...mockDataWithoutProduct} />
      </WebsiteContext.Provider>
    );
    expect(screen.queryByTestId('product-card')).toBeNull();
  });
  test('should render 10 products', () => {
    const mockDataWithImage: ProductSearchConnection =
      generateProductSearchResultData(10, 3);
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <ProductList {...mockDataWithImage} />
      </WebsiteContext.Provider>
    );
    expect(screen.queryAllByTestId('product-card').length).toBe(10);
  });
  test('should render 10 products with images', () => {
    const mockDataWithImage: ProductSearchConnection =
      generateProductSearchResultData(10, 3);
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <ProductList {...mockDataWithImage} />
      </WebsiteContext.Provider>
    );
    expect(screen.queryAllByTestId('product-card').length).toBe(10);
    expect(screen.queryAllByTestId('product-card__image').length).toBe(10);
  });
  test('should render 10 products without image', () => {
    const mockDataWithoutImage: ProductSearchConnection =
      generateProductSearchResultData(10, 0);
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <ProductList {...mockDataWithoutImage} />
      </WebsiteContext.Provider>
    );
    expect(screen.queryAllByTestId('product-card').length).toBe(10);
    expect(screen.queryAllByTestId('product-card__image').length).toBe(0);
  });
  test('should query more data when clicking on load more button', async () => {
    const mockDataWithoutImage: ProductSearchConnection =
      generateProductSearchResultData(20, 0);
    mockDataWithoutImage.pageInfo.hasNextPage = true;
    const queryDataSpy = jest.spyOn(dataServiceClient, 'queryClient');
    queryDataSpy.mockResolvedValue({
      productSearch: {
        nodes: [
          {
            __typename: 'product',
            id: `${new Date().toDateString()}-21`,
            name: 'Product name 21',
            fields: {
              brand: 'Brand name 21',
            },
            description: 'Description 21',
            images: generateImages(0),
            price: {
              currency: 'SEK',
              unitPriceIncludingVat: 1000,
              unitPriceExcludingVat: 800,
              discountPriceIncludingVat: null,
              discountPriceExcludingVat: null,
            },
            url: '/product-card-21',
            stockStatus: {
              inStockQuantity: 1,
            },
            thumbnailImages: generateImages(0),
            articleNumber: 'article-number-21',
            isVariant: true,
          },
        ],
        edges: [],
        totalCount: 21,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    });
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <ProductList {...mockDataWithoutImage} />
      </WebsiteContext.Provider>
    );

    const loadMoreButton = screen.getByTestId('product-list__load-more');
    await userEvent.click(loadMoreButton);
    expect(loadMoreButton).toHaveTextContent('productlist.button.loading');
    expect(screen.queryAllByTestId('product-card__url').length).toBe(21);
  });
});
