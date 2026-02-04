'use server';
import { gql } from '@apollo/client';
import { mutateServer } from 'services/dataService.server';
import { convertYupErrorsIntoErrorFields } from 'utils/error';
import { getHost } from 'utils/headers';
import * as yup from 'yup';

/**
 * Send verification code to reset user's password.
 *
 * This function will call the resetUserPasswordVerification mutation from the GraphQL server.
 * The server will generate a verification code.
 * Then using notification URL string getting from mutation to call API route from front-end
 * for sending email within verification code.
 *
 * @param pathname a pathname of content page url. Using for translating texts
 * @param username an user's username.
 * @returns.
 */
export const resetUserPasswordVerification = async function (
  pathname: string,
  username: string
): Promise<any> {
  const schemaResetUserPasswordVerification = yup.object({
    username: yup.string().required(),
  });

  try {
    await schemaResetUserPasswordVerification.validate(
      { username },
      { abortEarly: false }
    );
    const host = await getHost();
    const notificationUrl = `${host}/api/email/sendVerificationCode${pathname}`;

    const result = (
      await mutateServer({
        mutation: RESET_USER_PASSWORD_VERIFICATION,
        variables: {
          input: {
            login: username,
            notificationUrl,
          },
        },
      })
    ).resetUserPasswordVerification;

    return result;
  } catch (errors: any) {
    if (!Array.isArray(errors) && errors.name === 'ValidationError') {
      return { errors: convertYupErrorsIntoErrorFields(errors) };
    }
    return { errors };
  }
};

const RESET_USER_PASSWORD_VERIFICATION = gql`
  mutation ResetUserPasswordVerification(
    $input: ResetUserPasswordVerificationInput!
  ) {
    resetUserPasswordVerification(input: $input) {
      token
      errors {
        ... on Error {
          message
        }
      }
    }
  }
`;
