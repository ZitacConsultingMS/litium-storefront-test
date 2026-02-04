'use server';

import { approveOrderForOrganization } from 'services/orderService.server';

export const approveOrder = async function (orderId: string) {
  return await approveOrderForOrganization(orderId);
};
