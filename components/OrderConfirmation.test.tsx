import { render, screen } from '@testing-library/react';
import { generateCartLineItemData } from '__mock__/generateMockData';
import CartContextProvider from 'contexts/cartContext';
import WebsiteContextProvider, { EmptyWebsite } from 'contexts/websiteContext';
import OrderConfirmation from './OrderConfirmation';

window.scrollTo = jest.fn();
const cart = generateCartLineItemData(1, 10, 0, true);
const receipt = {
  rows: cart.rows,
  discountInfos: cart.discountInfos,
  shippingAddress: {
    firstName: 'Avis',
    lastName: 'Bradshaw',
    organizationName: '',
    email: 'avisbradshaw@nipaz.com',
    phoneNumber: '+1 (958) 569-2722',
    address1: '346 Harkness Avenue',
    zipCode: '1785',
    city: 'Ada',
    country: 'SE',
  },
  orderNumber: 'LS007',
  grandTotal: cart.grandTotal,
  totalVat: cart.totalVat,
  customerDetails: {
    email: 'abc@gmail.com',
    phone: '0946875352',
  },
};
const MockWebsite = {
  ...EmptyWebsite,
  imageServerUrl: 'https://localhost/',
};

describe('Order confirmation component', () => {
  test('should render the correct a order confirmation', () => {
    render(
      <WebsiteContextProvider value={MockWebsite}>
        <CartContextProvider value={cart}>
          <OrderConfirmation
            receipt={receipt}
            myPagesPageUrl="/my-pages"
            orderHistoryPageUrl={''}
            isLogged={false}
          />
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(screen.getByTestId('order-confirmation__title')).toHaveTextContent(
      'orderconfirmation.title LS007'
    );
    expect(screen.getByTestId('order-confirmation__sayhi')).toHaveTextContent(
      'orderconfirmation.sayhi Avis'
    );
    expect(
      screen.getByTestId('order-confirmation__thankyou')
    ).toHaveTextContent('orderconfirmation.thankyou LS007');
    expect(
      screen.getByTestId('order-confirmation__name-customer')
    ).toHaveTextContent('Avis Bradshaw');
    expect(
      screen.getByTestId('order-confirmation__address1')
    ).toHaveTextContent('346 Harkness Avenue');
    expect(screen.getByTestId('order-confirmation__zipCode')).toHaveTextContent(
      '1785'
    );
    expect(screen.getByTestId('order-confirmation__city')).toHaveTextContent(
      'Ada'
    );
    expect(screen.getByTestId('order-confirmation__country')).toHaveTextContent(
      'SE'
    );
    expect(screen.getByTestId('order-confirmation__email')).toHaveTextContent(
      'abc@gmail.com'
    );
    expect(screen.getByTestId('order-confirmation__phone')).toHaveTextContent(
      '0946875352'
    );
    expect(
      screen.getByTestId('order-confirmation__order-number')
    ).toHaveTextContent('orderconfirmation.ordernumber LS007');
    expect(
      screen.getByTestId('order-confirmation__grand-total')
    ).toHaveTextContent('1 000 SEK');
    expect(
      screen.queryByTestId('order-confirmation__my-pages-url')
    ).toHaveAttribute('href', '/my-pages');
  });

  test('should render a default url without myPagesPageUrl', () => {
    render(
      <WebsiteContextProvider value={MockWebsite}>
        <OrderConfirmation
          receipt={receipt}
          myPagesPageUrl={''}
          orderHistoryPageUrl={''}
          isLogged={false}
        />
      </WebsiteContextProvider>
    );
    expect(
      screen.queryByTestId('order-confirmation__my-pages-url')
    ).toHaveAttribute('href', '/');
  });

  test('should render a default url without orderHistoryPageUrl', () => {
    render(
      <WebsiteContextProvider value={MockWebsite}>
        <OrderConfirmation
          receipt={receipt}
          myPagesPageUrl={''}
          orderHistoryPageUrl={''}
          isLogged={true}
        />
      </WebsiteContextProvider>
    );
    expect(
      screen.queryByTestId('order-confirmation__order-history-url')
    ).toHaveAttribute('href', '/');
  });

  test('should render an orderHistoryPageUrl', () => {
    render(
      <WebsiteContextProvider value={MockWebsite}>
        <OrderConfirmation
          receipt={receipt}
          myPagesPageUrl={''}
          orderHistoryPageUrl={'/order-history'}
          isLogged={true}
        />
      </WebsiteContextProvider>
    );
    expect(
      screen.queryByTestId('order-confirmation__order-history-url')
    ).toHaveAttribute('href', '/order-history');
  });
});
