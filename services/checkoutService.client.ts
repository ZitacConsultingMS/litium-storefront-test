import { gql } from '@apollo/client';
import { OrderAddress } from 'models/address';
import {
  Checkout,
  CheckoutFlowInfo,
  Notification,
  OrderCustomerDetails,
} from 'models/checkout';
import { mutateClient } from './dataService.client';

/**
 *Create a checkout session.
 * @param checkoutFlowInfo an initial data to create.
 * @param notifications notification callback url
 * @returns an created checkout flow information object.
 */
export async function createCheckoutSession(
  checkoutFlowInfo: CheckoutFlowInfo,
  notifications: Notification
): Promise<Checkout> {
  const data = await mutateClient({
    mutation: CREATE,
    variables: {
      input: { checkoutFlowInfo, notifications },
    },
  });
  return data.createCheckoutSession.checkout;
}

const CREATE = gql`
  mutation createCheckoutSession($input: CreateCheckoutSessionInput!) {
    createCheckoutSession(input: $input) {
      checkout {
        ...Checkout
      }
    }
  }
`;

/**
 * Updates delivery address.
 * @param shippingAddress shipping address to update in cart.
 * @returns an updated checkout object.
 */
export async function updateShippingAddress(
  shippingAddress: OrderAddress
): Promise<Checkout> {
  const data = await mutateClient({
    mutation: UPDATE_CHECKOUT_DETAILS,
    variables: {
      input: { shippingAddress },
    },
  });
  return data.updateCheckoutDetails.checkout;
}

/**
 * Updates billing address.
 * @param billingAddress billing address to update in cart.
 * @returns an updated checkout object.
 */
export async function updateBillingAddress(
  billingAddress: OrderAddress
): Promise<Checkout> {
  const data = await mutateClient({
    mutation: UPDATE_CHECKOUT_DETAILS,
    variables: {
      input: { billingAddress },
    },
  });
  return data.updateCheckoutDetails.checkout;
}

const UPDATE_CHECKOUT_DETAILS = gql`
  mutation updateCheckoutDetails($input: UpdateCheckoutDetailsInput!) {
    updateCheckoutDetails(input: $input) {
      checkout {
        ...Checkout
      }
    }
  }
`;

/**
 *Update a checkout option in the checkout.
 * @param checkoutOption contain shippingOptionId or paymentOptionId.
 * @returns an updated checkout object.
 */
export async function updateCheckoutOptions(checkoutOption: {
  paymentOptionId?: string;
  shippingOptionId?: string;
}): Promise<Checkout> {
  const data = await mutateClient({
    mutation: UPDATE_CHECKOUT_OPTION,
    variables: {
      input: {
        ...checkoutOption,
      },
    },
  });
  return data.updateCheckoutOptions.checkout;
}

const UPDATE_CHECKOUT_OPTION = gql`
  mutation updateCheckoutOptions($input: UpdateCheckoutOptionsInput!) {
    updateCheckoutOptions(input: $input) {
      checkout {
        ...Checkout
      }
    }
  }
`;

export async function placeOrder() {
  return await mutateClient({
    mutation: PLACE_ORDER,
  });
}

const PLACE_ORDER = gql`
  mutation placeOrder {
    placeOrder {
      __typename
      errors {
        ... on ValidationError {
          message
        }
      }
    }
  }
`;

/**
 * Updates both delivery address and billing address.
 * @param addresses contains shippingAddress and billAddress to update in cart
 * @returns an updated checkout object.
 */
export async function updateAddresses(addresses: {
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  customerDetails: OrderCustomerDetails;
}): Promise<Checkout> {
  const { shippingAddress, billingAddress, customerDetails } = addresses;
  const data = await mutateClient({
    mutation: UPDATE_CHECKOUT_DETAILS,
    variables: {
      input: { shippingAddress, billingAddress, customer: customerDetails },
    },
  });
  return data.updateCheckoutDetails.checkout;
}

/**
 * Updates shipment widget
 * @param shippingOptionId shipping option id
 * @returns an updated checkout object.
 */
export async function updateShippingWidget(shippingOptionId: string) {
  const data = await mutateClient({
    mutation: UPDATE_CHECKOUT_DETAILS,
    variables: {
      input: {
        shippingWidgetData: shippingOptionId,
      },
    },
  });
  return data.updateCheckoutDetails.checkout;
}

/**
 * Validate the cart before placing an order.
 * @returns an updated checkout object.
 */
export async function validateCart() {
  return await mutateClient({
    mutation: VALIDATE_CART,
    variables: {
      input: {
        includeDetails: true,
      },
    },
  });
}

const VALIDATE_CART = gql`
  mutation validateCart($input: ValidateCartInput!) {
    validateCart(input: $input) {
      validationError {
        message
      }
    }
  }
`;
