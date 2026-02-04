import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateCartLineItemData } from '__mock__/generateMockData';
import CartContextProvider from 'contexts/cartContext';
import WebsiteContextProvider, { EmptyWebsite } from 'contexts/websiteContext';
import { add } from 'services/cartService.client';
import VariantsTable from './VariantsTable';

jest.mock('hooks/useTranslations', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('services/imageService', () => ({
  getAbsoluteImageUrl: (url: string) => url,
}));
jest.mock('services/cartService.client', () => ({
  add: jest.fn(),
}));

// Mock website context
const MockWebsite = {
  ...EmptyWebsite,
  imageServerUrl: 'https://localhost/',
};

// Mock cart context
const cart = generateCartLineItemData(1, 10, 0, true);

describe('VariantsTable Component', () => {
  const renderWithContext = (
    component: React.ReactElement,
    showPricesIncludingVat: boolean = true
  ) => {
    return render(
      <WebsiteContextProvider value={MockWebsite}>
        <CartContextProvider value={{ ...cart, showPricesIncludingVat }}>
          {component}
        </CartContextProvider>
      </WebsiteContextProvider>
    );
  };

  test('should renders all columns without fields as column', () => {
    const mockVariants: any = [
      {
        articleNumber: 'foo 0',
        images: [{ filename: 'bar', url: '/example.com/bar.png' }],
        price: {
          unitPriceIncludingVat: 600,
          unitPriceExcludingVat: 480,
          discountPriceIncludingVat: null,
          discountPriceExcludingVat: null,
        },
        stockStatus: {
          inStockQuantity: 50,
        },
        displayFieldGroups: [],
      },
    ];
    render(<VariantsTable variants={mockVariants} />);
    expect(
      screen.getAllByText('productdetail.column.articlenumber').length
    ).toEqual(2);
    expect(screen.getAllByText('productdetail.column.stock').length).toEqual(2);
    expect(screen.getAllByText('productdetail.column.price').length).toEqual(2);
  });
  test('should renders all columns include fields as column', () => {
    const mockVariants: any = [
      {
        articleNumber: 'foo 0',
        displayFieldGroups: [
          {
            fieldGroupId: 'variantFieldColumns',
            fields: [
              {
                id: '111',
                name: 'Color',
                textOptionFieldValues: [{ name: 'White', value: 'White' }],
              },
              {
                id: '222',
                name: 'Size',
                textOptionFieldValues: [{ name: 'One Size', value: 'OneSize' }],
              },
            ],
          },
        ],
        images: [{ filename: 'bar', url: '/example.com/bar.png' }],
        price: {
          unitPriceIncludingVat: 600,
          unitPriceExcludingVat: 480,
          discountPriceIncludingVat: null,
          discountPriceExcludingVat: null,
        },
        stockStatus: {
          inStockQuantity: 50,
        },
      },
    ];
    render(<VariantsTable variants={mockVariants} />);
    expect(
      screen.getAllByText('productdetail.column.articlenumber').length
    ).toEqual(2);
    expect(screen.getAllByText('productdetail.column.stock').length).toEqual(2);
    expect(screen.getAllByText('productdetail.column.price').length).toEqual(2);
    expect(screen.getAllByText('Color').length).toEqual(2);
    expect(screen.getAllByText('Size').length).toEqual(2);
  });
  test('should add item to cart with different quantity', async () => {
    const mockVariants: any = [
      {
        articleNumber: 'foo',
        images: [{ filename: 'foo1', url: '/example.com/foo1.png' }],
        price: {
          unitPriceIncludingVat: 600,
          unitPriceExcludingVat: 480,
          discountPriceIncludingVat: null,
          discountPriceExcludingVat: null,
        },
        stockStatus: {
          inStockQuantity: 50,
        },
        displayFieldGroups: [],
      },
      {
        articleNumber: 'bar',
        images: [{ filename: 'bar1', url: '/example.com/bar1.png' }],
        price: {
          unitPriceIncludingVat: 700,
          unitPriceExcludingVat: 560,
          discountPriceIncludingVat: null,
          discountPriceExcludingVat: null,
        },
        stockStatus: {
          inStockQuantity: 50,
        },
        displayFieldGroups: [],
      },
    ];
    const mockAddToCart = add as jest.Mock;
    render(<VariantsTable variants={mockVariants} />);
    await userEvent.selectOptions(
      screen.queryAllByTestId('quantity-input__select')[0],
      '5'
    );
    expect(screen.queryAllByTestId('quantity-input__select')[0]).toHaveValue(
      '5'
    );
    const buyButton = screen.queryAllByTestId('buy-button');
    await userEvent.click(buyButton[0]);
    expect(mockAddToCart).toHaveBeenCalledWith('foo', '5');

    await userEvent.selectOptions(
      screen.queryAllByTestId('quantity-input__select')[1],
      '6'
    );
    expect(screen.queryAllByTestId('quantity-input__select')[1]).toHaveValue(
      '6'
    );
    await userEvent.click(buyButton[1]);
    expect(mockAddToCart).toHaveBeenCalledWith('bar', '6');
  });

  test('should render unit price including VAT when showPricesIncludingVat is true', () => {
    const mockVariants: any = [
      {
        articleNumber: 'foo',
        images: [{ filename: 'foo1', url: '/example.com/foo1.png' }],
        price: {
          unitPriceIncludingVat: 600,
          unitPriceExcludingVat: 480,
          discountPriceIncludingVat: null,
          discountPriceExcludingVat: null,
        },
        stockStatus: {
          inStockQuantity: 50,
        },
        displayFieldGroups: [],
      },
    ];

    renderWithContext(<VariantsTable variants={mockVariants} />, true);

    expect(
      screen.getByTestId('variants-table__desktop-price-foo')
    ).toHaveTextContent('600');
    expect(
      screen.getByTestId('variants-table__mobile-price-foo')
    ).toHaveTextContent('600');
  });

  test('should render unit price excluding VAT when showPricesIncludingVat is false', () => {
    const mockVariants: any = [
      {
        articleNumber: 'foo',
        images: [{ filename: 'foo1', url: '/example.com/foo1.png' }],
        price: {
          unitPriceIncludingVat: 600,
          unitPriceExcludingVat: 480,
          discountPriceIncludingVat: null,
          discountPriceExcludingVat: null,
        },
        stockStatus: {
          inStockQuantity: 50,
        },
        displayFieldGroups: [],
      },
    ];

    renderWithContext(<VariantsTable variants={mockVariants} />, false);

    expect(
      screen.getByTestId('variants-table__desktop-price-foo')
    ).toHaveTextContent('480');
    expect(
      screen.getByTestId('variants-table__mobile-price-foo')
    ).toHaveTextContent('480');
  });
});
