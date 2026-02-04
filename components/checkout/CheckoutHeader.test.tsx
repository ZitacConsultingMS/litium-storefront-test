import { render, screen } from '@testing-library/react';
import { generateCartLineItemData } from '__mock__/generateMockData';
import CartContextProvider from 'contexts/cartContext';
import { Cart } from 'models/cart';
import CheckoutHeader from './CheckoutHeader';

describe('Header Checkout Component', () => {
  test('should render correctly information of cart with one product at checkout', () => {
    const cart: Cart = generateCartLineItemData(1, 10, 2, true);
    render(
      <CartContextProvider value={cart}>
        <CheckoutHeader />
      </CartContextProvider>
    );
    expect(screen.queryByTestId('header__info')).toHaveTextContent(
      '1 checkoutheader.product 1 000 SEK'
    );
  });

  test('should render correctly information of cart with multiple products at checkout', () => {
    const cart: Cart = generateCartLineItemData(2, 10, 2, true);
    render(
      <CartContextProvider value={cart}>
        <CheckoutHeader />
      </CartContextProvider>
    );
    expect(screen.queryByTestId('header__info')).toHaveTextContent(
      '2 checkoutheader.products 2 000 SEK'
    );
  });
});
