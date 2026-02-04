import { gql } from '@apollo/client';

export const ZS_HELLORETAIL_RECOMMENDATIONS_BLOCK_FRAGMENT = gql`
  fragment ZsHelloRetailRecommendationsBlock on ZsHelloRetailRecommendationsBlock {
    systemId
    fields {
      title
      zsHelloRetailRecomBoxId
    }
  }
`;
