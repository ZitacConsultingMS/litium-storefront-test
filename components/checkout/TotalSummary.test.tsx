import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartContextProvider, { EmptyCart } from 'contexts/cartContext';
import WebsiteContextProvider, { EmptyWebsite } from 'contexts/websiteContext';
import { Cart } from 'models/cart';
import TotalSummary from './TotalSummary';

describe('Total Summary Component', () => {
  test('should render correct grand total value', () => {
    const cart: Cart = {
      discountInfos: [],
      rows: [],
      grandTotal: 100,
      productCount: 1,
      discountCodes: [],
      currency: {
        code: 'SEK',
      },
    };
    render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={cart}>
          <TotalSummary errors={{}} onClick={() => {}} />
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(screen.getByTestId('total-summary__grand-total')).toHaveTextContent(
      '100'
    );
  });

  test('should call onClick function when placing order', async () => {
    render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={EmptyCart}>
          <TotalSummary
            errors={{}}
            onClick={() => {
              console.log('foo');
            }}
          />
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    console.log = jest.fn();

    await userEvent.click(screen.getByTestId('total-summary__place-order'));
    expect(console.log).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('foo');
  });
});
