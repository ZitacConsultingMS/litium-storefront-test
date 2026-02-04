import { gql } from '@apollo/client';

export const ZS_BANNER_BLOCK_FRAGMENT = gql`
  fragment ZsBannerBlock on ZsBannerBlock {
    fields {
      _name
      zsBanner {
        linkText
        actionText
        zsTextEditor
        zsBannerImageHeight
        zsBackgroundPosition {
          name
          value
        }
        zsBackgroundBlur {
          name
          value
        }
        zsBannerTextShadow
        zsBannerTextColor {
          name
          value
        }
        blockImagePointer {
          item(max: { height: 1000, width: 1800 }) {
            ...Image
          }
        }
        bannerLinkToCategory {
          item {
            url
            id
          }
        }
        bannerLinkToPage {
          item {
            url
            id
          }
        }
        bannerLinkToProduct {
          item {
            id
            ... on AllAttributesInListProduct {
              url
            }
          }
        }
      }
    }
  }
`;
