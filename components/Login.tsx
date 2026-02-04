'use client';
import { gql } from '@apollo/client';
import { signInUser } from 'app/actions/users/signInUser';
import clsx from 'clsx';
import { NavigationHistoryContext } from 'contexts/NavigationHistoryContext';
import { useTranslations } from 'hooks/useTranslations';
import {
  AuthenticationFailureType,
  SignInUserState,
} from 'models/authenticationFailureType';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Fragment,
  useActionState,
  useContext,
  useEffect,
  useState,
} from 'react';
import { queryClient } from 'services/dataService.client';
import { Button } from './elements/Button';
import { Heading1 } from './elements/Heading';
import { HtmlText } from './elements/HtmlText';
import { InputText } from './elements/Input';
import { InputPassword } from './elements/InputPassword';
import ErrorText, { ErrorField } from './form/ErrorText';

/**
 * Render login form.
 */
export default function Login({ myPagesPageUrl }: { myPagesPageUrl: string }) {
  const { history } = useContext(NavigationHistoryContext);
  const searchParams = useSearchParams();
  const initialState: SignInUserState = {};
  const pathname = usePathname();
  const [content, setContent] = useState('');
  const [changePasswordStep, setChangePasswordStep] = useState(false);
  const t = useTranslations();
  const getReferrerUrl = () => {
    if (!history || history.length < 2) {
      return null;
    }
    return history[history.length - 2] !== pathname
      ? history[history.length - 2]
      : null;
  };
  const signInUserAction = signInUser.bind(
    null,
    pathname,
    searchParams.get('redirectUrl') || getReferrerUrl() || myPagesPageUrl
  );
  const [state, formAction] = useActionState(signInUserAction, initialState);

  const getGeneralError = (errors: ErrorField | ErrorField[]) => {
    if (!Array.isArray(errors)) {
      if (errors?.type === AuthenticationFailureType.LOCKED_OUT) {
        errors.message = t('login.lockedouterror');
      } else if (errors?.type === AuthenticationFailureType.FAILURE) {
        errors.message = t('login.invalidusernameorpassword');
      } else if (
        errors?.type === AuthenticationFailureType.REQUIRES_CHANGED_PASSWORD &&
        !changePasswordStep
      ) {
        errors.message = '';
      }
    }
    return errors;
  };

  useEffect(() => {
    const fetchInfoChangePasswordView = async () => {
      const data = await queryClient({
        query: GET_CONTENT,
      });
      setContent(data.content?.fields?.newPassword);
    };

    if (state.requiresChangePassword) {
      setChangePasswordStep(true);
      fetchInfoChangePasswordView();
    }
  }, [state.requiresChangePassword]);

  return (
    <div className="container mx-auto px-5">
      <Heading1 className="mt-10 text-center">
        {!changePasswordStep ? t('login.title') : t('login.changepassword')}
      </Heading1>
      <form
        className={'mb-2 mt-12 flex w-full flex-col gap-5'}
        name="login"
        action={formAction}
      >
        <div
          className={clsx(
            'flex flex-col gap-5',
            changePasswordStep && 'hidden'
          )}
        >
          <LoginForm />
        </div>
        <div
          className={clsx(
            'flex flex-col gap-5',
            !changePasswordStep && 'hidden'
          )}
        >
          <ChangePasswordForm html={content} required={changePasswordStep} />
        </div>
        <Button
          type="submit"
          rounded={true}
          className="p-4 text-sm"
          data-testid="login-form__submit"
        >
          {!changePasswordStep
            ? t('login.loginbuttontext')
            : t('login.changepassword')}
        </Button>
      </form>
      {!!state.errors && (
        <ErrorText
          errors={getGeneralError(state.errors)}
          className="py-2 text-base"
        ></ErrorText>
      )}
    </div>
  );
}

const GET_CONTENT = gql`
  query GetLoginPage {
    content {
      ... on LoginPage {
        id
        fields {
          newPassword
        }
      }
    }
  }
`;

/**
 * Render a login form.
 * @returns
 */
const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState({
    username: '',
    password: '',
  });
  const t = useTranslations();

  return (
    <Fragment>
      <div data-testid="login-form">
        <InputText
          id="username"
          name="username"
          placeholder={t('login.username')}
          data-testid="login-form__username"
          value={username}
          onChange={(value: any) => {
            setValidationError((prevState) => ({
              ...prevState,
              username: '',
            }));
            setUsername(value);
          }}
          onInvalid={(e) => {
            e.preventDefault();
            setValidationError((prevState) => ({
              ...prevState,
              username: t('form.required'),
            }));
          }}
          required
          aria-describedby={
            validationError?.username ? 'login-form__username-error' : undefined
          }
          aria-invalid={validationError?.username ? 'true' : 'false'}
        />
        {validationError?.username && (
          <ErrorText
            id="login-form__username-error"
            className="mt-2"
            errors={{ message: validationError?.username }}
          ></ErrorText>
        )}
      </div>
      <div>
        <InputPassword
          id="password"
          placeholder={t('login.password')}
          data-testid="login-form__password"
          value={password}
          onChange={(value: any) => {
            setValidationError((prevState) => ({
              ...prevState,
              password: '',
            }));
            setPassword(value);
          }}
          onInvalid={(e) => {
            e.preventDefault();
            setValidationError((prevState) => ({
              ...prevState,
              password: t('form.required'),
            }));
          }}
          required
          aria-describedby={
            validationError?.password ? 'login-form__password-error' : undefined
          }
          aria-invalid={validationError?.password ? 'true' : 'false'}
        />
        {validationError?.password && (
          <ErrorText
            id="login-form__password-error"
            className="mt-2"
            errors={{ message: validationError?.password }}
          ></ErrorText>
        )}
      </div>
    </Fragment>
  );
};

/**
 * Render a change password form.
 * @param html an HTML snippet.
 * @param required a flag to determine if the password field is required or not.
 * @returns
 */
const ChangePasswordForm = ({
  html,
  required,
}: {
  html: string;
  required: boolean;
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [validationError, setValidationError] = useState({
    newPassword: '',
  });
  const t = useTranslations();

  return (
    <Fragment>
      {!!html && (
        <HtmlText
          className="text-sm"
          data-testid="login-form__new-password-info"
          innerHTML={html}
        ></HtmlText>
      )}
      <div>
        <InputPassword
          id="newPassword"
          placeholder={t('login.newpassword')}
          data-testid="login-form__new-password"
          value={newPassword}
          onChange={(value: any) => {
            setValidationError((prevState) => ({
              ...prevState,
              newPassword: '',
            }));
            setNewPassword(value);
          }}
          onInvalid={(e) => {
            e.preventDefault();
            setValidationError((prevState) => ({
              ...prevState,
              newPassword: t('form.required'),
            }));
          }}
          required={required}
          aria-describedby={
            validationError?.newPassword
              ? 'login-form__new-password-error'
              : undefined
          }
          aria-invalid={validationError?.newPassword ? 'true' : 'false'}
        />
        {validationError?.newPassword && (
          <ErrorText
            id="login-form__new-password-error"
            className="mt-2"
            errors={{ message: t('form.required') }}
          ></ErrorText>
        )}
      </div>
    </Fragment>
  );
};
