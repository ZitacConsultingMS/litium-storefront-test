import { gql } from '@apollo/client';

export const IMAGE_FRAGMENT = gql`
  fragment Image on IImageItem {
    dimension {
      height
      width
    }
    url
  }
`;
