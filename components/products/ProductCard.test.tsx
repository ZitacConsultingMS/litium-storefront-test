import { render, screen } from '@testing-library/react';
import {
  generateCartLineItemData,
  generateProductItems,
} from '__mock__/generateMockData';
import ProductCard from 'components/products/ProductCard';
import CartContextProvider from 'contexts/cartContext';
import { EmptyWebsite, WebsiteContext } from 'contexts/websiteContext';
import { ProductItem } from 'models/products';
import { Website } from 'models/website';

const MockWebsite: Website = {
  ...EmptyWebsite,
  imageServerUrl: 'https://localhost/',
};

describe('Product Card Component', () => {
  test('should render a product with image', () => {
    const mockDataWithImage: ProductItem = generateProductItems(1, 3)[0];
    const cart = generateCartLineItemData(1, 1, 0);
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <CartContextProvider value={cart}>
          <ProductCard {...mockDataWithImage} />
        </CartContextProvider>
      </WebsiteContext.Provider>
    );
    expect(screen.getByTestId('product-card__name')).toHaveTextContent(
      'Product name 0'
    );
    expect(screen.getByTestId('product-card__brand')).toHaveTextContent(
      'Brand name 0'
    );
    // expect(screen.getByTestId('product-card__price')).toHaveTextContent(
    //   '1 000 SEK'
    // );
    expect(screen.getByTestId('product-card__url')).toHaveAttribute(
      'href',
      '/product-card-0'
    );
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Product name 0');
  });

  test('should render a product without image', () => {
    const mockDataWithoutImage: ProductItem = generateProductItems(1, 0)[0];
    const cart = generateCartLineItemData(1, 1, 0);
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <CartContextProvider value={cart}>
          <ProductCard {...mockDataWithoutImage} />
        </CartContextProvider>
      </WebsiteContext.Provider>
    );
    expect(screen.getByTestId('product-card__name')).toHaveTextContent(
      'Product name 0'
    );
    expect(screen.getByTestId('product-card__brand')).toHaveTextContent(
      'Brand name 0'
    );
    expect(screen.getByTestId('product-card__url')).toHaveAttribute(
      'href',
      '/product-card-0'
    );
    expect(screen.getByTestId('product-card__missing-image')).toHaveTextContent(
      'productcard.missingimage'
    );
  });

  test('should call onClick function when clicking on product card', () => {
    const productItem: ProductItem = generateProductItems(1, 0)[0];
    productItem.isVariant = false;
    const onClick = jest.fn();

    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <ProductCard {...productItem} onClick={onClick} showBuyButton={true} />
      </WebsiteContext.Provider>
    );

    screen.getByTestId('product-card__url').click();
    expect(onClick).toHaveBeenCalled();

    const showBuyButton = screen.getByTestId('product-card__show-button');
    expect(showBuyButton).toBeInTheDocument();

    showBuyButton.click();
    expect(onClick).toHaveBeenCalled();
  });

  test('should render show button if product is not variant', () => {
    const productItem: ProductItem = generateProductItems(1, 0)[0];
    productItem.isVariant = false;

    const onClick = jest.fn();

    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <ProductCard {...productItem} onClick={onClick} showBuyButton={true} />
      </WebsiteContext.Provider>
    );

    const showButton = screen.getByTestId('product-card__show-button');
    expect(showButton).toBeInTheDocument();
    expect(showButton).toHaveAttribute('href', '/product-card-0');
  });

  test('should render buy button if product is variant', () => {
    const productItem: ProductItem = generateProductItems(1, 0)[0];
    const onClick = jest.fn();

    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <ProductCard {...productItem} onClick={onClick} showBuyButton={true} />
      </WebsiteContext.Provider>
    );

    expect(screen.getByTestId('buy-button')).toBeInTheDocument();
  });
});
