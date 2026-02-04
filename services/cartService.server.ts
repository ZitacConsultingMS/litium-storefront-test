import { Cart } from 'models/cart';
import 'server-only';
import { GET_CART } from './cartService.client';
import { queryServer } from './dataService.server';

/**
 * Gets shopping cart.
 * @returns an cart object.
 */
export async function get(): Promise<Cart> {
  const data = await queryServer({
    query: GET_CART,
  });
  return data.cart;
}
