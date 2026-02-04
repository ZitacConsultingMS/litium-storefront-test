import { render, screen } from '@testing-library/react';
import { generateCartLineItemData } from '__mock__/generateMockData';
import CartContextProvider from 'contexts/cartContext';
import WebsiteContextProvider, { EmptyWebsite } from 'contexts/websiteContext';
import { OrderRow } from 'models/order';
import { DiscountType } from 'utils/constants';
import CartLineItem from './CartLineItem';

const MockWebsite = {
  ...EmptyWebsite,
  imageServerUrl: 'https://localhost/',
};

describe('Cart Line Item Component', () => {
  test('should render information of Cart Line Item correctly with asterisk flag by default value is false', () => {
    const cart = generateCartLineItemData(1, 1, 0);
    const item: OrderRow = cart.rows[0];
    render(
      <WebsiteContextProvider value={MockWebsite}>
        <CartContextProvider value={cart}>
          <CartLineItem item={item} />
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(screen.getByTestId('abc-xyz-0__name')).toHaveTextContent(
      'Product name 0'
    );
    expect(screen.getByTestId('abc-xyz-0__article-number')).toHaveTextContent(
      'abc-xyz-0'
    );
    expect(screen.getByTestId('abc-xyz-0__discount-price')).toHaveTextContent(
      '698 SEK'
    );
    expect(screen.queryByTestId('abc-xyz-0__original-price')).toBeNull();
    expect(screen.queryByTestId('abc-xyz-0__asterisk')).toBeNull();
    expect(screen.getByTestId('quantity-input__select')).toHaveValue('1');
  });

  test('should render asterisk if asterisk flag is true ', () => {
    const cart = generateCartLineItemData(1, 1, 0);
    const item: OrderRow = cart.rows[0];

    render(
      <CartContextProvider value={cart}>
        <WebsiteContextProvider value={MockWebsite}>
          <CartLineItem item={item} asterisk={true} />
        </WebsiteContextProvider>
      </CartContextProvider>
    );
    expect(screen.queryByTestId('abc-xyz-0__asterisk')).toBeInTheDocument();
  });

  test('should render the currency format correctly with the price is greater than 1000', () => {
    const cart = generateCartLineItemData(1, 10, 0);
    const item: OrderRow = cart.rows[0];

    render(
      <WebsiteContextProvider value={MockWebsite}>
        <CartContextProvider value={cart}>
          <CartLineItem item={item} asterisk={true} />
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(screen.getByTestId('abc-xyz-0__discount-price')).toHaveTextContent(
      '6 980 SEK'
    );
  });

  test('should not render original price if discount type is "BuyXGetCheapestDiscount" or "MatchAndMix"', () => {
    const cart = generateCartLineItemData(
      1,
      1,
      1,
      false,
      DiscountType.BuyXGetCheapestDiscount
    );
    const item: OrderRow = cart.rows[0];
    render(
      <WebsiteContextProvider value={MockWebsite}>
        <CartContextProvider value={cart}>
          <CartLineItem item={item} />
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(screen.getByTestId('abc-xyz-0__name')).toHaveTextContent(
      'Product name 0'
    );
    expect(screen.getByTestId('abc-xyz-0__article-number')).toHaveTextContent(
      'abc-xyz-0'
    );
    expect(screen.getByTestId('abc-xyz-0__discount-price')).toHaveTextContent(
      '698 SEK'
    );
    expect(screen.queryByTestId('abc-xyz-0__original-price')).toBeNull();
    expect(screen.queryByTestId('abc-xyz-0__asterisk')).toBeNull();
    expect(screen.getByTestId('quantity-input__select')).toHaveValue('1');
  });

  test('should render original price if discount type is "ProductDiscount" or "DiscountedProductPrice"', () => {
    const cart = generateCartLineItemData(
      1,
      1,
      1,
      false,
      DiscountType.DiscountedProductPrice
    );
    const item: OrderRow = cart.rows[0];

    render(
      <WebsiteContextProvider value={MockWebsite}>
        <CartContextProvider value={cart}>
          <CartLineItem item={item} />
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(screen.getByTestId('abc-xyz-0__name')).toHaveTextContent(
      'Product name 0'
    );
    expect(screen.getByTestId('abc-xyz-0__article-number')).toHaveTextContent(
      'abc-xyz-0'
    );
    expect(screen.getByTestId('abc-xyz-0__discount-price')).toHaveTextContent(
      '300 SEK'
    );
    expect(screen.getByTestId('abc-xyz-0__original-price')).toHaveTextContent(
      '698 SEK'
    );
    expect(screen.queryByTestId('abc-xyz-0__asterisk')).toBeNull();
    expect(screen.getByTestId('quantity-input__select')).toHaveValue('1');
  });

  describe('Price Display with VAT', () => {
    test('should render price including VAT by default', () => {
      const cart = generateCartLineItemData(1, 1, 0);
      const item: OrderRow = cart.rows[0];

      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CartLineItem item={item} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );

      expect(screen.getByTestId('abc-xyz-0__discount-price')).toHaveTextContent(
        '698 SEK'
      );
    });

    test('should render price excluding VAT when includingVat is false', () => {
      const cart = generateCartLineItemData(1, 1, 0);
      const item: OrderRow = cart.rows[0];

      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CartLineItem item={item} includingVat={false} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );

      expect(screen.getByTestId('abc-xyz-0__discount-price')).toHaveTextContent(
        '560 SEK'
      );
    });

    test('should render correct prices for discounted items when includingVat is true', () => {
      const cart = generateCartLineItemData(
        1,
        1,
        1,
        false,
        DiscountType.DiscountedProductPrice
      );
      const item: OrderRow = cart.rows[0];

      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CartLineItem item={item} includingVat={true} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );

      // 689 - 389
      expect(screen.getByTestId('abc-xyz-0__discount-price')).toHaveTextContent(
        '300 SEK'
      );
    });

    test('should render correct prices for discounted items when includingVat is false', () => {
      const cart = generateCartLineItemData(
        1,
        1,
        1,
        false,
        DiscountType.DiscountedProductPrice
      );
      const item: OrderRow = cart.rows[0];

      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CartLineItem item={item} includingVat={false} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );

      // 560 - 320
      expect(screen.getByTestId('abc-xyz-0__discount-price')).toHaveTextContent(
        '240 SEK'
      );
    });
  });
});
