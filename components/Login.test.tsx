import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthenticationFailureType } from 'models/authenticationFailureType';
import React from 'react';
import * as dataServiceClient from 'services/dataService.client';
import Login from './Login';

const mockRedirect = jest.fn();
jest.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
  usePathname: jest.fn(),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));
jest.mock('react', () => ({
  ...jest.requireActual<typeof React>('react'),
  useActionState: jest.fn().mockReturnValue([{}, jest.fn()]),
}));
jest.mock('services/dataService.client', () => ({
  queryClient: jest.fn(),
}));
jest.mock('app/actions/users/signInUser', () => ({
  signInUser: jest.fn(),
}));

describe('Login component', () => {
  describe('Login form', () => {
    test('should render login form as default', async () => {
      render(<Login myPagesPageUrl="/my-pages" />);
      expect(screen.getByTestId('login-form__username')).toBeInTheDocument();
      expect(screen.getByTestId('login-form__password')).toBeInTheDocument();
      expect(screen.getByTestId('login-form__submit')).toBeInTheDocument();
    });

    test('should show required error for username and password after clicking submitting empty form', async () => {
      render(<Login myPagesPageUrl="/my-pages" />);
      await userEvent.click(screen.getByTestId('login-form__submit'));
      expect(screen.queryAllByTestId('error-text')).toHaveLength(2);
      expect(screen.queryAllByTestId('error-text')[0].textContent).toContain(
        'form.required'
      );
      expect(screen.queryAllByTestId('error-text')[1].textContent).toContain(
        'form.required'
      );
    });

    test('should show error text if username or password is wrong', async () => {
      jest.spyOn(React, 'useActionState').mockReturnValue([
        {
          errors: {
            type: AuthenticationFailureType.FAILURE,
          },
          requiresChangePassword: false,
        },
        jest.fn(),
        false,
      ]);
      render(<Login myPagesPageUrl="/my-pages" />);
      const form = screen.getByRole('form');
      form.onsubmit = jest.fn().mockImplementation((e) => e.preventDefault());

      await userEvent.type(screen.getByTestId('login-form__username'), 'foo');
      await userEvent.type(screen.getByTestId('login-form__password'), 'foo');
      await userEvent.click(screen.getByTestId('login-form__submit'));
      expect(screen.queryAllByTestId('error-text')).toHaveLength(1);
      expect(screen.queryAllByTestId('error-text')[0].textContent).toContain(
        'login.invalidusernameorpassword'
      );
    });

    test('should show locked out error if account is locked', async () => {
      jest.spyOn(React, 'useActionState').mockReturnValue([
        {
          errors: {
            type: AuthenticationFailureType.LOCKED_OUT,
          },
          requiresChangePassword: false,
        },
        jest.fn(),
        false,
      ]);
      render(<Login myPagesPageUrl="/my-pages" />);
      const form = screen.getByRole('form');
      form.onsubmit = jest.fn().mockImplementation((e) => e.preventDefault());

      await userEvent.type(screen.getByTestId('login-form__username'), 'foo');
      await userEvent.type(screen.getByTestId('login-form__password'), 'foo');
      await userEvent.click(screen.getByTestId('login-form__submit'));
      expect(screen.queryAllByTestId('error-text')).toHaveLength(1);
      expect(screen.queryAllByTestId('error-text')[0].textContent).toContain(
        'login.lockedouterror'
      );
    });
  });

  describe('Change password form', () => {
    test('should show change password form if user needs to change password', async () => {
      jest.spyOn(React, 'useActionState').mockReturnValue([
        {
          errors: {
            type: AuthenticationFailureType.REQUIRES_CHANGED_PASSWORD,
          },
          requiresChangePassword: true,
        },
        jest.fn(),
        false,
      ]);
      jest.spyOn(dataServiceClient, 'queryClient').mockResolvedValue({
        content: {
          fields: {
            newPassword: 'login-form__new-password-info',
          },
        },
      });
      render(<Login myPagesPageUrl="/my-pages" />);

      await userEvent.type(screen.getByTestId('login-form__username'), 'foo');
      await userEvent.type(screen.getByTestId('login-form__password'), 'foo');
      await userEvent.click(screen.getByTestId('login-form__submit'));
      expect(
        screen.getByTestId('login-form__new-password')
      ).toBeInTheDocument();
      expect(screen.getByTestId('login-form__new-password')).toHaveAttribute(
        'required'
      );
      expect(
        screen.getByTestId('login-form__new-password-info')
      ).toHaveTextContent('login-form__new-password-info');

      await userEvent.type(
        screen.getByTestId('login-form__new-password'),
        'bar'
      );
      expect(screen.getByTestId('login-form__new-password')).toHaveValue('bar');
    });

    test('should show required error for new password after submitting empty form', async () => {
      jest.spyOn(React, 'useActionState').mockReturnValue([
        {
          errors: {
            type: AuthenticationFailureType.REQUIRES_CHANGED_PASSWORD,
          },
          requiresChangePassword: true,
        },
        jest.fn(),
        false,
      ]);
      jest.spyOn(dataServiceClient, 'queryClient').mockResolvedValue({
        content: {
          fields: {
            newPassword: 'login-form__new-password-info',
          },
        },
      });
      render(<Login myPagesPageUrl="/my-pages" />);

      await userEvent.type(screen.getByTestId('login-form__username'), 'foo');
      await userEvent.type(screen.getByTestId('login-form__password'), 'foo');
      await userEvent.click(screen.getByTestId('login-form__submit'));
      expect(screen.getByTestId('login-form__new-password'));
      await userEvent.click(screen.getByTestId('login-form__submit'));
      expect(screen.queryAllByTestId('error-text')).toHaveLength(1);
      expect(screen.queryAllByTestId('error-text')[0].textContent).toContain(
        'form.required'
      );
    });
  });
});
