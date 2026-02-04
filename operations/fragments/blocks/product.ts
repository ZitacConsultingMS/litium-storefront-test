import { gql } from '@apollo/client';

export const PRODUCTS_BLOCK_FRAGMENT = gql`
  fragment ProductsBlock on ProductsBlock {
    fields {
      title
      numberOfProducts
      sorting {
        value
      }
      category {
        id
      }
      productList {
        id
      }
    }
  }
`;
