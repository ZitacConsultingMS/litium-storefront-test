import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartContextProvider, { EmptyCart } from 'contexts/cartContext';
import WebsiteContextProvider, { EmptyWebsite } from 'contexts/websiteContext';
import { CheckoutOption } from 'models/checkout';
import DeliverySummary from './DeliverySummary';

describe('Delivery Summary Component', () => {
  test('should call onEdit function when clicking edit button', async () => {
    const selectedDeliveryOption: CheckoutOption = {
      id: '1',
      name: '',
      description: null,
      price: 100,
      selected: false,
      integrationType: '',
    };
    const addressFormData = {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      zipCode: '12345',
      country: 'SE',
      city: 'USA',
      organizationName: 'AnyCompany',
      email: 'test@mail.com',
      phoneNumber: '12345678',
    };
    console.log = jest.fn();
    render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={EmptyCart}>
          <DeliverySummary
            selectedDeliveryOption={selectedDeliveryOption}
            shippingAddress={addressFormData}
            onEdit={() => {
              console.log('foo');
            }}
          ></DeliverySummary>
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    await userEvent.click(screen.getByTestId('delivery-summary__edit'));
    expect(console.log).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('foo');
  });
  test('should render address summary by default', () => {
    const selectedDeliveryOption: CheckoutOption = {
      id: '1',
      name: '',
      description: null,
      price: 100,
      selected: false,
      integrationType: '',
    };
    const addressFormData = {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      zipCode: '12345',
      country: 'SE',
      city: 'USA',
      organizationName: 'AnyCompany',
      email: 'test@mail.com',
      phoneNumber: '12345678',
    };
    render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={EmptyCart}>
          <DeliverySummary
            selectedDeliveryOption={selectedDeliveryOption}
            shippingAddress={addressFormData}
            onEdit={() => {}}
          ></DeliverySummary>
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(screen.getByTestId('address-summary')).toBeInTheDocument();
  });
  test('should not render address summary if showAddress is false', () => {
    const selectedDeliveryOption: CheckoutOption = {
      id: '1',
      name: '',
      description: null,
      price: 100,
      selected: false,
      integrationType: '',
    };
    const addressFormData = {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      zipCode: '12345',
      country: 'SE',
      city: 'USA',
      organizationName: 'AnyCompany',
      email: 'test@mail.com',
      phoneNumber: '12345678',
    };
    render(
      <WebsiteContextProvider value={EmptyWebsite}>
        <CartContextProvider value={EmptyCart}>
          <DeliverySummary
            selectedDeliveryOption={selectedDeliveryOption}
            shippingAddress={addressFormData}
            onEdit={() => {}}
            showAddress={false}
          ></DeliverySummary>
        </CartContextProvider>
      </WebsiteContextProvider>
    );
    expect(screen.queryByTestId('address-summary')).not.toBeInTheDocument();
  });
});
