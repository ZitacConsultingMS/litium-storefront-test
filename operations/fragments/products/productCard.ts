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
    ... on ProductWithVariantsProduct {
      fields {
        brand {
          name
        }
      }
      url
    }
    ... on ProductWithVariantsListProduct {
      fields {
        brand {
          name
        }
      }
      url
    }
    ... on ProductWithVariantsFurnitureProduct {
      url
    }
  }
`;
