import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartContextProvider, { EmptyCart } from 'contexts/cartContext';
import { Cart } from 'models/cart';
import * as cartService from 'services/cartService.client';
import CheckoutDiscountCodes from './CheckoutDiscountCodes';

jest.mock('services/cartService.client', () => ({
  addDiscountCodes: jest.fn(),
  removeDiscountCodes: jest.fn(),
}));

describe('Checkout Discount Codes', () => {
  test('should be able to show discount code input', async () => {
    render(<CheckoutDiscountCodes></CheckoutDiscountCodes>);
    await userEvent.click(
      screen.getByTestId('checkout__discount-code--show-input')
    );
    expect(screen.queryByTestId('checkout__discount-code')).toBeInTheDocument();
  });
  test('should not show discount code tag if not available', () => {
    render(<CheckoutDiscountCodes></CheckoutDiscountCodes>);
    expect(screen.queryByTestId('tag')).not.toBeInTheDocument();
  });
  test('should show correct discount code tags if available', () => {
    const cart: Cart = {
      discountInfos: [],
      rows: [],
      grandTotal: 100,
      productCount: 1,
      discountCodes: ['Code1', 'Code2'],
      currency: {
        code: '',
      },
    };
    render(
      <CartContextProvider value={cart}>
        <CheckoutDiscountCodes />
      </CartContextProvider>
    );
    expect(screen.queryAllByTestId('tag').length).toBe(2);
    expect(screen.queryAllByTestId('tag')[0].textContent).toBe('Code1');
    expect(screen.queryAllByTestId('tag')[1].textContent).toBe('Code2');
  });
  test('should be able to remove discound code', async () => {
    let cart: Cart = {
      discountInfos: [],
      rows: [],
      grandTotal: 100,
      productCount: 1,
      discountCodes: ['Code1'],
      currency: {
        code: '',
      },
    };
    jest.spyOn(cartService, 'removeDiscountCodes').mockResolvedValue({
      discountInfos: [],
      rows: [],
      grandTotal: 100,
      productCount: 1,
      discountCodes: [],
      currency: {
        code: '',
      },
    });

    render(
      <CartContextProvider value={cart}>
        <CheckoutDiscountCodes />
      </CartContextProvider>
    );

    await userEvent.click(screen.getByTestId('tag__remove'));
    expect(screen.queryByTestId('tag')).not.toBeInTheDocument();
  });
  test('should be able to add discount code', async () => {
    let cart: Cart = {
      discountInfos: [],
      rows: [],
      grandTotal: 100,
      productCount: 1,
      discountCodes: [],
      currency: {
        code: '',
      },
    };
    jest.spyOn(cartService, 'addDiscountCodes').mockResolvedValue({
      discountInfos: [],
      rows: [],
      grandTotal: 100,
      productCount: 1,
      discountCodes: ['Code1'],
      currency: {
        code: '',
      },
    });

    const { container } = render(
      <CartContextProvider value={cart}>
        <CheckoutDiscountCodes />
      </CartContextProvider>
    );

    await userEvent.click(
      screen.getByTestId('checkout__discount-code--show-input')
    );
    await userEvent.type(container.querySelector('input')!, 'Code1');
    await userEvent.click(
      screen.getByTestId('checkout__discount-code--apply-button')
    );
    expect(screen.queryAllByTestId('tag').length).toBe(1);
    expect(screen.queryAllByTestId('tag')[0].textContent).toBe('Code1');
    expect(container.querySelector('input')!).toHaveTextContent('');
  });
  test('should show required error when applying empty code', async () => {
    render(<CheckoutDiscountCodes></CheckoutDiscountCodes>);
    await userEvent.click(
      screen.getByTestId('checkout__discount-code--show-input')
    );
    await userEvent.click(
      screen.getByTestId('checkout__discount-code--apply-button')
    );
    expect(screen.getByTestId('error-text')).toHaveTextContent('Required');
  });
  test('should show error message when applying invalid code', async () => {
    let cart = EmptyCart;
    jest.spyOn(cartService, 'addDiscountCodes').mockRejectedValue([
      {
        message: 'Invalid code',
      },
    ]);
    const { container } = render(
      <CartContextProvider value={cart}>
        <CheckoutDiscountCodes />
      </CartContextProvider>
    );

    await userEvent.click(
      screen.getByTestId('checkout__discount-code--show-input')
    );
    await userEvent.type(container.querySelector('input')!, 'Code1');
    await userEvent.click(
      screen.getByTestId('checkout__discount-code--apply-button')
    );
    expect(screen.getByTestId('error-text')).toHaveTextContent('Invalid code');
  });

  test('should show network error message when applying invalid code', async () => {
    jest.spyOn(cartService, 'addDiscountCodes').mockRejectedValue({
      networkError: {
        result: {
          errors: [
            {
              message: 'Unexpected error',
            },
          ],
        },
      },
    });
    let cart = EmptyCart;
    const { container } = render(
      <CartContextProvider value={cart}>
        <CheckoutDiscountCodes />
      </CartContextProvider>
    );

    await userEvent.click(
      screen.getByTestId('checkout__discount-code--show-input')
    );
    await userEvent.type(container.querySelector('input')!, 'Code1');
    await userEvent.click(
      screen.getByTestId('checkout__discount-code--apply-button')
    );
    expect(screen.getByTestId('error-text')).toHaveTextContent(
      'Unexpected error'
    );
  });
});
