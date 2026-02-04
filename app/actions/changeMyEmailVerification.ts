'use server';
import { gql } from '@apollo/client';
import { mutateServer } from 'services/dataService.server';
import { convertYupErrorsIntoErrorFields } from 'utils/error';
import { getHost } from 'utils/headers';
import * as yup from 'yup';

/**
 * Send verification code to change user's email.
 *
 * This function will call the changeMyEmailVerification mutation from the GraphQL server.
 * The server will generate a verification code.
 * Then using notification URL string getting from mutation to call API route from front-end
 * for sending email within verification code.
 *
 * @param pathname a pathname of content page url. Using for translating texts
 * @param email an user's new email address.
 * @returns.
 */
export const changeMyEmailVerification = async function (
  pathname: string,
  email: string
): Promise<any> {
  const schemaChangeEmail = yup.object({
    email: yup.string().email().required(),
  });

  try {
    await schemaChangeEmail.validate({ email }, { abortEarly: false });
    const host = await getHost();
    const notificationUrl = `${host}/api/email/sendVerificationCode${pathname}`;

    const result = (
      await mutateServer({
        mutation: VERIFY_MY_EMAIL,
        variables: {
          input: {
            email,
            notificationUrl,
          },
        },
      })
    ).changeMyEmailVerification;

    return result;
  } catch (errors: any) {
    if (!Array.isArray(errors) && errors.name === 'ValidationError') {
      return { errors: convertYupErrorsIntoErrorFields(errors) };
    }
    return { errors };
  }
};

const VERIFY_MY_EMAIL = gql`
  mutation VerifyMyEmail($input: ChangeMyEmailVerificationInput!) {
    changeMyEmailVerification(input: $input) {
      token
      errors {
        ... on Error {
          message
        }
      }
    }
  }
`;
