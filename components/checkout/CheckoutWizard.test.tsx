import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateCartLineItemData } from '__mock__/generateMockData';
import CartContextProvider, { CartContext } from 'contexts/cartContext';
import WebsiteContextProvider, { EmptyWebsite } from 'contexts/websiteContext';
import { Checkout } from 'models/checkout';
import { useState } from 'react';
import * as cartServiceClient from 'services/cartService.client';
import * as checkoutServiceClient from 'services/checkoutService.client';
import CheckoutWizard from './CheckoutWizard';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const MockWebsite = {
  ...EmptyWebsite,
  imageServerUrl: 'https://localhost/',
};

jest.mock('services/checkoutService.client', () => ({
  createCheckoutSession: jest.fn(),
  updateAddresses: jest.fn(),
  updateBillingAddress: jest.fn(),
  updateCheckoutOptions: jest.fn(),
  updateShippingWidget: jest.fn(),
  validateCart: jest.fn(),
}));

jest.mock('services/cartService.client', () => ({
  get: jest.fn(),
}));

describe('Checkout Wizard component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cart validation functionality', () => {
    test('should handle cart validation errors on component mount', async () => {
      const checkout: Checkout = {
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        shippingOptions: [
          {
            id: 'DirectShipment:expressPackage',
            name: 'DirectShipment:expressPackage',
            description: null,
            price: 100,
            selected: true,
            integrationType: 'INLINE',
          },
        ],
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        paymentOptions: [
          {
            id: 'directpayment:DirectPay',
            name: 'directpayment:DirectPay',
            price: 0,
            selected: true,
            description: null,
            integrationType: 'DIRECT_PAYMENT',
          },
        ],
        paymentHtmlSnippet: '',
        checkoutFlowInfo: {
          receiptPageUrl: '',
        },
        shipmentHtmlSnippet: '',
      };

      jest
        .spyOn(checkoutServiceClient, 'createCheckoutSession')
        .mockResolvedValue(checkout);
      jest.spyOn(checkoutServiceClient, 'validateCart').mockResolvedValue({
        validateCart: {
          validationError: [{ message: 'Cart validation failed' }],
        },
      });

      const cart = generateCartLineItemData(1, 10, 2, true);
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );

      await waitFor(() => {
        expect(checkoutServiceClient.validateCart).toHaveBeenCalled();
      });
    });
  });

  describe('The payment method and delivery method are empty', () => {
    test('should not render component if payment options and delivery options are empty', async () => {
      const checkout: Checkout = {
        shippingAddress: {
          address1: '',
          zipCode: '',
          city: '',
          country: '',
          email: '',
          firstName: '',
          lastName: '',
          organizationName: '',
          phoneNumber: '',
        },
        shippingOptions: [],
        billingAddress: {
          address1: '',
          zipCode: '',
          city: '',
          country: '',
          email: '',
          firstName: '',
          lastName: '',
          organizationName: '',
          phoneNumber: '',
        },
        paymentOptions: [],
        paymentHtmlSnippet: 'widget payment',
        checkoutFlowInfo: {
          receiptPageUrl: '',
        },
        shipmentHtmlSnippet: '',
      };
      jest
        .spyOn(checkoutServiceClient, 'createCheckoutSession')
        .mockResolvedValue(checkout);
      const cart = generateCartLineItemData(1, 10, 2, true);
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );
      const { container } = render(<CheckoutWizard />);
      await waitFor(() => {
        expect(container.childElementCount).toEqual(0);
      });
    });
  });

  describe('The payment method of type iframe checkout and the delivery method of type payment checkout', () => {
    test('should render only iframe from payment provider', async () => {
      const checkout: Checkout = {
        shippingAddress: {
          address1: '',
          zipCode: '',
          city: '',
          country: '',
          email: '',
          firstName: '',
          lastName: '',
          organizationName: '',
          phoneNumber: '',
        },
        shippingOptions: [
          {
            id: 'DirectShipment:integratedShipping',
            name: 'DirectShipment:integratedShipping',
            description: null,
            price: 100,
            selected: true,
            integrationType: 'PAYMENT_CHECKOUT',
          },
        ],
        billingAddress: {
          address1: '',
          zipCode: '',
          city: '',
          country: '',
          email: '',
          firstName: '',
          lastName: '',
          organizationName: '',
          phoneNumber: '',
        },
        paymentOptions: [
          {
            description: null,
            id: 'klarnapayment:SE Checkout',
            name: 'klarnapayment:SE Checkout',
            price: 0,
            selected: true,
            integrationType: 'IFRAME_CHECKOUT',
          },
        ],
        paymentHtmlSnippet: 'widget payment',
        checkoutFlowInfo: {
          receiptPageUrl: '',
        },
        shipmentHtmlSnippet: '',
      };
      jest
        .spyOn(checkoutServiceClient, 'createCheckoutSession')
        .mockResolvedValue(checkout);
      const cart = generateCartLineItemData(1, 10, 2, true);
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );
      await waitFor(() => {
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).not.toBeInTheDocument();
        expect(screen.getByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(
          screen.getByTestId('checkout-wizard__widget')
        ).toBeInTheDocument();
      });
    });
  });

  describe('The payment method of type iframe checkout and the delivery method of type inline', () => {
    test('should render delivery options and iframe from payment provider', async () => {
      const checkout: Checkout = {
        shippingAddress: {
          address1: '',
          zipCode: '',
          city: '',
          country: '',
          email: '',
          firstName: '',
          lastName: '',
          organizationName: '',
          phoneNumber: '',
        },
        shippingOptions: [
          {
            id: 'DirectShipment:expressPackage',
            name: 'DirectShipment:expressPackage',
            description: null,
            price: 100,
            selected: true,
            integrationType: 'INLINE',
          },
        ],
        billingAddress: {
          address1: '',
          zipCode: '',
          city: '',
          country: '',
          email: '',
          firstName: '',
          lastName: '',
          organizationName: '',
          phoneNumber: '',
        },
        paymentOptions: [
          {
            description: null,
            id: 'klarnapayment:SE Checkout',
            name: 'klarnapayment:SE Checkout',
            price: 0,
            selected: true,
            integrationType: 'IFRAME_CHECKOUT',
          },
        ],
        paymentHtmlSnippet: 'widget payment',
        checkoutFlowInfo: {
          receiptPageUrl: '',
        },
        shipmentHtmlSnippet: '',
      };
      jest
        .spyOn(checkoutServiceClient, 'createCheckoutSession')
        .mockResolvedValue(checkout);
      const cart = generateCartLineItemData(1, 10, 2, true);
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );
      await waitFor(async () => {
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__widget')
        ).toBeInTheDocument();
      });
    });
  });

  describe('The payment method of type payment checkout and the delivery method of type inline', () => {
    let checkout: Checkout;
    beforeEach(() => {
      checkout = {
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        shippingOptions: [
          {
            id: 'DirectShipment:expressPackage',
            name: 'DirectShipment:expressPackage',
            description: null,
            price: 100,
            selected: true,
            integrationType: 'INLINE',
          },
        ],
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        paymentOptions: [
          {
            id: 'directpayment:DirectPay',
            name: 'directpayment:DirectPay',
            price: 0,
            selected: false,
            description: null,
            integrationType: 'DIRECT_PAYMENT',
          },
          {
            id: 'adyenpayment:SE Dropin',
            name: 'adyenpayment:SE Dropin',
            price: 0,
            selected: true,
            description: null,
            integrationType: 'PAYMENT_WIDGETS',
          },
        ],
        paymentHtmlSnippet: 'widget payment',
        checkoutFlowInfo: {
          receiptPageUrl: '',
        },
        shipmentHtmlSnippet: '',
      };
      jest
        .spyOn(checkoutServiceClient, 'createCheckoutSession')
        .mockResolvedValue(checkout);
      jest
        .spyOn(checkoutServiceClient, 'updateAddresses')
        .mockResolvedValue(checkout);
      jest
        .spyOn(checkoutServiceClient, 'updateBillingAddress')
        .mockResolvedValue(checkout);
    });
    test('should show the inline or payment checkout if iframe checkout are not configured', async () => {
      const cart = generateCartLineItemData(1, 10, 2, true);
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );
      await waitFor(async () => {
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__delivery-address-summary')
        ).toBeInTheDocument();
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__payment-option')
        ).toBeInTheDocument();
        expect(screen.queryAllByTestId('listBox__item').length).toBe(2);
        expect(screen.queryAllByTestId('listBox__item')[0]).toHaveTextContent(
          'directpayment:DirectPay'
        );
        expect(screen.queryAllByTestId('listBox__item')[1]).toHaveTextContent(
          'adyenpayment:SE Dropin'
        );
      });
    });
    test('should render delivery address form, delivery options, billing same as delivery and iframe from payment provider', async () => {
      const cart = generateCartLineItemData(1, 10, 2, true);
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );
      await waitFor(async () => {
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__delivery-address-summary')
        ).toBeInTheDocument();
        // edit delivery address summary
        await userEvent.click(screen.getByTestId('address-summary__btnEdit'));
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        expect(
          screen.queryByTestId('checkout-wizard__delivery-address-summary')
        ).toBeInTheDocument();
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-wizard__checkbox')).toBeChecked();
        expect(
          screen.queryByTestId('checkout-wizard__widget')
        ).toBeInTheDocument();
      });
    });
    test('should render delivery address form, delivery options, billing address form and iframe from payment provider', async () => {
      const cart = generateCartLineItemData(1, 10, 2, true);
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );
      await waitFor(async () => {
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__delivery-address-summary')
        ).toBeInTheDocument();
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-wizard__checkbox')).toBeChecked();
        // billing address form not same as delivery
        await userEvent.click(screen.getByTestId('checkout-wizard__checkbox'));
        expect(
          screen.queryByTestId('checkout-wizard__billing-address-form')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        expect(
          screen.queryByTestId('checkout-wizard__billing-address-summary')
        ).toBeInTheDocument();
        // edit billing address form
        await userEvent.click(screen.getByTestId('address-summary__btnEdit'));
        expect(
          screen.queryByTestId('checkout-wizard__billing-address-form')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        expect(
          screen.queryByTestId('checkout-wizard__billing-address-summary')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__widget')
        ).toBeInTheDocument();
      });
    });
  });

  describe('The payment method of type inline and the delivery method of type inline', () => {
    let checkout: Checkout;
    beforeEach(() => {
      checkout = {
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        shippingOptions: [
          {
            id: 'DirectShipment:expressPackage',
            name: 'DirectShipment:expressPackage',
            description: null,
            price: 100,
            selected: true,
            integrationType: 'INLINE',
          },
        ],
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        paymentOptions: [
          {
            id: 'directpayment:DirectPay',
            name: 'directpayment:DirectPay',
            price: 0,
            selected: true,
            description: null,
            integrationType: 'DIRECT_PAYMENT',
          },
        ],
        paymentHtmlSnippet: '',
        checkoutFlowInfo: {
          receiptPageUrl: '',
        },
        shipmentHtmlSnippet: '',
      };
      jest
        .spyOn(checkoutServiceClient, 'createCheckoutSession')
        .mockResolvedValue(checkout);
      jest
        .spyOn(checkoutServiceClient, 'updateAddresses')
        .mockResolvedValue(checkout);
      jest
        .spyOn(checkoutServiceClient, 'updateBillingAddress')
        .mockResolvedValue(checkout);
      jest
        .spyOn(checkoutServiceClient, 'updateCheckoutOptions')
        .mockResolvedValue(checkout);
    });
    test('should render delivery address form, delivery options, billing same as delivery and total order section', async () => {
      const cart = generateCartLineItemData(1, 10, 2, true);
      cart.rows = [
        ...cart.rows,
        {
          rowType: 'SHIPPING_FEE',
          rowId: 'ShippingFee',
          articleNumber: 'ShippingFee',
          quantity: 1,
          totalIncludingVat: 50,
          totalExcludingVat: 40,
          description: 'Shipping fee',
          discountInfos: [],
        },
      ];

      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );
      await waitFor(async () => {
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__delivery-address-summary')
        ).toBeInTheDocument();
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-wizard__checkbox')).toBeChecked();

        // Verify delivery summary shows correct information
        const deliverySummary = screen.getByTestId(
          'checkout-wizard__delivery-summary'
        );
        // name from selected shipping option
        expect(deliverySummary).toHaveTextContent(
          'DirectShipment:expressPackage'
        );
        // price = sum of all shipping fee rows
        expect(deliverySummary).toHaveTextContent('50');

        expect(
          screen.queryByTestId('checkout-wizard__widget')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__total-summary')
        ).toBeInTheDocument();
      });
    });
    test('should render delivery address form, delivery options, billing address form and total order section', async () => {
      const cart = generateCartLineItemData(1, 10, 2, true);
      jest.spyOn(cartServiceClient, 'get').mockResolvedValue(cart);
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );
      await waitFor(async () => {
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__delivery-address-summary')
        ).toBeInTheDocument();
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__delivery-summary')
        ).toBeInTheDocument();
        // edit delivery option
        await userEvent.click(screen.getByTestId('delivery-summary__edit'));
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        expect(screen.getByTestId('checkout-wizard__checkbox')).toBeChecked();
        // billing address form not same as delivery
        await userEvent.click(screen.getByTestId('checkout-wizard__checkbox'));
        expect(
          screen.queryByTestId('checkout-wizard__billing-address-form')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        expect(
          screen.queryByTestId('checkout-wizard__billing-address-summary')
        ).toBeInTheDocument();
        // edit billing address form
        await userEvent.click(screen.getByTestId('address-summary__btnEdit'));
        expect(
          screen.queryByTestId('checkout-wizard__billing-address-form')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        expect(
          screen.queryByTestId('checkout-wizard__billing-address-summary')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__widget')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__total-summary')
        ).toBeInTheDocument();
      });
    });
    test('should render delivery price as sum of shipping fee rows and use selected delivery option name as name', async () => {
      const cart = generateCartLineItemData(1, 10, 2, true);
      cart.rows = [
        ...cart.rows,
        {
          rowType: 'SHIPPING_FEE',
          rowId: 'ShippingFee1',
          articleNumber: 'ShippingFee1',
          quantity: 1,
          totalIncludingVat: 100,
          totalExcludingVat: 80,
          description: 'Shipping fee 1',
          discountInfos: [],
        },
        {
          rowType: 'SHIPPING_FEE',
          rowId: 'ShippingFee2',
          articleNumber: 'ShippingFee2',
          quantity: 1,
          totalIncludingVat: 200,
          totalExcludingVat: 160,
          description: 'Shipping fee 2',
          discountInfos: [],
        },
      ];

      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );
      await waitFor(async () => {
        // Verify initial delivery address step
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        // Verify delivery options step
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__delivery-address-summary')
        ).toBeInTheDocument();
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        // Verify payment step
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-wizard__checkbox')).toBeChecked();
        // Verify delivery summary shows selected option
        const deliverySummary = screen.getByTestId(
          'checkout-wizard__delivery-summary'
        );
        // name from selected delivery option
        expect(deliverySummary).toHaveTextContent(
          'DirectShipment:expressPackage'
        );
        // price = sum of all shipping fee rows
        expect(deliverySummary).toHaveTextContent('300');
      });
    });
    test('should render delivery price as 0 and use selected delivery option name as name if no shipping fee rows', async () => {
      const cart = generateCartLineItemData(1, 10, 2, true);

      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );
      await waitFor(async () => {
        // Verify initial delivery address step
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        // Verify delivery options step
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__delivery-address-summary')
        ).toBeInTheDocument();
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        // Verify payment step
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-wizard__checkbox')).toBeChecked();
        // Verify delivery summary shows selected option
        const deliverySummary = screen.getByTestId(
          'checkout-wizard__delivery-summary'
        );
        // name from selected delivery option
        expect(deliverySummary).toHaveTextContent(
          'DirectShipment:expressPackage'
        );
        // price = 0
        expect(deliverySummary).toHaveTextContent('0');
      });
    });
  });

  describe('The payment method of type inline and the delivery method of type delivery checkout', () => {
    let checkout: Checkout;
    beforeEach(() => {
      checkout = {
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        shippingOptions: [
          {
            id: 'DirectShipment:deliveryCheckout',
            name: 'DirectShipment:deliveryCheckout',
            description: null,
            price: 100,
            selected: true,
            integrationType: 'DELIVERY_CHECKOUT',
          },
        ],
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        paymentOptions: [
          {
            id: 'directpayment:DirectPay',
            name: 'directpayment:DirectPay',
            price: 0,
            selected: true,
            description: null,
            integrationType: 'DIRECT_PAYMENT',
          },
        ],
        shipmentHtmlSnippet: 'shipmentHtmlSnippet',
        checkoutFlowInfo: {
          receiptPageUrl: '',
        },
        paymentHtmlSnippet: '',
      };
      jest
        .spyOn(checkoutServiceClient, 'updateAddresses')
        .mockResolvedValue(checkout);
      jest
        .spyOn(checkoutServiceClient, 'updateShippingWidget')
        .mockResolvedValue(checkout);
      jest
        .spyOn(checkoutServiceClient, 'updateCheckoutOptions')
        .mockResolvedValue(checkout);
    });

    test('should render iframe from delivery provider', async () => {
      const cart = generateCartLineItemData(1, 10, 2, true);
      cart.rows = [
        ...cart.rows,
        {
          rowType: 'SHIPPING_FEE',
          rowId: 'ShippingFee1',
          articleNumber: 'ShippingFee1',
          quantity: 1,
          totalIncludingVat: 100,
          totalExcludingVat: 80,
          description: 'Shipping fee 1',
          discountInfos: [],
        },
      ];

      jest.spyOn(cartServiceClient, 'get').mockResolvedValue(cart);
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );
      await waitFor(async () => {
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__widget')
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        ).toBeDisabled();
        // Simulate the message event
        fireEvent(
          window,
          new MessageEvent('message', {
            data: {
              type: 'litium-connect-shipping',
              event: 'optionChanging',
              data: { value: 'HomeDelivery' },
            },
          })
        );
        expect(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        ).toBeEnabled();
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        expect(screen.getByTestId('checkout-wizard__checkbox')).toBeChecked();
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();

        // Verify delivery summary shows correct information
        const deliverySummary = screen.getByTestId(
          'checkout-wizard__delivery-summary'
        );
        // name from first shipping fee rows
        expect(deliverySummary).toHaveTextContent('Shipping fee 1');
        // price = sum of all shipping fee rows
        expect(deliverySummary).toHaveTextContent('100');

        // edit delivery option
        await userEvent.click(screen.getByTestId('delivery-summary__edit'));
        // trigger reset shipping options
        expect(
          checkoutServiceClient.updateCheckoutOptions
        ).toHaveBeenCalledWith({
          shippingOptionId: 'DirectShipment:deliveryCheckout',
        });
        expect(cartServiceClient.get).toHaveBeenCalled();
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
      });
    });

    test('should render delivery price as sum of shipping fee rows and use first row description as name', async () => {
      const cart = generateCartLineItemData(1, 10, 2, true);
      cart.rows = [
        ...cart.rows,
        {
          rowType: 'SHIPPING_FEE',
          rowId: 'ShippingFee1',
          articleNumber: 'ShippingFee1',
          quantity: 1,
          totalIncludingVat: 100,
          totalExcludingVat: 80,
          description: 'Shipping fee 1',
          discountInfos: [],
        },
        {
          rowType: 'SHIPPING_FEE',
          rowId: 'ShippingFee2',
          articleNumber: 'ShippingFee2',
          quantity: 1,
          totalIncludingVat: 200,
          totalExcludingVat: 160,
          description: 'Shipping fee 2',
          discountInfos: [],
        },
      ];

      jest.spyOn(cartServiceClient, 'get').mockResolvedValue(cart);
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );

      await waitFor(async () => {
        // Verify initial delivery address step
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        // Verify delivery options step
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__widget')
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        ).toBeDisabled();
        // Simulate the message event
        fireEvent(
          window,
          new MessageEvent('message', {
            data: {
              type: 'litium-connect-shipping',
              event: 'optionChanging',
              data: { value: 'HomeDelivery' },
            },
          })
        );
        expect(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        ).toBeEnabled();
        // Continue to payment step
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        expect(screen.getByTestId('checkout-wizard__checkbox')).toBeChecked();
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();
        // Verify delivery summary shows selected option
        const deliverySummary = screen.getByTestId(
          'checkout-wizard__delivery-summary'
        );
        // name from first shipping fee rows
        expect(deliverySummary).toHaveTextContent('Shipping fee 1');
        // price = sum of all shipping fee rows
        expect(deliverySummary).toHaveTextContent('300');
      });
    });

    test('should render delivery price as 0 and use selected delivery option name if no shipping fee rows', async () => {
      const cart = generateCartLineItemData(1, 10, 2, true);

      jest.spyOn(cartServiceClient, 'get').mockResolvedValue(cart);
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );

      await waitFor(async () => {
        // Verify initial delivery address step
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        // Verify delivery options step
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__widget')
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        ).toBeDisabled();
        // Simulate the message event
        fireEvent(
          window,
          new MessageEvent('message', {
            data: {
              type: 'litium-connect-shipping',
              event: 'optionChanging',
              data: { value: 'HomeDelivery' },
            },
          })
        );
        expect(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        ).toBeEnabled();
        // Continue to payment step
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        // Verify payment step
        expect(screen.getByTestId('checkout-wizard__checkbox')).toBeChecked();
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();
        // Verify delivery summary shows selected option
        const deliverySummary = screen.getByTestId(
          'checkout-wizard__delivery-summary'
        );
        expect(deliverySummary).toHaveTextContent(
          'DirectShipment:deliveryCheckout'
        );
        expect(deliverySummary).toHaveTextContent('0');
      });
    });
  });

  describe('The payment method of type inline and the delivery method of type delivery options', () => {
    let checkout: Checkout;
    beforeEach(() => {
      checkout = {
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        shippingOptions: [
          {
            id: 'DirectShipment:deliveryOptions',
            name: 'DirectShipment:deliveryOptions',
            description: null,
            price: 50,
            selected: true,
            integrationType: 'DELIVERY_OPTIONS',
          },
        ],
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        paymentOptions: [
          {
            id: 'directpayment:DirectPay',
            name: 'directpayment:DirectPay',
            price: 0,
            selected: true,
            description: null,
            integrationType: 'DIRECT_PAYMENT',
          },
        ],
        paymentHtmlSnippet: '',
        checkoutFlowInfo: {
          receiptPageUrl: '',
        },
        shipmentHtmlSnippet: '',
      };
      jest
        .spyOn(checkoutServiceClient, 'updateAddresses')
        .mockResolvedValue(checkout);
      jest
        .spyOn(checkoutServiceClient, 'updateBillingAddress')
        .mockResolvedValue(checkout);
      jest
        .spyOn(checkoutServiceClient, 'updateCheckoutOptions')
        .mockResolvedValue(checkout);
    });

    test('should render delivery options with correct information', async () => {
      const cart = generateCartLineItemData(1, 10, 2, true);
      cart.rows = [
        ...cart.rows,
        {
          rowType: 'SHIPPING_FEE',
          rowId: 'ShippingFee1',
          articleNumber: 'ShippingFee1',
          quantity: 1,
          totalIncludingVat: 100,
          totalExcludingVat: 80,
          description: 'Shipping fee 1',
          discountInfos: [],
        },
      ];

      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );

      await waitFor(async () => {
        // Verify initial delivery address step
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        // Verify delivery options step
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__delivery-address-summary')
        ).toBeInTheDocument();
        // Verify delivery options are displayed
        const deliveryOptions = screen.getByTestId(
          'checkout-wizard__delivery-option'
        );
        expect(deliveryOptions).toBeInTheDocument();
        expect(deliveryOptions).toHaveTextContent(
          'DirectShipment:deliveryOptions'
        );
        // Continue to payment step
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        // Verify payment step
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-wizard__checkbox')).toBeChecked();
        // Verify delivery summary shows selected option
        const deliverySummary = screen.getByTestId(
          'checkout-wizard__delivery-summary'
        );
        // name from selected delivery option
        expect(deliverySummary).toHaveTextContent('Shipping fee 1');
        // price = sum of all shipping fee rows
        expect(deliverySummary).toHaveTextContent('100');
        // Edit delivery option
        await userEvent.click(screen.getByTestId('delivery-summary__edit'));
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
      });
    });

    test('should render delivery price as sum of shipping fee rows and use first row description as name', async () => {
      const cart = generateCartLineItemData(1, 10, 2, true);
      cart.rows = [
        ...cart.rows,
        {
          rowType: 'SHIPPING_FEE',
          rowId: 'ShippingFee1',
          articleNumber: 'ShippingFee1',
          quantity: 1,
          totalIncludingVat: 100,
          totalExcludingVat: 80,
          description: 'Shipping fee 1',
          discountInfos: [],
        },
        {
          rowType: 'SHIPPING_FEE',
          rowId: 'ShippingFee2',
          articleNumber: 'ShippingFee2',
          quantity: 1,
          totalIncludingVat: 200,
          totalExcludingVat: 160,
          description: 'Shipping fee 2',
          discountInfos: [],
        },
      ];

      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );

      await waitFor(async () => {
        // Verify initial delivery address step
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        // Verify delivery options step
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__delivery-address-summary')
        ).toBeInTheDocument();
        // Verify delivery options are displayed
        const deliveryOptions = screen.getByTestId(
          'checkout-wizard__delivery-option'
        );
        expect(deliveryOptions).toBeInTheDocument();
        expect(deliveryOptions).toHaveTextContent(
          'DirectShipment:deliveryOptions'
        );
        // Continue to payment step
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        // Verify payment step
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-wizard__checkbox')).toBeChecked();
        // Verify delivery summary shows selected option
        const deliverySummary = screen.getByTestId(
          'checkout-wizard__delivery-summary'
        );
        // name from first shipping fee rows
        expect(deliverySummary).toHaveTextContent('Shipping fee 1');
        // price = sum of all shipping fee rows
        expect(deliverySummary).toHaveTextContent('300');
      });
    });

    test('should render delivery price as 0 and use selected delivery option name as name if no shipping fee rows', async () => {
      const cart = generateCartLineItemData(1, 10, 2, true);

      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );

      await waitFor(async () => {
        // Verify initial delivery address step
        expect(
          screen.queryByTestId('STEP_DELIVERY_ADDRESS')
        ).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('address-form__submit'));
        // Verify delivery options step
        expect(
          screen.queryByTestId('STEP_DELIVERY_OPTION')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__delivery-address-summary')
        ).toBeInTheDocument();
        // Verify delivery options are displayed
        const deliveryOptions = screen.getByTestId(
          'checkout-wizard__delivery-option'
        );
        expect(deliveryOptions).toBeInTheDocument();
        expect(deliveryOptions).toHaveTextContent(
          'DirectShipment:deliveryOptions'
        );
        // Continue to payment step
        await userEvent.click(
          screen.getByTestId('checkout-wizard__delivery-option-continue')
        );
        // Verify payment step
        expect(screen.queryByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-wizard__checkbox')).toBeChecked();
        // Verify delivery summary shows selected option
        const deliverySummary = screen.getByTestId(
          'checkout-wizard__delivery-summary'
        );
        // name from selected delivery option
        expect(deliverySummary).toHaveTextContent(
          'DirectShipment:deliveryOptions'
        );
        // price = 0
        expect(deliverySummary).toHaveTextContent('0');
      });
    });
  });

  describe('PaymentWidget error handling', () => {
    test('should display error messages when validateCart returns validation errors', async () => {
      const checkout: Checkout = {
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        shippingOptions: [
          {
            id: 'DirectShipment:expressPackage',
            name: 'DirectShipment:expressPackage',
            description: null,
            price: 100,
            selected: true,
            integrationType: 'PAYMENT_CHECKOUT',
          },
        ],
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        paymentOptions: [
          {
            id: 'klarnapayment:SE Checkout',
            name: 'klarnapayment:SE Checkout',
            price: 0,
            selected: true,
            description: null,
            integrationType: 'IFRAME_CHECKOUT',
          },
        ],
        paymentHtmlSnippet: 'widget payment',
        checkoutFlowInfo: {
          receiptPageUrl: '',
        },
        shipmentHtmlSnippet: '',
      };

      const mockValidationErrors = [
        { message: 'Cart validation failed: Product out of stock' },
        { message: 'Cart validation failed: Invalid shipping address' },
      ];

      jest
        .spyOn(checkoutServiceClient, 'createCheckoutSession')
        .mockResolvedValue(checkout);
      jest.spyOn(checkoutServiceClient, 'validateCart').mockResolvedValue({
        validateCart: {
          validationError: mockValidationErrors,
        },
      });

      const cart = generateCartLineItemData(1, 10, 2, true);
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );

      // Wait for the component to render and validate cart
      await waitFor(() => {
        expect(checkoutServiceClient.validateCart).toHaveBeenCalled();
      });

      // Simulate PaymentWidget being loaded to trigger error display
      const paymentWidget = screen.getByTestId('checkout-wizard__widget');
      expect(paymentWidget).toBeInTheDocument();

      // Trigger PaymentWidget onLoad callback to set isWidgetReady to true
      // This is needed for error messages to be displayed
      fireEvent.load(paymentWidget);

      await waitFor(() => {
        // Check that error messages are displayed
        expect(
          screen.getByText('Cart validation failed: Product out of stock')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Cart validation failed: Invalid shipping address')
        ).toBeInTheDocument();
      });
    });
  });
  describe('Direct payment error handling', () => {
    test('should display error messages in TotalSummary when validateCart returns errors and no PaymentWidget is present', async () => {
      const checkout: Checkout = {
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        shippingOptions: [
          {
            id: 'DirectShipment:expressPackage',
            name: 'DirectShipment:expressPackage',
            description: null,
            price: 100,
            selected: true,
            integrationType: 'INLINE',
          },
        ],
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        paymentOptions: [
          {
            id: 'directpayment:DirectPay',
            name: 'directpayment:DirectPay',
            price: 0,
            selected: true,
            description: null,
            integrationType: 'DIRECT_PAYMENT',
          },
        ],
        paymentHtmlSnippet: '', // No PaymentWidget - this triggers TotalSummary display
        checkoutFlowInfo: {
          receiptPageUrl: '',
        },
        shipmentHtmlSnippet: '',
      };

      const mockValidationErrors = [
        { message: 'Cart validation failed: Product out of stock' },
        { message: 'Cart validation failed: Invalid payment method' },
      ];

      jest
        .spyOn(checkoutServiceClient, 'createCheckoutSession')
        .mockResolvedValue(checkout);
      jest
        .spyOn(checkoutServiceClient, 'updateAddresses')
        .mockResolvedValue(checkout);
      jest
        .spyOn(checkoutServiceClient, 'updateCheckoutOptions')
        .mockResolvedValue(checkout);
      jest.spyOn(checkoutServiceClient, 'validateCart').mockResolvedValue({
        validateCart: {
          validationError: mockValidationErrors,
        },
      });
      jest
        .spyOn(cartServiceClient, 'get')
        .mockResolvedValue(generateCartLineItemData(1, 10, 2, true));

      const cart = generateCartLineItemData(1, 10, 2, true);
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <CartContextProvider value={cart}>
            <CheckoutWizard state={checkout} />
          </CartContextProvider>
        </WebsiteContextProvider>
      );

      // Navigate through the checkout flow to reach payment step with TotalSummary
      await waitFor(() => {
        expect(screen.getByTestId('STEP_DELIVERY_ADDRESS')).toBeInTheDocument();
      });

      // Fill and submit delivery address
      await userEvent.click(screen.getByTestId('address-form__submit'));

      await waitFor(() => {
        expect(screen.getByTestId('STEP_DELIVERY_OPTION')).toBeInTheDocument();
      });

      // Continue to payment step
      await userEvent.click(
        screen.getByTestId('checkout-wizard__delivery-option-continue')
      );

      await waitFor(() => {
        expect(screen.getByTestId('STEP_PAYMENT')).toBeInTheDocument();
        // Verify TotalSummary is displayed (not PaymentWidget)
        expect(
          screen.getByTestId('checkout-wizard__total-summary')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('checkout-wizard__widget')
        ).not.toBeInTheDocument();
      });

      // Verify that validation errors are displayed in the TotalSummary error section
      await waitFor(() => {
        const errorTexts = screen.getAllByTestId('error-text');
        expect(errorTexts).toHaveLength(2);
        expect(errorTexts[0]).toHaveTextContent(
          'Cart validation failed: Product out of stock'
        );
        expect(errorTexts[1]).toHaveTextContent(
          'Cart validation failed: Invalid payment method'
        );
      });

      // Verify validateCart was called during the process
      expect(checkoutServiceClient.validateCart).toHaveBeenCalled();
    });
  });

  describe('Cart change error handling', () => {
    test('should clear place order errors when cart content changes - Payment Widget case', async () => {
      const checkout: Checkout = {
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        shippingOptions: [
          {
            id: 'DirectShipment:integratedShipping',
            name: 'DirectShipment:integratedShipping',
            description: null,
            price: 100,
            selected: true,
            integrationType: 'PAYMENT_CHECKOUT',
          },
        ],
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        paymentOptions: [
          {
            description: null,
            id: 'klarnapayment:SE Checkout',
            name: 'klarnapayment:SE Checkout',
            price: 0,
            selected: true,
            integrationType: 'IFRAME_CHECKOUT',
          },
        ],
        paymentHtmlSnippet: 'widget payment', // Payment widget present
        checkoutFlowInfo: {
          receiptPageUrl: '',
        },
        shipmentHtmlSnippet: '',
      };

      // Set up initial validation errors
      const mockValidationErrors = [
        { message: 'Payment widget validation error' },
      ];

      jest
        .spyOn(checkoutServiceClient, 'createCheckoutSession')
        .mockResolvedValue(checkout);
      jest.spyOn(checkoutServiceClient, 'validateCart').mockResolvedValue({
        validateCart: {
          validationError: mockValidationErrors,
        },
      });
      jest
        .spyOn(cartServiceClient, 'get')
        .mockResolvedValue(generateCartLineItemData(1, 10, 2, true));

      // Create a custom cart context that allows us to control hasCartChanged
      const MockCartContextProvider = ({
        children,
      }: {
        children: React.ReactNode;
      }) => {
        const [cart, setCart] = useState(
          generateCartLineItemData(1, 10, 2, true)
        );
        const [hasCartChanged, setHasCartChanged] = useState(false);

        // Expose the setHasCartChanged function globally for testing
        (window as any).testSetHasCartChanged = setHasCartChanged;

        return (
          <CartContext.Provider
            value={{ cart, setCart, hasCartChanged, setHasCartChanged }}
          >
            {children}
          </CartContext.Provider>
        );
      };

      render(
        <WebsiteContextProvider value={MockWebsite}>
          <MockCartContextProvider>
            <CheckoutWizard state={checkout} />
          </MockCartContextProvider>
        </WebsiteContextProvider>
      );

      // Wait for payment widget step to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(
          screen.getByTestId('checkout-wizard__widget')
        ).toBeInTheDocument();
      });

      // Simulate PaymentWidget being loaded to trigger error display
      const paymentWidget = screen.getByTestId('checkout-wizard__widget');
      fireEvent.load(paymentWidget);

      // Verify initial validation errors are displayed
      await waitFor(() => {
        expect(
          screen.getByText('Payment widget validation error')
        ).toBeInTheDocument();
      });

      // Trigger cart change by setting hasCartChanged to true
      (window as any).testSetHasCartChanged(true);

      // Wait for the useEffect to process the cart change and clear errors
      await waitFor(() => {
        // Verify that place order errors have been cleared
        expect(
          screen.queryByText('Payment widget validation error')
        ).not.toBeInTheDocument();
      });

      // Clean up the global test function
      delete (window as any).testSetHasCartChanged;
    });

    test('should clear place order errors when cart content changes - Direct Payment case', async () => {
      const checkout: Checkout = {
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        shippingOptions: [
          {
            id: 'DirectShipment:expressPackage',
            name: 'DirectShipment:expressPackage',
            description: null,
            price: 100,
            selected: true,
            integrationType: 'INLINE',
          },
        ],
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          zipCode: '12345',
          country: 'SE',
          city: 'USA',
          organizationName: 'AnyCompany',
          email: 'test@mail.com',
          phoneNumber: '12345678',
        },
        paymentOptions: [
          {
            id: 'directpayment:DirectPay',
            name: 'directpayment:DirectPay',
            price: 0,
            selected: true,
            description: null,
            integrationType: 'DIRECT_PAYMENT',
          },
        ],
        paymentHtmlSnippet: '', // No payment widget - direct payment
        checkoutFlowInfo: {
          receiptPageUrl: '',
        },
        shipmentHtmlSnippet: '',
      };

      // Set up initial validation errors
      const mockValidationErrors = [
        { message: 'Direct payment validation error' },
      ];

      jest
        .spyOn(checkoutServiceClient, 'createCheckoutSession')
        .mockResolvedValue(checkout);
      jest
        .spyOn(checkoutServiceClient, 'updateAddresses')
        .mockResolvedValue(checkout);
      jest
        .spyOn(checkoutServiceClient, 'updateCheckoutOptions')
        .mockResolvedValue(checkout);
      jest.spyOn(checkoutServiceClient, 'validateCart').mockResolvedValue({
        validateCart: {
          validationError: mockValidationErrors,
        },
      });
      jest
        .spyOn(cartServiceClient, 'get')
        .mockResolvedValue(generateCartLineItemData(1, 10, 2, true));

      // Create a custom cart context that allows us to control hasCartChanged
      const MockCartContextProvider = ({
        children,
      }: {
        children: React.ReactNode;
      }) => {
        const [cart, setCart] = useState(
          generateCartLineItemData(1, 10, 2, true)
        );
        const [hasCartChanged, setHasCartChanged] = useState(false);

        // Expose the setHasCartChanged function globally for testing
        (window as any).testSetHasCartChanged = setHasCartChanged;

        return (
          <CartContext.Provider
            value={{ cart, setCart, hasCartChanged, setHasCartChanged }}
          >
            {children}
          </CartContext.Provider>
        );
      };

      render(
        <WebsiteContextProvider value={MockWebsite}>
          <MockCartContextProvider>
            <CheckoutWizard state={checkout} />
          </MockCartContextProvider>
        </WebsiteContextProvider>
      );

      // Navigate through the checkout flow to reach payment step
      await waitFor(() => {
        expect(screen.getByTestId('STEP_DELIVERY_ADDRESS')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('address-form__submit'));

      await waitFor(() => {
        expect(screen.getByTestId('STEP_DELIVERY_OPTION')).toBeInTheDocument();
      });

      await userEvent.click(
        screen.getByTestId('checkout-wizard__delivery-option-continue')
      );

      await waitFor(() => {
        expect(screen.getByTestId('STEP_PAYMENT')).toBeInTheDocument();
        expect(
          screen.getByTestId('checkout-wizard__total-summary')
        ).toBeInTheDocument();
        // Verify no payment widget is present
        expect(
          screen.queryByTestId('checkout-wizard__widget')
        ).not.toBeInTheDocument();
      });

      // Verify initial validation errors are displayed in TotalSummary
      await waitFor(() => {
        const errorTexts = screen.getAllByTestId('error-text');
        expect(errorTexts).toHaveLength(1);
        expect(errorTexts[0]).toHaveTextContent(
          'Direct payment validation error'
        );
      });

      // Trigger cart change by setting hasCartChanged to true
      (window as any).testSetHasCartChanged(true);

      // Wait for the useEffect to process the cart change and clear errors
      await waitFor(() => {
        // Verify that place order errors have been cleared
        // After clearing errors, there should be no error texts displayed
        const errorTexts = screen.queryAllByTestId('error-text');
        expect(errorTexts).toHaveLength(0);
      });

      // Clean up the global test function
      delete (window as any).testSetHasCartChanged;
    });
  });
});
