import { gql } from '@apollo/client';

export const ZS_TOPBAR_BLOCK_FRAGMENT = gql`
fragment ZsTopBarBlock on ZsTopBarBlock {
  fields{
    zsTextEditor
    zsUSP {
      blockText
    }
  }
}
`;
