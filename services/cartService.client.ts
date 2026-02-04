import { gql } from '@apollo/client';
import { Cart } from 'models/cart';
import { mutateClient, queryClient } from './dataService.client';

/**
 * Add a `quantity` number of `articleNumber` to cart.
 * @param articleNumber article number to add to cart.
 * @param quantity quantity number, default is one.
 * @returns an updated cart object.
 */
export async function add(articleNumber: string, quantity = 1): Promise<Cart> {
  const data = await mutateClient({
    mutation: ADD,
    variables: {
      input: {
        articleNumber,
        quantity: +quantity,
      },
    },
  });
  return data.addVariantToCart.cart;
}

const ADD = gql`
  mutation addVariantToCart($input: AddVariantToCartInput!) {
    addVariantToCart(input: $input) {
      cart {
        ...Cart
      }
    }
  }
`;

/**
 * Remove an item from cart.
 * @param rowId rowId to remove an item from cart.
 * @returns an updated cart object.
 */
export async function remove(rowId: string): Promise<Cart> {
  const data = await mutateClient({
    mutation: REMOVE,
    variables: {
      input: {
        rowId: rowId,
      },
    },
  });
  return data.removeVariantFromCart.cart;
}

const REMOVE = gql`
  mutation removeVariantFromCart($input: RemoveVariantFromCartInput!) {
    removeVariantFromCart(input: $input) {
      cart {
        ...Cart
      }
    }
  }
`;

/**
 *Update a `quantity` number of item to cart.
 * @param rowId rowId to update an item in cart.
 * @param quantity quantity number.
 * @returns an updated cart object.
 */
export async function update(rowId: string, quantity: number): Promise<Cart> {
  const data = await mutateClient({
    mutation: UPDATE,
    variables: {
      input: {
        rowId: rowId,
        quantity: +quantity,
      },
    },
  });
  return data.updateVariantInCart.cart;
}

const UPDATE = gql`
  mutation updateVariantInCart($input: UpdateVariantInCartInput!) {
    updateVariantInCart(input: $input) {
      cart {
        ...Cart
      }
    }
  }
`;

/**
 * Add discount codes to cart.
 * @param codes an array of discount codes.
 * @returns an updated cart object.
 */
export async function addDiscountCodes(codes: string[]): Promise<Cart> {
  const data = await mutateClient({
    mutation: ADD_DISCOUNT_CODES,
    variables: {
      input: {
        codes,
      },
    },
  });
  return data.addDiscountCodesToCart.cart;
}

const ADD_DISCOUNT_CODES = gql`
  mutation addDiscountCodesToCart($input: AddDiscountCodesToCartInput!) {
    addDiscountCodesToCart(input: $input) {
      cart {
        ...Cart
      }
    }
  }
`;

/**
 * Remove discount codes from cart.
 * @param codes an array of discount codes.
 * @returns an updated cart object.
 */
export async function removeDiscountCodes(codes: string[]): Promise<Cart> {
  const data = await mutateClient({
    mutation: REMOVE_DISCOUNT_CODES,
    variables: {
      input: {
        codes,
      },
    },
  });
  return data.removeDiscountCodesFromCart.cart;
}

const REMOVE_DISCOUNT_CODES = gql`
  mutation removeDiscountCodesFromCart(
    $input: RemoveDiscountCodesFromCartInput!
  ) {
    removeDiscountCodesFromCart(input: $input) {
      cart {
        ...Cart
      }
    }
  }
`;

/**
 * Gets shopping cart.
 * @returns an cart object.
 */
export async function get(): Promise<Cart> {
  const data = await queryClient({
    query: GET_CART,
    fetchPolicy: 'network-only', // Doesn't check cache before making a network request
  });
  return data.cart;
}

export const GET_CART = gql`
  query GetCart {
    cart {
      ...Cart
    }
  }
`;
