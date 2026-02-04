import { gql } from '@apollo/client';

export const ORDER_ADDRESS_FRAGMENT = gql`
  fragment OrderAddress on OrderAddress {
    address1
    zipCode
    city
    country
    email
    firstName
    lastName
    organizationName
    phoneNumber
  }
`;
export const CHECKOUT_FRAGMENT = gql`
  fragment Checkout on Checkout {
    shippingAddress {
      ...OrderAddress
    }
    shippingOptions {
      id
      name
      price
      selected
      description
      integrationType
    }
    billingAddress {
      ...OrderAddress
    }
    paymentOptions {
      id
      name
      price
      selected
      description
      integrationType
    }
    paymentHtmlSnippet
    shipmentHtmlSnippet
    checkoutFlowInfo {
      receiptPageUrl
      termUrl
    }
  }
`;
