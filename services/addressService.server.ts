import { gql } from '@apollo/client';
import 'server-only';
import { queryServer } from './dataService.server';

export const getAddressType = async () => {
  const data = await queryServer({
    query: GET_ADDRESSES_TYPE,
  });
  return data.customerAddressTypes;
};

const GET_ADDRESSES_TYPE = gql`
  query GetAddressType {
    customerAddressTypes {
      id
      name
    }
  }
`;
