import { gql } from '@apollo/client';
import { CustomerAddress, CustomerAddressType } from 'models/address';
import 'server-only';
import { setCookieFromResponse } from 'utils/cookies';
import { getAddressType } from './addressService.server';
import { mutateServer, queryServer } from './dataService.server';

export const selectOrganization = async function (
  organizationId: FormDataEntryValue | null
): Promise<void> {
  const result = await mutateServer({
    mutation: SELECT_ORGANIZATION,
    url: '/',
    variables: {
      input: {
        organizationId,
      },
    },
  });
  setCookieFromResponse(result);
};
const SELECT_ORGANIZATION = gql`
  mutation SelectOrganization($input: SelectUserOrganizationInput!) {
    selectUserOrganization(input: $input) {
      authentication {
        ... on AuthenticationCookie {
          cookieName
          issuedAt
          expiresIn
        }
      }
    }
  }
`;

type ManageAddressForOrganizationInput = {
  address: CustomerAddressInput;
  addressId?: string;
  organizationId?: string;
};
type CustomerAddressInput = {
  address1?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  addressTypeId?: string;
  phoneNumber?: string;
};

export const manageAddressForOrganization = async (
  formData: CustomerAddress
) => {
  const { address1, zipCode, city, country, phoneNumber } = formData;
  const input: ManageAddressForOrganizationInput = {
    address: {
      address1,
      zipCode,
      city,
      country,
      phoneNumber,
    },
  };
  if (formData.id) {
    input.addressId = formData.id;
  } else {
    const addressTypes: CustomerAddressType[] = await getAddressType();
    const defaultAddressTypeId = addressTypes?.filter(
      (address) => address.name === 'Address'
    )[0].id;
    input.address.addressTypeId = defaultAddressTypeId;
  }

  return await mutateServer({
    mutation: UPDATE_ORGANIZATION_ADDRESS,
    variables: {
      input,
    },
  });
};

const UPDATE_ORGANIZATION_ADDRESS = gql`
  mutation UpdateOrganizationAddress(
    $input: ManageAddressForOrganizationInput!
  ) {
    manageAddressForOrganization(input: $input) {
      errors {
        ... on Error {
          message
        }
      }
      customerAddress {
        address1
        city
        country
        id
        phoneNumber
        zipCode
      }
    }
  }
`;

export const getOrganizationAddresses = async function () {
  return await queryServer({
    query: GET_ORGANIZATION_ADDRESSES,
    url: '/',
  });
};

const GET_ORGANIZATION_ADDRESSES = gql`
  query GetOrganizationAddresses {
    me {
      person {
        id
      }
      selectedOrganization {
        organization {
          addresses {
            address1
            city
            country
            id
            zipCode
            phoneNumber
          }
          id
        }
        roleOperations {
          roleOperationId
        }
      }
    }
  }
`;
