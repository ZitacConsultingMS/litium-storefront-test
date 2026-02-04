import { gql } from '@apollo/client';

export const METADATA_FRAGMENT = gql`
  fragment Metadata on IContentItem {
    metadata {
      links {
        href
        attributes {
          name
          value
        }
      }
      tags {
        content
        name
      }
      title
    }
  }
`;
