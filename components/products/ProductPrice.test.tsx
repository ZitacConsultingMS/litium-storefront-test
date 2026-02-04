import { render, screen } from '@testing-library/react';
import { generateCartLineItemData } from '__mock__/generateMockData';
import CartContextProvider from 'contexts/cartContext';
import { ProductPriceItem } from 'models/price';
import ProductPrice from './ProductPrice';

const mockCart = generateCartLineItemData(1, 1, 0);

describe('ProductPrice', () => {
  const renderWithContext = (
    component: React.ReactElement,
    showPricesIncludingVat: boolean = true
  ) => {
    return render(
      <CartContextProvider value={{ ...mockCart, showPricesIncludingVat }}>
        {component}
      </CartContextProvider>
    );
  };

  describe('showPricesIncludingVat is true', () => {
    test('should render unit price including VAT without discount', () => {
      const price: ProductPriceItem = {
        currency: 'USD',
        unitPriceIncludingVat: 100,
        unitPriceExcludingVat: 80,
        discountPriceIncludingVat: null,
        discountPriceExcludingVat: null,
      };

      renderWithContext(<ProductPrice price={price} />);

      expect(screen.getByTestId('product-price__unit-price')).toHaveTextContent(
        '100'
      );
    });

    it('should render both discount price and unit price including VAT when discount exists', () => {
      const price: ProductPriceItem = {
        currency: 'USD',
        unitPriceIncludingVat: 100,
        unitPriceExcludingVat: 80,
        discountPriceIncludingVat: 90,
        discountPriceExcludingVat: 72,
      };
      renderWithContext(<ProductPrice price={price} />);

      expect(screen.getByTestId('product-price__unit-price')).toHaveTextContent(
        '100'
      );

      expect(
        screen.getByTestId('product-price__discount-price')
      ).toHaveTextContent('90');
    });
  });

  describe('showPricesIncludingVat is false', () => {
    it('should render unit price excluding VAT without discount', () => {
      const priceWithoutDiscount: ProductPriceItem = {
        currency: 'USD',
        unitPriceIncludingVat: 100,
        unitPriceExcludingVat: 80,
        discountPriceIncludingVat: null,
        discountPriceExcludingVat: null,
      };

      renderWithContext(<ProductPrice price={priceWithoutDiscount} />, false);

      expect(screen.getByTestId('product-price__unit-price')).toHaveTextContent(
        '80'
      );
    });

    it('renders both discount price and unit price excluding VAT when discount exists', () => {
      const price: ProductPriceItem = {
        currency: 'USD',
        unitPriceIncludingVat: 100,
        unitPriceExcludingVat: 80,
        discountPriceIncludingVat: 90,
        discountPriceExcludingVat: 72,
      };
      renderWithContext(<ProductPrice price={price} />, false);

      expect(
        screen.getByTestId('product-price__discount-price')
      ).toHaveTextContent('72');

      expect(screen.getByTestId('product-price__unit-price')).toHaveTextContent(
        '80'
      );
    });
  });
});
