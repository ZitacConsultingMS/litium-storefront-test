import { gql } from '@apollo/client';

export const ZS_LAYOUT_THREECOLUMNS_BLOCK_FRAGMENT = gql`
  fragment ZsLayoutThreeColumnsBlock on ZsLayoutThreeColumnsBlock {
    fields {
      zsBackgroundColor {
        name
        value
       }
      zsBackgroundImage {
        item {
          url
          ...Image
        }
      }
      zsAlignItems {
        name
        value
      }
    }
    children {
      ...ZsHTMLBlock
      ...ZsImageBlock
      ...ZsTextEditorBlock
      ...ZsFAQBlock
    }
  }
`;
