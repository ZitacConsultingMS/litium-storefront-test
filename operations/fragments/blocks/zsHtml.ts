import { gql } from '@apollo/client';

export const ZS_HTML_BLOCK_FRAGMENT = gql`
  fragment ZsHTMLBlock on ZsHTMLBlock {
    systemId
    fields {
      zsHTML
    }
  }
`;
