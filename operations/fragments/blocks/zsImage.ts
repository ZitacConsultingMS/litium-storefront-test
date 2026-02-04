import { gql } from '@apollo/client';

export const ZS_IMAGE_BLOCK_FRAGMENT = gql`
  fragment ZsImageBlock on ZsImageBlock {
    systemId
    fields {
      blockImagePointer {
       item {
          alt
          url
          ...Image
        }
      }
    }
  }
`;
