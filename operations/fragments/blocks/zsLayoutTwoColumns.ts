import { gql } from '@apollo/client';

export const ZS_LAYOUT_TWOCOLUMNS_BLOCK_FRAGMENT = gql`
  fragment ZsLayoutTwoColumnsBlock on ZsLayoutTwoColumnsBlock {
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
      zsColumnDistribution {
        name
        value
     }
      zsFullWidth
    }
    children {
      ...ZsHTMLBlock
      ...ZsImageBlock
      ...ZsTextEditorBlock
      ...ZsFAQBlock
      ...ProductsBlock
    }
  }
`;
