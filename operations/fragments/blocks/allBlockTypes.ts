import { gql } from '@apollo/client';
import { PRODUCTS_BLOCK_FRAGMENT } from './product';

export const ALL_BLOCK_TYPES_FRAGMENT = gql`
  fragment AllBlockTypes on IBlock {
    __typename
    ... on IBlockItem {
      systemId
    }

    ...BannerBlock
    ...ProductsBlock
  }

  ${PRODUCTS_BLOCK_FRAGMENT}
`;
