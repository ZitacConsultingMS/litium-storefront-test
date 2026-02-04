import { gql } from '@apollo/client';

export const PRODUCT_FRAGMENT = gql`
  fragment Product on IProductItem {
    articleNumber
    id
    name
    description
    stockStatus {
      inStockQuantity
    }
    thumbnailImages: images(max: { height: 200, width: 200 }) {
      ...Image
    }
    largeImages: images(max: { height: 1200, width: 840 }) {
      ...Image
    }
    price {
      unitPriceIncludingVat
      unitPriceExcludingVat
      discountPriceIncludingVat
      discountPriceExcludingVat
    }
  }
`;
