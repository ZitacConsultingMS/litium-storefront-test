import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartContextProvider from 'contexts/cartContext';
import { Cart } from 'models/cart';
import CheckoutCart from './CheckoutCart';

describe('Checkout Cart', () => {
  test('should be able to expand/collapse cart content in mobile', async () => {
    const cart: Cart = {
      discountInfos: [],
      rows: [],
      grandTotal: 100,
      productCount: 1,
      discountCodes: [],
      productTotalIncludingVat: 100,
      currency: {
        code: 'SEK',
        symbol: 'SEK',
        symbolPosition: 'RIGHT_WITH_SPACE',
        minorUnits: 0,
      },
    };
    render(
      <CartContextProvider value={cart}>
        <CheckoutCart />
      </CartContextProvider>
    );
    expect(screen.queryByTestId('cart__content')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('cart__toggle'));
    expect(screen.queryByTestId('cart__content')).not.toBeInTheDocument();
  });
  test('should show correct grand total value', () => {
    const cart: Cart = {
      discountInfos: [],
      rows: [],
      grandTotal: 100,
      productCount: 1,
      discountCodes: [],
      productTotalIncludingVat: 100,
      currency: {
        code: 'SEK',
        symbol: 'SEK',
        symbolPosition: 'RIGHT_WITH_SPACE',
        minorUnits: 0,
      },
    };
    render(
      <CartContextProvider value={cart}>
        <CheckoutCart />
      </CartContextProvider>
    );
    expect(screen.getByTestId('cart__grand-total')).toHaveTextContent(
      '100 SEK'
    );
  });
});
