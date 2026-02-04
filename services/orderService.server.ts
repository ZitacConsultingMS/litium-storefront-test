'use server';
import { gql } from '@apollo/client';
import { OrderRow } from 'models/order';
import { mutateServer } from './dataService.server';

export const approveOrderForOrganization = async function (orderId: string) {
  return await mutateServer({
    mutation: APPROVE_ORDER_ORGANIZATION,
    variables: {
      input: {
        orderId,
      },
    },
  });
};

const APPROVE_ORDER_ORGANIZATION = gql`
  mutation ($input: ApproveOrderForOrganizationInput!) {
    approveOrderForOrganization(input: $input) {
      boolean
      errors {
        ... on Forbidden {
          message
        }
        ... on Failure {
          message
          type
        }
      }
    }
  }
`;

export const repeatOrderForOrganization = async function (
  lineItems: OrderRow[]
) {
  for (const { articleNumber, quantity } of lineItems) {
    await mutateServer({
      mutation: ADD,
      variables: {
        input: {
          articleNumber,
          quantity,
        },
      },
    });
  }
};

const ADD = gql`
  mutation addVariantToCart($input: AddVariantToCartInput!) {
    addVariantToCart(input: $input) {
      cart {
        totalVat
      }
    }
  }
`;
