import { render, screen } from '@testing-library/react';
import { generateCartLineItemData } from '__mock__/generateMockData';
import CartContextProvider, { EmptyCart } from 'contexts/cartContext';
import WebsiteContextProvider, { EmptyWebsite } from 'contexts/websiteContext';
import { CheckoutOption } from 'models/checkout';
import OptionSummary from './OptionSummary';

describe('Option Summary Component', () => {
  test('should render correct checkout option value', () => {
    const checkoutOption: CheckoutOption = {
      id: '1',
      name: 'option name',
      description: 'option description',
      price: 100,
      selected: false,
      integrationType: '',
    };
    const cart = generateCartLineItemData(1, 1, 0);
    render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={cart}>
          <OptionSummary value={checkoutOption}></OptionSummary>
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(screen.getByTestId('option-summary__name')).toHaveTextContent(
      'option name'
    );
    expect(screen.getByTestId('option-summary__description')).toHaveTextContent(
      '100 SEK option description'
    );
  });
  test('should not render description if not available', () => {
    const checkoutOption: CheckoutOption = {
      id: '1',
      name: 'option name',
      description: '',
      price: 100,
      selected: false,
      integrationType: '',
    };
    const cart = generateCartLineItemData(1, 1, 0);
    render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={cart}>
          <OptionSummary value={checkoutOption}></OptionSummary>
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(screen.getByTestId('option-summary__description')).toHaveTextContent(
      '100 SEK'
    );
  });
  test('should not render title if not available', () => {
    const checkoutOption: CheckoutOption = {
      id: '1',
      name: 'option name',
      description: '',
      price: 100,
      selected: false,
      integrationType: '',
    };
    const cart = generateCartLineItemData(1, 1, 0);
    render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={cart}>
          <OptionSummary value={checkoutOption}></OptionSummary>
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(
      screen.queryByTestId('option-summary__title')
    ).not.toBeInTheDocument();
  });
  test('should render correct title if available', () => {
    const checkoutOption: CheckoutOption = {
      id: '1',
      name: 'option name',
      description: '',
      price: 100,
      selected: false,
      integrationType: '',
    };
    render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={EmptyCart}>
          <OptionSummary
            title="option title"
            value={checkoutOption}
          ></OptionSummary>
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(screen.getByTestId('option-summary__title')).toHaveTextContent(
      'option title'
    );
  });
  test('should render correct class name if available', () => {
    const checkoutOption: CheckoutOption = {
      id: '1',
      name: 'option name',
      description: '',
      price: 100,
      selected: false,
      integrationType: '',
    };

    const { container } = render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={EmptyCart}>
          <OptionSummary value={checkoutOption} className="foo"></OptionSummary>
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(container.firstChild).toHaveClass('foo');
  });
});
