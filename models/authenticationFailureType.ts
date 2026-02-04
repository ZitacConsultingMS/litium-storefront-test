import { ErrorField } from 'components/form/ErrorText';

export enum AuthenticationFailureType {
  FAILURE = 'FAILURE',
  LOCKED_OUT = 'LOCKED_OUT',
  PASSWORD_COMPLEXITY = 'PASSWORD_COMPLEXITY',
  REQUIRES_CHANGED_PASSWORD = 'REQUIRES_CHANGED_PASSWORD',
  AUTH_NOT_AUTHORIZED = 'AUTH_NOT_AUTHORIZED',
}

export type SignInUserState = {
  errors?: ErrorField | ErrorField[];
  requiresChangePassword?: boolean;
};
