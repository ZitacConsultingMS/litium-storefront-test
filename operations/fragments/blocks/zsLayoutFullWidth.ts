import { gql } from '@apollo/client';

export const ZS_LAYOUT_FULLWIDTH_BLOCK_FRAGMENT = gql`
  fragment ZsLayoutFullWidthBlock on ZsLayoutFullWidthBlock {
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
    }
    children {
      ...ZsHTMLBlock
      ...ZsImageBlock
      ...ZsTextEditorBlock
      ...ZsFAQBlock
      ...ZsBannerBlock
    }
  }
`;
