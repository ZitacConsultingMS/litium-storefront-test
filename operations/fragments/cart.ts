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
      additionalInfo {
        key
        value
      }
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
          ... on AllAttributesInListProduct {
            allFieldGroups: fieldGroups {
              fieldGroupId
              name
              fields {
                ...FieldValues
              }
            }
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
  }
`;
