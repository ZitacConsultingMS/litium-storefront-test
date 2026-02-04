import { gql } from '@apollo/client';

export const PRODUCT_CARD_FRAGMENT = gql`
  fragment ProductCard on IProductItem {
    id
    articleNumber
    name
    isVariant
    mediumImages: images(max: { height: 600, width: 420 }) {
      ...Image
    }
    price {
      unitPriceIncludingVat
      unitPriceExcludingVat
      discountPriceIncludingVat
      discountPriceExcludingVat
    }
    ... on AllAttributesInListProduct {
      inStock
      stockStatus {
        inStockQuantity
      }
      url
      fields {
        bullets
      }
      artikelmedaljerFieldGroups: fieldGroups(filter: { id: { value: "Artikelmedaljer", operator: "eq" } }) {
        fieldGroupId
        name
        fields {
          name
          ... on ProductTagsProductFieldValues {
            productTagsProductFieldValues {
              productTagsTag {
                name
                value
              }
              productTagsFromDate
              productTagsToDate
            }
          }
        }
      }
      parent {
        ... on ICategoryItem {
          id
          name
          url
        }
      }
      parents(reverse: true) {
        nodes {
          ... on ICategoryItem {
            id
            name
            url
          }
        }
      }
    }
  }
`;
