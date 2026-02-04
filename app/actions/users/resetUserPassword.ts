'use server';
import { gql } from '@apollo/client';
import { mutateServer } from 'services/dataService.server';
import { convertYupErrorsIntoErrorFields } from 'utils/error';
import { getHost } from 'utils/headers';
import * as yup from 'yup';

/**
 * Reset user's password.
 *
 * This function will call the resetUserPassword mutation from the GraphQL server.
 * The server will verify code and token and update the new password for user.
 * Then using notification URL string getting from mutation to call API route from front-end for sending password changed email.
 *
 * @param pathname a pathname of content page url. Using for translating texts
 * @param code a verification code, getting from verification email.
 * @param token a token getting from resetUserPasswordVerification mutation.
 * @param newPassword a new password for user.
 * @param username an user's username.
 * @returns.
 */
export const resetUserPassword = async function (
  pathname: string,
  code: string,
  token: string,
  newPassword: string,
  username: string
) {
  const schemaResetUserPassword = yup.object({
    code: yup.string().required(),
    newPassword: yup.string().required(),
    username: yup.string().required(),
  });

  try {
    await schemaResetUserPassword.validate(
      { code, newPassword, username },
      { abortEarly: false }
    );
    const host = await getHost();
    const notificationUrl = `${host}/api/email/sendEmailAccountChanged${pathname}`;
    const input = {
      token,
      verificationToken: code,
      notificationUrl,
      password: newPassword,
      login: username,
    };
    const result = (
      await mutateServer({
        mutation: RESET_USER_PASSWORD,
        variables: {
          input,
        },
      })
    ).resetUserPassword;

    return result;
  } catch (errors: any) {
    if (!Array.isArray(errors) && errors.name === 'ValidationError') {
      return { errors: convertYupErrorsIntoErrorFields(errors) };
    }
    return { errors };
  }
};

const RESET_USER_PASSWORD = gql`
  mutation ResetUserPassword($input: ResetUserPasswordInput!) {
    resetUserPassword(input: $input) {
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
