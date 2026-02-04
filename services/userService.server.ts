import { gql } from '@apollo/client';
import { CustomerAddress, CustomerAddressType } from 'models/address';
import { CurrentUser } from 'models/user';
import 'server-only';
import { getAddressType } from './addressService.server';
import { mutateServer, queryServer } from './dataService.server';

/**
 * Gets current user object.
 * @returns user object.
 */
export async function get(): Promise<CurrentUser> {
  const content = await queryServer({
    query: GET_CURRENT_USER,
    url: '/',
  });
  const { me } = content;
  return me;
}
const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      selectedOrganization {
        organization {
          id
        }
      }
      person {
        id
        organizations {
          nodes {
            organization {
              id
              ... on OrganizationTemplateOrganization {
                fields {
                  _nameInvariantCulture
                }
              }
            }
          }
          totalCount
        }
      }
    }
  }
`;

export const getUserAddresses = async function () {
  return await queryServer({
    query: GET_ADDRESSES,
    url: '/',
  });
};

const GET_ADDRESSES = gql`
  query GetUserAddresses {
    me {
      person {
        id
        addresses {
          id
          address1
          city
          country
          phoneNumber
          zipCode
        }
      }
    }
  }
`;

type ManageAddressForPersonInput = {
  address: CustomerAddressInput;
  addressId?: string;
  personId?: string;
};
type CustomerAddressInput = {
  address1?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  addressTypeId?: string;
  phoneNumber?: string;
};

export const manageAddressForPerson = async (formData: CustomerAddress) => {
  const { address1, zipCode, city, country, phoneNumber } = formData;
  const input: ManageAddressForPersonInput = {
    address: {
      address1,
      zipCode,
      city,
      country,
      phoneNumber,
    },
  };
  if (!formData?.id) {
    const addressTypes: CustomerAddressType[] = await getAddressType();
    const defaultAddressTypeId = addressTypes?.filter(
      (address) => address.name === 'Address'
    )[0].id;
    input.address.addressTypeId = defaultAddressTypeId;
  } else {
    input.addressId = formData.id;
  }

  return await mutateServer({
    mutation: UPDATE_USER_ADDRESS,
    variables: {
      input,
    },
  });
};

const UPDATE_USER_ADDRESS = gql`
  mutation UpdateUserAddress($input: ManageAddressForPersonInput!) {
    manageAddressForPerson(input: $input) {
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

export const updateProfilePerson = async (input: any) => {
  const result = await mutateServer({
    mutation: UPDATE_PROFILE_PERSON,
    variables: {
      input,
    },
  });
  return result.updateFieldForPerson;
};

const UPDATE_PROFILE_PERSON = gql`
  mutation updateProfilePerson($input: UpdateFieldForPersonInput!) {
    updateFieldForPerson(input: $input) {
      errors {
        ... on Error {
          message
        }
      }
      person {
        id
        ... on B2BPersonTemplatePerson {
          fieldGroups {
            fieldGroupId
            name
            fields {
              __typename
              ...FieldValues
              fieldMetadata {
                ...FieldMetadatas
              }
            }
          }
        }
        ... on B2CPersonTemplatePerson {
          fieldGroups {
            fieldGroupId
            name
            fields {
              __typename
              ...FieldValues
              fieldMetadata {
                ...FieldMetadatas
              }
            }
          }
        }
      }
    }
  }
`;

export const changeMyEmail = async (input: any) => {
  return (
    await mutateServer({
      mutation: CHANGE_MY_EMAIL,
      variables: {
        input,
      },
    })
  ).changeMyEmail;
};

const CHANGE_MY_EMAIL = gql`
  mutation ChangeMyEmail($input: ChangeMyEmailInput!) {
    changeMyEmail(input: $input) {
      errors {
        ... on Error {
          message
        }
        ... on Failure {
          type
          message
        }
      }
    }
  }
`;

export const changeMyPassword = async (input: any) => {
  return (
    await mutateServer({
      mutation: CHANGE_MY_PASSWORD,
      variables: {
        input,
      },
    })
  ).changeMyPassword;
};

const CHANGE_MY_PASSWORD = gql`
  mutation ChangeMyPassword($input: ChangeMyPasswordInput!) {
    changeMyPassword(input: $input) {
      errors {
        ... on Error {
          message
        }
        ... on Failure {
          type
          message
        }
      }
    }
  }
`;
