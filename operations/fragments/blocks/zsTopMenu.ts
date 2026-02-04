import { gql } from '@apollo/client';

export const ZS_TOPMENU_BLOCK_FRAGMENT = gql`
fragment ZsTopMenuBlock on ZsTopMenuBlock {
  systemId
  fields {
    zsLinks {
      navigationLink {
        text
        url
      }
    }
  }
}
`;
