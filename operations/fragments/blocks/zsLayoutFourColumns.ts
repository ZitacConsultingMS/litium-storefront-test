import { gql } from '@apollo/client';

export const ZS_LAYOUT_FOURCOLUMNS_BLOCK_FRAGMENT = gql`
  fragment ZsLayoutFourColumnsBlock on ZsLayoutFourColumnsBlock {
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
