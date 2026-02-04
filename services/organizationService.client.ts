import { gql } from '@apollo/client';
import { mutateClient } from './dataService.client';

export const deleteOrganizationAddress = function (addressId: string) {
  return mutateClient({
    mutation: DELETE_ORGANIZATION_ADDRESS,
    variables: {
      input: {
        addressId,
      },
    },
  });
};

const DELETE_ORGANIZATION_ADDRESS = gql`
  mutation DeleteOrganizationAddress(
    $input: RemoveAddressFromOrganizationInput!
  ) {
    removeAddressFromOrganization(input: $input) {
      boolean
      errors {
        ... on Error {
          message
        }
      }
    }
  }
`;
