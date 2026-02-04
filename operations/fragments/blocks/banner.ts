import { gql } from '@apollo/client';

export const BANNER_BLOCK_FRAGMENT = gql`
  fragment BannerBlock on BannerBlock {
    fields {
      _name
      banners {
        linkText
        actionText
        blockImagePointer {
          item(max: { height: 800, width: 1600 }) {
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
            ... on ProductWithVariantsProduct {
              url
            }
            ... on ProductWithVariantsListProduct {
              url
            }
            ... on ProductWithVariantsFurnitureProduct {
              url
            }
          }
        }
      }
    }
  }
`;
