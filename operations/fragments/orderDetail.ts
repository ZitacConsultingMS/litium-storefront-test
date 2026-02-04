import { gql } from '@apollo/client';

export const ORDER_DETAIL_FRAGMENT = gql`
  fragment OrderDetail on Order {
    id
    orderDate
    totalFeesIncludingVat
    totalFeesExcludingVat
    shippingCostIncludingVat
    shippingCostExcludingVat
    tags
    currency {
      code
    }
    orderNumber
    shippingAddress {
      ...OrderAddress
    }
    discountInfos {
      discountType
      resultOrderRow {
        totalIncludingVat
        totalExcludingVat
      }
    }
    grandTotal
    totalVat
    rows {
      rowType
      rowId
      articleNumber
      quantity
      totalIncludingVat
      totalExcludingVat
      description
      product {
        ... on IContentItem {
          id
          url
        }
        ... on IProductItem {
          name
          smallImages: images(max: { height: 80, width: 80 }) {
            ...Image
          }
        }
      }
      discountInfos {
        discountType
        resultOrderRow {
          totalIncludingVat
          totalExcludingVat
        }
      }
    }
    status
  }
`;
