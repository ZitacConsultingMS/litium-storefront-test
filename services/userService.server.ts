import { gql } from '@apollo/client';
import { CustomerAddress, CustomerAddressType } from 'models/address';
import { CurrentUser } from 'models/user';
import 'server-only';
import { getAddressType } from './addressService.server';
import { mutateServer, queryServer } from './dataService.server';

const GET_B2B_BLOCKED_STATUS = gql`
  query GetB2BBlockedStatus {
    me {
      selectedOrganization {
        organization {
          ... on OrganizationTemplateOrganization {
            fields {
              blockedForOrderB2b
            }
          }
        }
      }
      person {
        organizations {
          nodes {
            organization {
              ... on OrganizationTemplateOrganization {
                fields {
                  blockedForOrderB2b
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Returns whether the current user's org is blocked from B2B orders.
 * @param storefrontPath URL path for the storefront (used for channel/context).
 * @returns { blocked, nodesCount } for the API route.
 */
export async function getB2BBlockedStatus(storefrontPath: string): Promise<{
  blocked: boolean;
  nodesCount: number;
}> {
  const result = await queryServer({
    query: GET_B2B_BLOCKED_STATUS,
    url: storefrontPath,
  });
  const me = result?.me;
  const isBlocked = (v: unknown) => v === true || v === 'true';
  const nodes = me?.person?.organizations?.nodes ?? [];
  const blocked =
    isBlocked(me?.selectedOrganization?.organization?.fields?.blockedForOrderB2b) ||
    nodes.some((n: { organization?: { fields?: { blockedForOrderB2b?: unknown } } }) =>
      isBlocked(n?.organization?.fields?.blockedForOrderB2b)
    );
  return { blocked, nodesCount: nodes.length };
}

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
        customerNumber
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
        ... on B2BPersonTemplatePerson {
          fields {
            _firstName
            _lastName
          }
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
