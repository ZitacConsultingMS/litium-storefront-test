'use server';
import { changeMyEmail } from 'services/userService.server';
import { convertYupErrorsIntoErrorFields } from 'utils/error';
import { getHost } from 'utils/headers';
import * as yup from 'yup';

/**
 * Change user's email address.
 *
 * This function will call the changeMyEmail mutation from the GraphQL server.
 * The server will verify code and token and update the new email for user.
 * Then using notification URL string getting from mutation to call API route from front-end for sending account changed email.
 *
 * @param pathname a pathname of content page url. Using for translating texts
 * @param code a verification code, getting from verification email.
 * @param token a token getting from changeMyEmailVerification mutation.
 * @returns.
 */
export const changeEmail = async function (
  pathname: string,
  code: string,
  token: string
) {
  const schemaChangeEmail = yup.object({
    code: yup.string().required(),
  });

  try {
    await schemaChangeEmail.validate({ code }, { abortEarly: false });
    const host = await getHost();
    const notificationUrl = `${host}/api/email/sendEmailAccountChanged${pathname}`;
    const input = {
      token,
      verificationToken: code,
      notificationUrl,
    };
    const result = await changeMyEmail(input);

    return result;
  } catch (errors: any) {
    if (!Array.isArray(errors) && errors.name === 'ValidationError') {
      return { errors: convertYupErrorsIntoErrorFields(errors) };
    }
    return { errors };
  }
};
