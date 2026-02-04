'use client';
import { yupResolver } from '@hookform/resolvers/yup';
import { changeMyEmailVerification } from 'app/actions/changeMyEmailVerification';
import { changeEmail } from 'app/actions/users/changeEmail';
import { changePassword } from 'app/actions/users/changePassword';
import { useTranslations } from 'hooks/useTranslations';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Button } from './elements/Button';
import { Text } from './elements/Text';
import ErrorText from './form/ErrorText';
import InputField from './form/InputField';
import PasswordField from './form/PasswordField';

export default function LoginDetails({ email }: { email: string | null }) {
  return (
    <div className="w-full md:w-[530px]">
      <EmailDetailsForm email={email}></EmailDetailsForm>
      <PasswordDetailsForm />
    </div>
  );
}

const EmailDetailsForm = ({ email }: { email: string | null }) => {
  const [verificationCodeStep, setVerificationCodeStep] = useState(false);
  const [generalMessage, setGeneralMessage] = useState('');
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState([]);
  const t = useTranslations();
  const pathname = usePathname();
  interface ChangeEmailFormData {
    email: string;
    code?: string;
  }

  const schemaChangeEmail: yup.ObjectSchema<ChangeEmailFormData> = yup.object({
    email: yup
      .string()
      .email(() => t('form.email.not.valid'))
      .required(() => t('form.required')),
    code: !verificationCodeStep
      ? yup.string().optional()
      : yup.string().required(() => t('form.required')),
  });

  const { handleSubmit, control, reset } = useForm<ChangeEmailFormData>({
    resolver: yupResolver(schemaChangeEmail),
    defaultValues: {
      email: email ?? '',
      code: '',
    },
  });

  const onSubmit = async (data: any) => {
    setErrors([]);
    setGeneralMessage('');
    if (!verificationCodeStep) {
      const result = await changeMyEmailVerification(pathname, data.email);
      if (!result.errors?.length) {
        setToken(result.token);
        setVerificationCodeStep(true);
        setGeneralMessage(t('logindetails.emaildetails.verificationcode.sent'));
      } else {
        setErrors(result.errors);
      }
    } else {
      const result = await changeEmail(pathname, data.code, token);
      if (!result.errors?.length) {
        setVerificationCodeStep(false);
        setGeneralMessage(t('logindetails.emaildetails.success'));
        reset({ email: data.email, code: '' });
      } else {
        if (result.errors[0].type === 'verification_token') {
          result.errors[0].message = t('logindetails.emaildetails.wrongcode');
        } else if (result.errors[0].type === 'account_exists') {
          result.errors[0].message = t(
            'logindetails.emaildetails.accountexists'
          );
        }
        setErrors(result.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div
        className={verificationCodeStep ? 'hidden' : 'block'}
        data-testid="email-details__email-container"
      >
        <InputField
          control={control}
          name="email"
          placeholder={t('logindetails.email')}
          data-testid="email-details__email-field"
        />
      </div>
      <div
        className={!verificationCodeStep ? 'hidden' : 'block'}
        data-testid="email-details__code-container"
      >
        <InputField
          control={control}
          name="code"
          placeholder={t('logindetails.code')}
          data-testid="email-details__code-field"
        />
      </div>
      <Button
        type="submit"
        rounded={true}
        className="mt-5 w-full text-sm md:w-80"
        data-testid="email-details__submit"
      >
        {!verificationCodeStep
          ? t('logindetails.nextbuttontext')
          : t('logindetails.verifybuttontext')}
      </Button>
      {!!generalMessage && (
        <Text
          className="mt-2 text-sm"
          data-testid="email-details__general-message"
        >
          {generalMessage}
        </Text>
      )}
      {!!errors.length && (
        <ErrorText className="mt-2 text-sm" errors={errors}></ErrorText>
      )}
    </form>
  );
};

const PasswordDetailsForm = () => {
  const t = useTranslations();
  const [errors, setErrors] = useState([]);
  const schemaChangePassword = yup.object({
    currentPassword: yup.string().required(() => t('form.required')),
    newPassword: yup.string().required(() => t('form.required')),
  });
  type ChangePasswordFormData = yup.InferType<typeof schemaChangePassword>;
  const { handleSubmit, control, reset } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(schemaChangePassword),
    defaultValues: { currentPassword: '', newPassword: '' },
  });
  const pathname = usePathname();
  let hasError = false;

  const onSubmit = async (data: any) => {
    setErrors([]);
    const result = await changePassword(data, pathname);
    if (!result.errors?.length) {
      reset();
    } else {
      if (result.errors[0].type === 'password_missmatch') {
        result.errors[0].message = t(
          'logindetails.passworddetails.wrongcurrentpassword'
        );
      } else if (result.errors[0].type === 'password_complexity') {
        result.errors[0].message = t(
          'logindetails.passworddetails.wrongpasswordcomplexity'
        );
      }
      setErrors(result.errors);
      hasError = true;
    }
  };

  const onErrorSubmit = async () => {
    hasError = true;
  };

  const updatePassword = async (updatePasswordHandler: any) => {
    try {
      await updatePasswordHandler();
      return !hasError;
    } catch (error) {
      return false;
    }
  };

  return (
    <form className="mt-16 flex flex-col" onSubmit={(e) => e.preventDefault()}>
      <div className="mb-3">
        <PasswordField
          control={control}
          name="currentPassword"
          placeholder={t('logindetails.currentPassword')}
          data-testid="password-details__current-password"
        />
      </div>
      <div className="mb-3">
        <PasswordField
          control={control}
          name="newPassword"
          placeholder={t('logindetails.newPassword')}
          data-testid="password-details__new-password"
        />
      </div>
      <Button
        className="w-full p-4 text-sm md:w-80"
        rounded={true}
        type="submit"
        data-testid="password-details__submit"
        successLabel={'logindetails.button.saved'}
        reactive={true}
        onClick={() => updatePassword(handleSubmit(onSubmit, onErrorSubmit))}
      >
        {t('logindetails.button.save')}
      </Button>
      {!!errors.length && (
        <ErrorText className="mt-2 text-sm" errors={errors}></ErrorText>
      )}
    </form>
  );
};
