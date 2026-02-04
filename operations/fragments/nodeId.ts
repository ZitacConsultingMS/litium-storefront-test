import { gql } from '@apollo/client';

export const NODE_ID = gql`
  fragment Id on Node {
    id
  }
`;
