import { gql } from '@apollo/client';

export const ZS_FAQ_BLOCK_FRAGMENT = gql`
fragment ZsFAQBlock on ZsFAQBlock{
  fields{
    _name
    zsFAQ {
      zsFaqAnswer
      zsFaqQuestion
    }
  }
}
`;
