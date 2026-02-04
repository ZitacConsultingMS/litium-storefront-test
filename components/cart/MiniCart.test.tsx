import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MiniCart from './MiniCart';

describe('Mini cart Component', () => {
  test('should render correct checkout page url', () => {
    render(<MiniCart checkoutPageUrl={'/checkout'} />);
    expect(screen.getByTestId('checkout-button')).toHaveAttribute(
      'href',
      '/checkout'
    );
  });
  test('should not render checkout page url if not available', () => {
    render(<MiniCart checkoutPageUrl={''} />);
    expect(screen.getByTestId('checkout-button')).toHaveAttribute('href', '');
  });
  test('should show cart sidebar when clicking on cart icon', async () => {
    render(<MiniCart checkoutPageUrl={'/checkout'} />);
    const cartIcon = screen.getByTestId('mini-cart__bag');
    await userEvent.click(cartIcon);
    expect(screen.queryByTestId('sidebar__backdrop')).toBeInTheDocument();
  });
});
