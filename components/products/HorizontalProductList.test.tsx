import { render, screen } from '@testing-library/react';
import { generateProductItems } from '__mock__/generateMockData';
import HorizontalProductList from './HorizontalProductList';

describe('HorizontalProductList component', () => {
  test('should render the product list with a title', () => {
    const data = generateProductItems(3, 1);
    render(<HorizontalProductList title="Foo" items={data} />);
    expect(
      screen.getByTestId('horizontal-product-list__title')
    ).toHaveTextContent('Foo');
  });
  test('should not render the product list without a title', () => {
    const data = generateProductItems(3, 1);
    render(<HorizontalProductList items={data} />);
    expect(screen.queryByTestId('horizontal-product-list__title')).toBeNull();
  });
  test('should render the product list with 5 items', () => {
    const data = generateProductItems(5, 1);
    const { container } = render(<HorizontalProductList items={data} />);
    expect(container.querySelectorAll('.swiper-slide').length).toBe(5);
  });
  test('should include a customized class name if it exists', () => {
    const data = generateProductItems(3, 1);
    render(<HorizontalProductList title="Foo" items={data} className="bar" />);
    expect(
      screen.getByTestId('horizontal-product-list__container')
    ).toHaveClass('bar');
  });
  test('should not render the product list if items are empty', () => {
    render(<HorizontalProductList title="Foo" items={[]} className="bar" />);
    expect(
      screen.queryByTestId('horizontal-product-list__container')
    ).toBeNull();
  });
});
