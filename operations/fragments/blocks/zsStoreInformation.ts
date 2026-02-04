import { gql } from '@apollo/client';

export const ZS_STOREINFORMATION_BLOCK_FRAGMENT = gql`
  fragment ZsStoreInformationBlock on ZsStoreInformationBlock {
    fields {
      _name
      zsStoreID
    }
  }
`;
