'use server';

import { Cart } from 'models/cart';
import { OrderRow } from 'models/order';
import { get } from 'services/cartService.server';
import { repeatOrderForOrganization } from 'services/orderService.server';

export const repeatOrder = async function (
  lineItems: OrderRow[]
): Promise<Cart> {
  await repeatOrderForOrganization(lineItems);
  return await get();
};
