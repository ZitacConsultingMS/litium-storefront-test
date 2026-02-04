import { OrderAddress } from './address';

export interface CheckoutOption {
  id: string;
  name: string;
  description: string | null;
  price: number;
  selected: boolean;
  integrationType: string;
}
export interface Checkout {
  shippingAddress: OrderAddress;
  shippingOptions: CheckoutOption[];
  billingAddress: OrderAddress;
  paymentOptions: CheckoutOption[];
  paymentHtmlSnippet: string;
  shipmentHtmlSnippet: string;
  checkoutFlowInfo: {
    receiptPageUrl: string;
    termUrl?: string;
  };
}

export interface CheckoutFlowInfo {
  checkoutPageUrl: string;
  receiptPageUrl: string;
  cancelPageUrl: string;
  termUrl?: string;
  allowSeparateShippingAddress: boolean;
  customerType?: string;
  shippingTags?: string[];
  disablePaymentShippingOptions: boolean;
  additionalInfo?: {
    key: string;
    value: string;
  }[];
}

export interface Notification {
  orderConfirmedUrl: string;
}

export interface OrderCustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  customerType: string;
}
