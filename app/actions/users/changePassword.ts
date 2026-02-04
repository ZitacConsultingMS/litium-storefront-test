'use server';
import { changeMyPassword } from 'services/userService.server';
import { convertYupErrorsIntoErrorFields } from 'utils/error';
import { getHost } from 'utils/headers';
import * as yup from 'yup';

export const changePassword = async function (
  data: any,
  pathname: string
): Promise<any> {
  const schemaChangePassword = yup.object({
    currentPassword: yup.string().required(),
    newPassword: yup.string().required(),
  });
  try {
    const host = await getHost();
    await schemaChangePassword.validate(data, { abortEarly: false });
    const notificationUrl = `${host}/api/email/sendEmailAccountChanged${pathname}`;
    const input = {
      currentPassword: data.currentPassword,
      password: data.newPassword,
      notificationUrl,
    };
    const result = await changeMyPassword(input);
    return result;
  } catch (errors: any) {
    if (!Array.isArray(errors) && errors.name === 'ValidationError') {
      return { errors: convertYupErrorsIntoErrorFields(errors) };
    }
    return { errors };
  }
};
