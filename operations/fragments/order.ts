import { gql } from '@apollo/client';

export const ORDER_FRAGMENT = gql`
  fragment Order on OrderConnection {
    totalCount
    nodes {
      orderNumber
      grandTotal
      status
      orderDate
      tags
      id
      rows {
        rowType
        articleNumber
        quantity
      }
    }
    pageInfo {
      hasNextPage
    }
  }
`;
