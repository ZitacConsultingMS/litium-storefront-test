import { render, screen } from '@testing-library/react';
import { generateProductSearchResultData } from '__mock__/generateMockData';
import * as dataService from 'services/dataService.server';
import ProductsBlock, { ProductsBlockFields } from './ProductsBlock';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('services/dataService.server', () => ({
  queryServer: jest.fn(),
}));

describe('Products Block component', () => {
  test('should not render data if category and product list id are not available', async () => {
    const fields: ProductsBlockFields = {
      sorting: null,
      numberOfProducts: null,
      category: [],
      productList: [],
      title: null,
    };

    const ProductsBlockComponent = await ProductsBlock({
      fields: fields,
      systemId: 'foo',
      __typename: 'ProductsBlock',
    });
    render(ProductsBlockComponent);

    expect(
      screen.queryByTestId('horizontal-product-list__container')
    ).not.toBeInTheDocument();
  });

  test('should render correct data if category id is available', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      productSearch: generateProductSearchResultData(2, 2),
    });

    const fields: ProductsBlockFields = {
      sorting: [{ value: 'popular' }],
      numberOfProducts: 4,
      category: [
        {
          id: 'category-1',
        },
      ],
      productList: [],
      title: null,
    };

    const ProductsBlockComponent = await ProductsBlock({
      fields: fields,
      systemId: 'foo',
      __typename: 'ProductsBlock',
    });
    const { container } = render(ProductsBlockComponent);

    expect(dataService.queryServer).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          first: 4,
          query: {
            category: { includeChildren: true, categoryId: 'category-1' },
          },
          sorts: [{ field: '#popular' }],
        },
      })
    );
    expect(
      screen.queryByTestId('horizontal-product-list__container')
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.swiper-slide')).toHaveLength(2);
  });

  test('should render correct data if product list id is available', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      productSearch: generateProductSearchResultData(2, 2),
    });

    const fields: ProductsBlockFields = {
      sorting: [{ value: 'popular' }],
      numberOfProducts: 4,
      category: [],
      productList: [
        {
          id: 'product-list-1',
        },
      ],
      title: null,
    };

    const ProductsBlockComponent = await ProductsBlock({
      fields: fields,
      systemId: 'foo',
      __typename: 'ProductsBlock',
    });
    const { container } = render(ProductsBlockComponent);

    expect(dataService.queryServer).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          first: 4,
          query: {
            productList: { productListId: 'product-list-1' },
          },
          sorts: [{ field: '#popular' }],
        },
      })
    );
    expect(
      screen.queryByTestId('horizontal-product-list__container')
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.swiper-slide')).toHaveLength(2);
  });

  test('should render correct data if category and product list id are available', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      productSearch: generateProductSearchResultData(2, 2),
    });

    const fields: ProductsBlockFields = {
      sorting: null,
      numberOfProducts: null,
      category: [
        {
          id: 'category-1',
        },
      ],
      productList: [
        {
          id: 'product-list-1',
        },
      ],
      title: null,
    };

    const ProductsBlockComponent = await ProductsBlock({
      fields: fields,
      systemId: 'foo',
      __typename: 'ProductsBlock',
    });
    const { container } = render(ProductsBlockComponent);

    expect(dataService.queryServer).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          first: 15,
          query: {
            category: { includeChildren: false, categoryId: 'category-1' },
          },
          sorts: [],
        },
      })
    );
    expect(
      screen.queryByTestId('horizontal-product-list__container')
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.swiper-slide')).toHaveLength(2);
  });

  test('should render correct title', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      productSearch: generateProductSearchResultData(2, 2),
    });

    const fields: ProductsBlockFields = {
      sorting: null,
      numberOfProducts: null,
      category: [],
      productList: [
        {
          id: 'product-list-1',
        },
      ],
      title: 'Product block title',
    };

    const ProductsBlockComponent = await ProductsBlock({
      fields: fields,
      systemId: 'foo',
      __typename: 'ProductsBlock',
    });
    render(ProductsBlockComponent);

    expect(
      screen.queryByTestId('horizontal-product-list__title')
    ).toHaveTextContent('Product block title');
  });

  test('should not render title if not available', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      productSearch: generateProductSearchResultData(2, 2),
    });

    const fields: ProductsBlockFields = {
      sorting: null,
      numberOfProducts: null,
      category: [],
      productList: [
        {
          id: 'product-list-1',
        },
      ],
      title: null,
    };

    const ProductsBlockComponent = await ProductsBlock({
      fields: fields,
      systemId: 'foo',
      __typename: 'ProductsBlock',
    });
    render(ProductsBlockComponent);

    expect(
      screen.queryByTestId('horizontal-product-list__title')
    ).not.toBeInTheDocument();
  });
});
