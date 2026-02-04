import { gql } from '@apollo/client';
import OrderHistory from 'components/OrderHistory';
import { RoleOption } from 'models/option';
import { Fragment } from 'react';
import { queryServer } from 'services/dataService.server';
import { PaginationOptions, RoleType } from 'utils/constants';

export default async function B2BOrderHistory(props: { params: Promise<any> }) {
  const params = await props.params;
  const result = await getOrdersOrganization({ params });
  const orders = result.me.selectedOrganization?.organization.orders;
  const roleOperations = result.me.selectedOrganization?.roleOperations || [];

  if (!hasRoleType(roleOperations, RoleType.ReadOrder)) {
    return <Fragment></Fragment>;
  }

  return (
    <OrderHistory
      {...orders}
      showOrganizationOrders={true}
      hasApproveOrder={hasRoleType(roleOperations, RoleType.ApproveOrder)}
      hasPlaceOrder={hasRoleType(roleOperations, RoleType.PlaceOrder)}
    />
  );
}

function hasRoleType(options: RoleOption[], roleType: string) {
  return options.some((item) => item.roleOperationId === roleType);
}

async function getOrdersOrganization({ params }: { params: any }) {
  return await queryServer({
    query: GET_ORDERS_ORGANIZATION,
    variables: {
      first: PaginationOptions.OrderSize,
      after: '0',
    },
    url: params.slug?.join('/') ?? '/',
  });
}

const GET_ORDERS_ORGANIZATION = gql`
  query GetOrders($first: Int, $after: String) {
    me {
      person {
        id
      }
      selectedOrganization {
        organization {
          id
          orders(first: $first, after: $after) {
            ...Order
          }
        }
        roleOperations {
          name
          roleOperationId
        }
      }
    }
  }
`;
