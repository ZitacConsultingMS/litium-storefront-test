import { render, screen } from '@testing-library/react';
import {
  generateCartLineItemData,
  generateProductItems,
} from '__mock__/generateMockData';
import CartContextProvider from 'contexts/cartContext';
import { EmptyWebsite } from 'contexts/websiteContext';
import { ProductItem } from 'models/products';
import React from 'react';
import ProductDetail from './ProductDetail';

const MockWebsite = {
  ...EmptyWebsite,
  imageServerUrl: 'https://localhost/',
};

jest.mock('services/websiteService.server', () => ({
  get: () => MockWebsite,
}));

jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => null;
  DynamicComponent.displayName = 'LoadableComponent';
  DynamicComponent.preload = jest.fn();
  return DynamicComponent;
});

jest.mock('react', () => ({
  ...jest.requireActual<typeof React>('react'),
  preload: jest.fn(),
}));

describe('Product Detail Component', () => {
  describe('data', () => {
    test('should render correct product item data', async () => {
      const productItem: ProductItem = generateProductItems(1, 3)[0];
      const cmp = await ProductDetail(productItem);
      const cart = generateCartLineItemData(1, 1, 0);
      render(<CartContextProvider value={cart}>{cmp}</CartContextProvider>);

      expect(screen.getByTestId('product-detail__category')).toHaveTextContent(
        'Tops'
      );
      expect(screen.getByTestId('product-detail__category')).toHaveAttribute(
        'href',
        '/woman/tops'
      );
      expect(screen.getByTestId('product-detail__name')).toHaveTextContent(
        'Product name 0'
      );
      // expect(screen.getByTestId('product-detail__price')).toHaveTextContent(
      //   '1 000 SEK'
      // );
      expect(screen.getByTestId('product-detail__status')).toHaveTextContent(
        'stockstatus.instock'
      );
      expect(
        screen.queryAllByTestId('thumbs-gallery__thumbnail-image')
      ).toHaveLength(3);
      expect(
        screen.queryAllByTestId('thumbs-gallery__main-image')
      ).toHaveLength(3);
    });

    test('should render correct status if product is out of stock', async () => {
      const productItem: ProductItem = generateProductItems(1, 0)[0];
      productItem.stockStatus = {
        inStockQuantity: 0,
      };
      const cmp = await ProductDetail(productItem);
      render(cmp);

      expect(screen.getByTestId('product-detail__status')).toHaveTextContent(
        'stockstatus.outofstock'
      );
    });
  });

  describe('image gallery', () => {
    test('should not render product name and alt image if name is not available', async () => {
      const productItem: ProductItem = generateProductItems(1, 3)[0];
      productItem.name = null;
      const cmp = await ProductDetail(productItem);
      render(cmp);

      expect(screen.getByTestId('product-detail__name')).toHaveTextContent('');
      expect(
        screen.queryAllByTestId('thumbs-gallery__thumbnail-image')[0]
      ).toHaveAttribute('alt', '');
      expect(
        screen.queryAllByTestId('thumbs-gallery__main-image')[0]
      ).toHaveAttribute('alt', '');
    });

    test('should not render product image and thumbnail if not exist', async () => {
      const productItem: ProductItem = generateProductItems(1, 0)[0];
      const cmp = await ProductDetail(productItem);
      render(cmp);

      expect(
        screen.queryByTestId('thumbs-gallery__thumbnail-image')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('thumbs-gallery__main-image')
      ).not.toBeInTheDocument();
    });
  });

  describe('size and color', () => {
    describe('current variant has both size and color', () => {
      test('should render correct number of corlor and size buttons', async () => {
        const productItem: ProductItem = generateProductItems(1, 0)[0];
        const cmp = await ProductDetail(productItem);
        render(cmp);

        expect(screen.queryAllByTestId('product-detail__color')).toHaveLength(
          2
        );
        expect(screen.queryAllByTestId('product-detail__size')).toHaveLength(3);
      });

      test('should render correct variant url in color/size button', async () => {
        const productItem: ProductItem = generateProductItems(1, 0)[0];
        const cmp = await ProductDetail(productItem);
        render(cmp);

        expect(
          screen.queryAllByTestId('product-detail__color')[0]
        ).toHaveAttribute('href', '/woman/tops/court-dress-black_s');
        expect(
          screen.queryAllByTestId('product-detail__color')[1]
        ).toHaveAttribute('href', '/woman/tops/court-dress-northern-green_s');

        expect(
          screen.queryAllByTestId('product-detail__size')[0]
        ).toHaveAttribute('href', '/woman/tops/court-dress-black_l');
        expect(
          screen.queryAllByTestId('product-detail__size')[1]
        ).toHaveAttribute('href', '/woman/tops/court-dress-black_m');
        expect(
          screen.queryAllByTestId('product-detail__size')[2]
        ).toHaveAttribute('href', '/woman/tops/court-dress-black_s');
      });

      test('should render correct color/size button with active style', async () => {
        const productItem: ProductItem = generateProductItems(1, 0)[0];
        const cmp = await ProductDetail(productItem);
        render(cmp);

        expect(screen.queryAllByTestId('product-detail__color')[0]).toHaveClass(
          'border-secondary'
        );
        expect(screen.queryAllByTestId('product-detail__size')[2]).toHaveClass(
          'border-secondary'
        );
      });
    });

    describe('current variant does not have color', () => {
      test('should render correct number of corlor and size buttons', async () => {
        const productItem: ProductItem = generateProductItems(1, 0)[0];
        productItem.fields = {
          brand: [{ name: 'Brand name 0' }],
          color: null,
          size: [{ name: 'S' }],
        };
        productItem.rawData.variants = [
          {
            fields: {
              color: null,
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-black_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Green' }],
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-northern-green_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Black' }],
              size: [{ name: 'L' }],
            },
            url: '/woman/tops/court-dress-black_l',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
        ] as any;
        const cmp = await ProductDetail(productItem);
        render(cmp);

        expect(screen.queryAllByTestId('product-detail__color')).toHaveLength(
          2
        );
        expect(screen.queryAllByTestId('product-detail__size')).toHaveLength(2);
      });

      test('should render correct variant url in color/size button', async () => {
        const productItem: ProductItem = generateProductItems(1, 0)[0];
        productItem.fields = {
          brand: [{ name: 'Brand name 0' }],
          color: null,
          size: [{ name: 'S' }],
        };
        productItem.rawData.variants = [
          {
            fields: {
              color: null,
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-black_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Green' }],
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-northern-green_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Black' }],
              size: [{ name: 'L' }],
            },
            url: '/woman/tops/court-dress-black_l',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
        ] as any;
        const cmp = await ProductDetail(productItem);
        render(cmp);

        expect(
          screen.queryAllByTestId('product-detail__color')[0]
        ).toHaveAttribute('href', '/woman/tops/court-dress-black_l');
        expect(
          screen.queryAllByTestId('product-detail__color')[1]
        ).toHaveAttribute('href', '/woman/tops/court-dress-northern-green_s');

        expect(
          screen.queryAllByTestId('product-detail__size')[0]
        ).toHaveAttribute('href', '/woman/tops/court-dress-black_l');
        expect(
          screen.queryAllByTestId('product-detail__size')[1]
        ).toHaveAttribute('href', '/woman/tops/court-dress-black_s');
      });

      test('should render correct color/size button with active/disabled style', async () => {
        const productItem: ProductItem = generateProductItems(1, 0)[0];
        productItem.fields = {
          brand: [{ name: 'Brand name 0' }],
          color: null,
          size: [{ name: 'S' }],
        };
        productItem.rawData.variants = [
          {
            fields: {
              color: null,
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-black_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Green' }],
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-northern-green_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Black' }],
              size: [{ name: 'L' }],
            },
            url: '/woman/tops/court-dress-black_l',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
        ] as any;
        const cmp = await ProductDetail(productItem);
        render(cmp);

        expect(screen.queryAllByTestId('product-detail__color')[0]).toHaveClass(
          'border-disabled-border'
        );
        expect(screen.queryAllByTestId('product-detail__size')[1]).toHaveClass(
          'border-secondary'
        );
      });
    });

    describe('current variant does not have size', () => {
      test('should render correct number of corlor and size buttons', async () => {
        const productItem: ProductItem = generateProductItems(1, 0)[0];
        productItem.fields = {
          brand: [{ name: 'Brand name 0' }],
          color: [{ name: 'Black' }],
          size: null,
        };
        productItem.rawData.variants = [
          {
            fields: {
              color: [{ name: 'Black' }],
              size: null,
            },
            url: '/woman/tops/court-dress-black_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Green' }],
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-northern-green_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Black' }],
              size: [{ name: 'L' }],
            },
            url: '/woman/tops/court-dress-black_l',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
        ] as any;
        const cmp = await ProductDetail(productItem);
        render(cmp);

        expect(screen.queryAllByTestId('product-detail__color')).toHaveLength(
          2
        );
        expect(screen.queryAllByTestId('product-detail__size')).toHaveLength(2);
      });

      test('should render correct variant url in color/size button', async () => {
        const productItem: ProductItem = generateProductItems(1, 0)[0];
        productItem.fields = {
          brand: [{ name: 'Brand name 0' }],
          color: [{ name: 'Black' }],
          size: null,
        };
        productItem.rawData.variants = [
          {
            fields: {
              color: [{ name: 'Black' }],
              size: null,
            },
            url: '/woman/tops/court-dress-black_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Green' }],
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-northern-green_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Black' }],
              size: [{ name: 'L' }],
            },
            url: '/woman/tops/court-dress-black_l',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
        ] as any;
        const cmp = await ProductDetail(productItem);
        render(cmp);

        expect(
          screen.queryAllByTestId('product-detail__color')[0]
        ).toHaveAttribute('href', '/woman/tops/court-dress-black_s');
        expect(
          screen.queryAllByTestId('product-detail__color')[1]
        ).toHaveAttribute('href', '/woman/tops/court-dress-northern-green_s');

        expect(
          screen.queryAllByTestId('product-detail__size')[0]
        ).toHaveAttribute('href', '/woman/tops/court-dress-black_l');
        expect(
          screen.queryAllByTestId('product-detail__size')[1]
        ).toHaveAttribute('href', '/woman/tops/court-dress-northern-green_s');
      });

      test('should render correct color/size button with active/disabled style', async () => {
        const productItem: ProductItem = generateProductItems(1, 0)[0];
        productItem.fields = {
          brand: [{ name: 'Brand name 0' }],
          color: [{ name: 'Black' }],
          size: null,
        };
        productItem.rawData.variants = [
          {
            fields: {
              color: [{ name: 'Black' }],
              size: null,
            },
            url: '/woman/tops/court-dress-black_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Green' }],
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-northern-green_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Black' }],
              size: [{ name: 'L' }],
            },
            url: '/woman/tops/court-dress-black_l',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
        ] as any;
        const cmp = await ProductDetail(productItem);
        render(cmp);

        expect(screen.queryAllByTestId('product-detail__color')[0]).toHaveClass(
          'border-secondary'
        );
        expect(screen.queryAllByTestId('product-detail__size')[1]).toHaveClass(
          'border-disabled-border'
        );
      });
    });

    describe('current variant does not have both size and color', () => {
      test('should render correct number of corlor and size buttons', async () => {
        const productItem: ProductItem = generateProductItems(1, 0)[0];
        productItem.fields = {
          brand: [{ name: 'Brand name 0' }],
          color: null,
          size: null,
        };
        productItem.rawData.variants = [
          {
            fields: {
              color: null,
              size: null,
            },
            url: '/woman/tops/court-dress-black_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Green' }],
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-northern-green_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Black' }],
              size: [{ name: 'L' }],
            },
            url: '/woman/tops/court-dress-black_l',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
        ] as any;
        const cmp = await ProductDetail(productItem);
        render(cmp);

        expect(screen.queryAllByTestId('product-detail__color')).toHaveLength(
          2
        );
        expect(screen.queryAllByTestId('product-detail__size')).toHaveLength(2);
      });

      test('should render correct variant url in color/size button', async () => {
        const productItem: ProductItem = generateProductItems(1, 0)[0];
        productItem.fields = {
          brand: [{ name: 'Brand name 0' }],
          color: null,
          size: null,
        };
        productItem.rawData.variants = [
          {
            fields: {
              color: null,
              size: null,
            },
            url: '/woman/tops/court-dress-black_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Green' }],
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-northern-green_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Black' }],
              size: [{ name: 'L' }],
            },
            url: '/woman/tops/court-dress-black_l',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
        ] as any;
        const cmp = await ProductDetail(productItem);
        render(cmp);

        expect(
          screen.queryAllByTestId('product-detail__color')[0]
        ).toHaveAttribute('href', '/woman/tops/court-dress-black_l');
        expect(
          screen.queryAllByTestId('product-detail__color')[1]
        ).toHaveAttribute('href', '/woman/tops/court-dress-northern-green_s');

        expect(
          screen.queryAllByTestId('product-detail__size')[0]
        ).toHaveAttribute('href', '/woman/tops/court-dress-black_l');
        expect(
          screen.queryAllByTestId('product-detail__size')[1]
        ).toHaveAttribute('href', '/woman/tops/court-dress-northern-green_s');
      });

      test('should render correct color/size button with disabled style', async () => {
        const productItem: ProductItem = generateProductItems(1, 0)[0];
        productItem.fields = {
          brand: [{ name: 'Brand name 0' }],
          color: null,
          size: null,
        };
        productItem.rawData.variants = [
          {
            fields: {
              color: null,
              size: null,
            },
            url: '/woman/tops/court-dress-black_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Green' }],
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-northern-green_s',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
          {
            fields: {
              color: [{ name: 'Black' }],
              size: [{ name: 'L' }],
            },
            url: '/woman/tops/court-dress-black_l',
            stockStatus: {
              inStockQuantity: 1,
            },
          },
        ] as any;
        const cmp = await ProductDetail(productItem);
        render(cmp);

        expect(screen.queryAllByTestId('product-detail__color')[0]).toHaveClass(
          'border-disabled-border'
        );
        expect(screen.queryAllByTestId('product-detail__size')[0]).toHaveClass(
          'border-disabled-border'
        );
      });
    });
  });

  describe('fields and fields group', () => {
    test('should render correct field groups value', async () => {
      const productItem: ProductItem = generateProductItems(1, 0)[0];
      productItem.fieldGroups = [
        {
          fieldGroupId: 'Product information',
          name: null,
          fields: [] as any,
        },
        {
          fieldGroupId: 'Product specification',
          name: null,
          fields: [] as any,
        },
      ];
      const cmp = await ProductDetail(productItem);
      render(cmp);

      expect(screen.queryAllByTestId('accordion__header')).toHaveLength(2);
      expect(
        screen.queryAllByTestId('accordion__header')[0].textContent
      ).toEqual('Product information');
      expect(
        screen.queryAllByTestId('accordion__header')[1].textContent
      ).toEqual('Product specification');
    });

    test('should render correct fields value', async () => {
      const productItem: ProductItem = generateProductItems(1, 0)[0];
      productItem.fieldGroups = [
        {
          fieldGroupId: 'Product information',
          name: null,
          fields: [
            {
              field: 'Color',
              name: 'Color',
              textOptionFieldValues: [{ name: 'Green' }],
            },
            {
              field: 'Weight',
              name: 'Weight',
              decimalValue: 20,
            },
            {
              field: 'News',
              name: 'News',
              dateTimeValue: '2023-10-17T00:00:00.000Z',
            },
            {
              field: 'File',
              name: 'File',
              pointerMediaFileValue: {
                item: {
                  url: '/storage/file.jpg',
                  alt: null,
                  filename: 'file.jpg',
                },
              },
            },
            {
              field: 'Link',
              name: 'Link',
              linkFieldValue: {
                url: '/woman',
                text: 'woman',
              },
            },
            {
              field: 'Image',
              name: 'Image',
              pointerMediaImageValue: {
                item: {
                  url: '/storage/image.jpg',
                  dimension: {
                    height: 720,
                    width: 720,
                  },
                  filename: 'image.jpg',
                },
              },
            },
            {
              field: 'Boolean',
              name: 'Boolean',
              booleanValue: true,
            },
            {
              field: 'Long',
              name: 'Long',
              longValue: 1234,
            },
            {
              field: 'Int',
              name: 'Int',
              intValue: 12345,
            },
            {
              field: 'IntOptionFieldValues',
              name: 'IntOptionFieldValues',
              intOptionFieldValues: [{ name: 1 }, { name: 2 }],
            },
          ] as any,
        },
        {
          fieldGroupId: 'Product specification',
          name: null,
          fields: [
            {
              field: 'Specification',
              name: 'Product specifications',
              stringValue: '87% Recycled Polyamide, 13% Elastane',
            },
          ] as any,
        },
      ];
      const cmp = await ProductDetail(productItem);
      render(cmp);

      expect(
        screen.queryAllByTestId('product-detail__field-name')
      ).toHaveLength(11);
      expect(
        screen.queryAllByTestId('product-detail__field-value')
      ).toHaveLength(11);

      expect(
        screen.queryAllByTestId('product-detail__field-name')[0].textContent
      ).toEqual('Color');
      expect(
        screen.queryAllByTestId('product-detail__field-value')[0].textContent
      ).toEqual('Green');

      expect(
        screen.queryAllByTestId('product-detail__field-name')[1].textContent
      ).toEqual('Weight');
      expect(
        screen.queryAllByTestId('product-detail__field-value')[1].textContent
      ).toEqual('20');

      expect(
        screen.queryAllByTestId('product-detail__field-name')[2].textContent
      ).toEqual('News');
      expect(
        screen.queryAllByTestId('product-detail__field-value')[2].textContent
      ).toEqual('2023-10-17');

      expect(
        screen.queryAllByTestId('product-detail__field-name')[3].textContent
      ).toEqual('File');
      expect(
        screen.queryAllByTestId('product-detail__field-value')[3].textContent
      ).toEqual('file.jpg');
      expect(
        screen.queryByTestId('product-detail__field-file')
      ).toHaveAttribute('href', '/storage/file.jpg');

      expect(
        screen.queryAllByTestId('product-detail__field-name')[4].textContent
      ).toEqual('Link');
      expect(
        screen.queryAllByTestId('product-detail__field-value')[4].textContent
      ).toEqual('woman');
      expect(
        screen.queryByTestId('product-detail__field-link')
      ).toHaveAttribute('href', '/woman');

      expect(
        screen.queryAllByTestId('product-detail__field-name')[5].textContent
      ).toEqual('Image');
      expect(
        screen.queryByTestId('product-detail__field-image')
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('product-detail__field-image')
      ).toHaveAttribute('alt', 'image.jpg');

      expect(
        screen.queryAllByTestId('product-detail__field-name')[6].textContent
      ).toEqual('Boolean');
      expect(
        screen.queryAllByTestId('product-detail__field-value')[6].textContent
      ).toEqual('productdetail.field.boolean.true');

      expect(
        screen.queryAllByTestId('product-detail__field-name')[7].textContent
      ).toEqual('Long');
      expect(
        screen.queryAllByTestId('product-detail__field-value')[7].textContent
      ).toEqual('1234');

      expect(
        screen.queryAllByTestId('product-detail__field-name')[8].textContent
      ).toEqual('Int');
      expect(
        screen.queryAllByTestId('product-detail__field-value')[8].textContent
      ).toEqual('12345');

      expect(
        screen.queryAllByTestId('product-detail__field-name')[9].textContent
      ).toEqual('IntOptionFieldValues');
      expect(
        screen.queryAllByTestId('product-detail__field-value')[9].textContent
      ).toEqual('1; 2');

      expect(
        screen.queryAllByTestId('product-detail__field-name')[10].textContent
      ).toEqual('Product specifications');
      expect(
        screen.queryAllByTestId('product-detail__field-value')[10].textContent
      ).toEqual('87% Recycled Polyamide, 13% Elastane');
    });

    test('should not render field if id is not available', async () => {
      const productItem: ProductItem = generateProductItems(1, 0)[0];
      productItem.fieldGroups = [
        {
          fieldGroupId: 'Product information',
          name: null,
          fields: [
            {
              field: 'Color',
              name: 'Color',
              textOptionFieldValues: [{ name: 'Green' }],
            },
            {
              field: 'Weight',
              name: null,
              decimalValue: 20,
            },
            {},
          ] as any,
        },
      ];
      const cmp = await ProductDetail(productItem);
      render(cmp);

      expect(
        screen.queryAllByTestId('product-detail__field-name')
      ).toHaveLength(2);
      expect(
        screen.queryAllByTestId('product-detail__field-value')
      ).toHaveLength(2);
    });
  });

  describe('Similar products and Accessories', () => {
    test('shoud not render Similar products and Accessories if not available', async () => {
      const productItem: ProductItem = generateProductItems(1, 0)[0];
      const cmp = await ProductDetail(productItem);
      render(cmp);

      expect(
        screen.queryByTestId('horizontal-product-list__container')
      ).not.toBeInTheDocument();
    });

    test('shoud render correct Similar products and Accessories value', async () => {
      const productItem: ProductItem = generateProductItems(1, 0)[0];
      productItem.relationships.similarProducts.items.nodes =
        generateProductItems(1, 0);
      productItem.relationships.accessory.items.nodes = generateProductItems(
        1,
        0
      );
      const cmp = await ProductDetail(productItem);
      render(cmp);

      expect(
        screen.queryAllByTestId('horizontal-product-list__container')
      ).toHaveLength(2);
      expect(
        screen.queryAllByTestId('horizontal-product-list__title')[0]
      ).toHaveTextContent('Similar products');
      expect(
        screen.queryAllByTestId('horizontal-product-list__title')[1]
      ).toHaveTextContent('Accessories');
      expect(
        screen
          .queryAllByTestId('horizontal-product-list__container')[0]
          .querySelectorAll('.swiper-slide')
      ).toHaveLength(1);
    });
  });
});
