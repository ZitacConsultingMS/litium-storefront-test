import { fireEvent, render, screen } from '@testing-library/react';
import { add } from 'services/cartService.client';
import BuyButton from './BuyButton';
jest.mock('services/cartService.client', () => ({
  add: jest.fn(),
}));

describe('Buy Button', () => {
  test('should render buy button with correct label', async () => {
    render(
      <BuyButton
        label="Add to cart"
        articleNumber="article-number-1"
      ></BuyButton>
    );
    expect(screen.getByTestId('buy-button')).toBeVisible();
    expect(screen.getByTestId('buy-button')).toHaveTextContent('Add to cart');
  });
  test('should render buy button without link when product has article number', async () => {
    render(
      <BuyButton
        label="Add to cart"
        articleNumber="article-number-1"
      ></BuyButton>
    );
    expect(screen.getByTestId('buy-button')).toBeVisible();
    expect(screen.getByTestId('buy-button')).not.toHaveAttribute('a');
  });
  test('should show loading spinner after clicking on buy button', async () => {
    render(
      <BuyButton
        label="Add to cart"
        articleNumber="article-number-1"
      ></BuyButton>
    );
    fireEvent.click(screen.getByTestId('buy-button'));
    expect(screen.getByTestId('reactive-wrapper')).toHaveClass(
      'reactive-button--loading'
    );
  });
  test('should call add to cart service with quantity is 1 by default', () => {
    render(
      <BuyButton
        label="Add to cart"
        articleNumber="article-number-1"
      ></BuyButton>
    );
    fireEvent.click(screen.getByTestId('buy-button'));
    expect(add as jest.Mock).toHaveBeenCalledWith('article-number-1', 1);
  });
  test('should call add to cart service with quantity is 5', () => {
    render(
      <BuyButton
        label="Add to cart"
        articleNumber="article-number-1"
        quantity={5}
      ></BuyButton>
    );
    fireEvent.click(screen.getByTestId('buy-button'));
    expect(add as jest.Mock).toHaveBeenCalledWith('article-number-1', 5);
  });
  test('should log an error if call add to cart failed', async () => {
    const mockAddToCart = add as jest.Mock;
    console.log = jest.fn();
    mockAddToCart.mockRejectedValue('add to cart failed');
    render(
      <BuyButton
        label="Add to cart"
        articleNumber="article-number-1"
        quantity={5}
      ></BuyButton>
    );
    await fireEvent.click(screen.getByTestId('buy-button'));
    expect(mockAddToCart).toHaveBeenCalledWith('article-number-1', 5);
    expect(console.log).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('add to cart failed');
  });
});
