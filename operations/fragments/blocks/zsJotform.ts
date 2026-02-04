import { gql } from '@apollo/client';

export const ZS_JOTFORM_BLOCK_FRAGMENT = gql`
  fragment ZsJotformBlock on ZsJotformBlock {
    systemId
    fields {
      zsJotformUrl
    }
  }
`;

