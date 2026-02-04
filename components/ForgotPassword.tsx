'use client';
import { yupResolver } from '@hookform/resolvers/yup';
import { resetUserPassword } from 'app/actions/users/resetUserPassword';
import { resetUserPasswordVerification } from 'app/actions/users/resetUserPasswordVerification';
import { useTranslations } from 'hooks/useTranslations';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Button } from './elements/Button';
import { Heading1 } from './elements/Heading';
import { Text } from './elements/Text';
import ErrorText from './form/ErrorText';
import InputField from './form/InputField';
import PasswordField from './form/PasswordField';

export default function ForgotPassword({ onClose }: { onClose: () => void }) {
  const t = useTranslations();
  const [verificationCodeStep, setVerificationCodeStep] = useState(false);
  const [generalMessage, setGeneralMessage] = useState('');
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState([]);
  const pathname = usePathname();

  interface ForgotPasswordData {
    username: string;
    verificationCode?: string;
    newPassword?: string;
  }

  const schemaChangeEmail: yup.ObjectSchema<ForgotPasswordData> = yup.object({
    username: yup.string().required(() => t('form.required')),
    verificationCode: !verificationCodeStep
      ? yup.string().optional()
      : yup.string().required(() => t('form.required')),
    newPassword: !verificationCodeStep
      ? yup.string().optional()
      : yup.string().required(() => t('form.required')),
  });

  const { handleSubmit, control } = useForm<ForgotPasswordData>({
    resolver: yupResolver(schemaChangeEmail),
    defaultValues: {
      username: '',
      verificationCode: '',
      newPassword: '',
    },
  });

  const onSubmit = async (data: any) => {
    setErrors([]);
    setGeneralMessage('');
    if (!verificationCodeStep) {
      const result = await resetUserPasswordVerification(
        pathname,
        data.username
      );
      if (!result.errors?.length) {
        setToken(result.token);
        setVerificationCodeStep(true);
        setGeneralMessage(t('forgotpassword.verificationcode.sent'));
      } else {
        setErrors(result.errors);
      }
    } else {
      const result = await resetUserPassword(
        pathname,
        data.verificationCode,
        token,
        data.newPassword,
        data.username
      );
      if (!result.errors?.length) {
        // redirect to login form when the password was successfully reset.
        onClose();
      } else {
        switch (result.errors[0].type) {
          case 'verification_token':
            result.errors[0].message = t(
              'forgotpassword.verificationcode.wrongcode'
            );
            break;
          case 'expired_token':
            result.errors[0].message = t(
              'forgotpassword.verificationcode.expired'
            );
            break;
          case 'password_complexity':
            result.errors[0].message = t(
              'forgotpassword.verificationcode.passwordcomplexity'
            );
            break;
        }
        setErrors(result.errors);
      }
    }
  };

  return (
    <div className="container mx-auto px-5" data-testid="forgot-password">
      <Heading1 className="mt-10 text-center">
        {t('forgotpassword.title')}
      </Heading1>
      <form
        className={'mb-2 mt-12 flex w-full flex-col gap-5'}
        name="forgotPassword"
        onSubmit={handleSubmit(onSubmit)}
      >
        {!verificationCodeStep && (
          <>
            <p className="mt-0">{t('forgotpassword.description')}</p>
            <InputField
              control={control}
              name="username"
              placeholder={t('forgotpassword.username')}
              data-testid="forgot-password__username"
            />
          </>
        )}
        {verificationCodeStep && (
          <>
            <p className="m-0">
              {t('forgotpassword.verificationcode.description')}
            </p>
            <InputField
              control={control}
              name="verificationCode"
              placeholder={t('forgotpassword.verificationcode')}
              data-testid="forgot-password__verification-code"
            />
            <PasswordField
              control={control}
              name="newPassword"
              placeholder={t('forgotpassword.newpassword')}
              data-testid="forgot-password__new-password"
            />
          </>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            rounded={true}
            className="p-4 text-sm"
            data-testid="forgot-password__cancel"
            onClick={onClose}
          >
            {t('forgotpassword.button.cancel')}
          </Button>
          <Button
            type="submit"
            rounded={true}
            className="p-4 text-sm"
            data-testid="forgot-password__submit"
          >
            {t('forgotpassword.button.submit')}
          </Button>
        </div>
        {!!generalMessage && (
          <Text
            className="mt-2 text-sm"
            data-testid="forgot-password__general-message"
          >
            {generalMessage}
          </Text>
        )}
        {!!errors.length && (
          <ErrorText className="mt-2 text-sm" errors={errors}></ErrorText>
        )}
      </form>
    </div>
  );
}
