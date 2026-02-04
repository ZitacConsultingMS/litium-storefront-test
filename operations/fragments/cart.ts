import { gql } from '@apollo/client';

export const CART_FRAGMENT = gql`
  fragment Cart on Cart {
    currency {
      code
      symbol
      symbolPosition
      minorUnits
    }
    discountInfos {
      discountType
      resultOrderRow {
        totalIncludingVat
        totalExcludingVat
        description
        rowId
      }
    }
    discountCodes
    productCount
    grandTotal
    totalVat
    showPricesIncludingVat
    rows {
      rowType
      rowId
      articleNumber
      quantity
      totalIncludingVat
      totalExcludingVat
      description
      product {
        id
        name
        smallImages: images(max: { height: 80, width: 80 }) {
          ...Image
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
  }
`;
