import { gql } from '@apollo/client';

export const ZS_TEXTEDITOR_BLOCK_FRAGMENT = gql`
  fragment ZsTextEditorBlock on ZsTextEditorBlock {
    systemId
    fields {
      zsTextEditor
    }
  }
`;
