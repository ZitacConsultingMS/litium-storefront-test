'use server';
import { gql } from '@apollo/client';
import {
  AuthenticationFailureType,
  SignInUserState,
} from 'models/authenticationFailureType';
import { redirect } from 'next/navigation';
import { mutateServer } from 'services/dataService.server';
import { selectOrganization } from 'services/organizationService.server';
import { setCookieFromResponse } from 'utils/cookies';
import { convertYupErrorsIntoErrorFields } from 'utils/error';
import { getHost } from 'utils/headers';
import * as yup from 'yup';

/**
 * Sign in a user.
 * @param url a relative content url.
 * @param redirectUrl a url to redirect after signing in.
 * @param prevState contains the last recorded state of the user's input. Using for changing password case.
 * @param formData a sign in form data.
 * @returns a sign in user state object.
 */

export const signInUser = async function (
  url: string,
  redirectUrl: string,
  prevState: SignInUserState | undefined,
  formData: FormData
): Promise<SignInUserState> {
  const signInSchema = yup.object({
    username: yup.string().required(),
    password: yup.string().required(),
    newPassword: prevState?.requiresChangePassword
      ? yup.string().required()
      : yup.string(),
  });

  const signInData = {
    username: formData.get('username'),
    password: formData.get('password'),
    newPassword: prevState?.requiresChangePassword
      ? formData.get('newPassword')
      : undefined,
    type: 'COOKIE',
  };

  try {
    await signInSchema.validate(signInData, { abortEarly: false });
  } catch (error: any) {
    return { errors: convertYupErrorsIntoErrorFields(error) };
  }

  const authenticationResult = await mutateServer({
    mutation: SIGN_IN_USER,
    url: url,
    variables: {
      input: signInData,
    },
  });

  const errors: Array<{ message: string; type: string }> =
    authenticationResult.signInUser?.errors;

  if (errors?.length > 0) {
    return {
      errors: errors[0],
      requiresChangePassword:
        errors[0].type ==
        AuthenticationFailureType.REQUIRES_CHANGED_PASSWORD.toString(),
    };
  }
  setCookieFromResponse(authenticationResult);
  // make sure first organization is selected
  const organizations =
    authenticationResult.signInUser.authentication.me.person.organizations;

  if (organizations?.nodes?.length > 0) {
    await selectOrganization(organizations.nodes[0].organization.id);
  }

  const to = new URL(url, await getHost());
  to.searchParams.append('redirectUrl', redirectUrl);
  redirect(to.href);
};

const SIGN_IN_USER = gql`
  mutation SignInUser($input: SignInUserInput!) {
    signInUser(input: $input) {
      authentication {
        ... on AuthenticationCookie {
          cookieName
          issuedAt
          expiresIn
          me {
            person {
              id
              organizations {
                nodes {
                  organization {
                    id
                  }
                }
              }
            }
          }
        }
      }
      errors {
        ... on AuthenticationFailure {
          message
          type
        }
        ... on Error {
          message
        }
      }
    }
  }
`;
