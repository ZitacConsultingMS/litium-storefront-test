import { gql } from '@apollo/client';
import OrderHistory from 'components/OrderHistory';
import { queryServer } from 'services/dataService.server';
import { PaginationOptions } from 'utils/constants';

export default async function B2COrderHistory(props: { params: Promise<any> }) {
  const params = await props.params;
  const result = await getOrders({ params });
  const orders = result.me.orders;
  return <OrderHistory {...orders} />;
}

async function getOrders({ params }: { params: any }) {
  return await queryServer({
    query: GET_ORDERS,
    variables: {
      first: PaginationOptions.OrderSize,
      after: '0',
    },
    url: params.slug?.join('/') ?? '/',
  });
}

const GET_ORDERS = gql`
  query GetOrders($first: Int, $after: String) {
    me {
      person {
        id
      }
      orders(first: $first, after: $after) {
        ...Order
      }
    }
  }
`;
