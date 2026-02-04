import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { changeMyEmailVerification } from 'app/actions/changeMyEmailVerification';
import { changeEmail } from 'app/actions/users/changeEmail';
import { changePassword } from 'app/actions/users/changePassword';
import LoginDetails from './LoginDetails';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('app/actions/users/changeEmail', () => ({
  changeEmail: jest.fn(),
}));

jest.mock('app/actions/users/changePassword', () => ({
  changePassword: jest.fn(),
}));

jest.mock('app/actions/changeMyEmailVerification', () => ({
  changeMyEmailVerification: jest.fn(),
}));

describe('Login details component', () => {
  describe('Email details form', () => {
    describe('Email step', () => {
      test('should render correct form value as default', () => {
        render(<LoginDetails email={null}></LoginDetails>);

        expect(
          screen.getByTestId('email-details__email-container')
        ).toHaveClass('block');
        expect(screen.getByTestId('email-details__code-container')).toHaveClass(
          'hidden'
        );
        expect(screen.getByTestId('email-details__email-field')).toHaveValue(
          ''
        );
        expect(screen.getByTestId('email-details__submit')).toHaveTextContent(
          'logindetails.nextbuttontext'
        );
      });

      test('should render correct user email if avaiable', () => {
        render(<LoginDetails email="foo@bar.com"></LoginDetails>);
        expect(screen.getByTestId('email-details__email-field')).toHaveValue(
          'foo@bar.com'
        );
      });

      test('should show required error when submitting if email field is empty', async () => {
        render(<LoginDetails email=""></LoginDetails>);
        await userEvent.click(screen.getByTestId('email-details__submit'));

        expect(screen.queryAllByTestId('error-text')).toHaveLength(1);
        expect(screen.queryAllByTestId('error-text')[0].textContent).toContain(
          'form.required'
        );
      });

      test('should show email format error when submitting if email field is invalid', async () => {
        render(<LoginDetails email=""></LoginDetails>);
        await userEvent.type(
          screen.getByTestId('email-details__email-field'),
          'foo'
        );
        await userEvent.click(screen.getByTestId('email-details__submit'));

        expect(screen.queryAllByTestId('error-text')).toHaveLength(1);
        expect(screen.queryAllByTestId('error-text')[0].textContent).toContain(
          'form.email.not.valid'
        );
      });

      test('should show failure errors if getting error from server', async () => {
        (changeMyEmailVerification as jest.Mock).mockResolvedValueOnce({
          errors: [
            {
              message:
                'The current user is not authorized to access this resource.',
            },
          ],
        });
        render(<LoginDetails email=""></LoginDetails>);
        await userEvent.type(
          screen.getByTestId('email-details__email-field'),
          'foo@bar.com'
        );
        await userEvent.click(screen.getByTestId('email-details__submit'));
        expect(screen.queryAllByTestId('error-text')).toHaveLength(1);
        expect(screen.queryAllByTestId('error-text')[0].textContent).toContain(
          'The current user is not authorized to access this resource.'
        );
      });
    });
    describe('Verification code step', () => {
      test('should be able to change to verification code step after sending verification code email successfully', async () => {
        (changeMyEmailVerification as jest.Mock).mockResolvedValue({
          errors: null,
          token: '123456',
        });
        render(<LoginDetails email="foo@bar.com"></LoginDetails>);
        await userEvent.type(
          screen.getByTestId('email-details__email-field'),
          'foo'
        );
        await userEvent.click(screen.getByTestId('email-details__submit'));

        expect(
          screen.getByTestId('email-details__email-container')
        ).toHaveClass('hidden');
        expect(screen.getByTestId('email-details__code-container')).toHaveClass(
          'block'
        );
        expect(screen.getByTestId('email-details__submit')).toHaveTextContent(
          'logindetails.verifybuttontext'
        );
        expect(
          screen.getByTestId('email-details__general-message')
        ).toHaveTextContent('logindetails.emaildetails.verificationcode.sent');
      });

      test('should show required error when submitting if code field is empty', async () => {
        (changeMyEmailVerification as jest.Mock).mockResolvedValueOnce({
          errors: null,
          token: '123456',
        });
        render(<LoginDetails email=""></LoginDetails>);
        await userEvent.type(
          screen.getByTestId('email-details__email-field'),
          'foo@bar.com'
        );
        await userEvent.click(screen.getByTestId('email-details__submit'));
        expect(screen.getByTestId('email-details__submit')).toHaveTextContent(
          'logindetails.verifybuttontext'
        );

        await userEvent.click(screen.getByTestId('email-details__submit'));
        expect(screen.queryAllByTestId('error-text')).toHaveLength(1);
        expect(screen.queryAllByTestId('error-text')[0].textContent).toContain(
          'form.required'
        );
      });

      test('should show error message when submitting if user enters wrong verification code', async () => {
        (changeMyEmailVerification as jest.Mock).mockResolvedValueOnce({
          errors: null,
          token: '123456',
        });
        (changeEmail as jest.Mock).mockResolvedValue({
          errors: [
            {
              message: 'Wrong verification token',
              type: 'verification_token',
            },
          ],
        });
        render(<LoginDetails email="foo@bar.com"></LoginDetails>);

        await userEvent.click(screen.getByTestId('email-details__submit'));
        await userEvent.type(
          screen.getByTestId('email-details__code-field'),
          '12345'
        );
        await userEvent.click(screen.getByTestId('email-details__submit'));

        expect(screen.queryAllByTestId('error-text')).toHaveLength(1);
        expect(screen.queryAllByTestId('error-text')[0].textContent).toContain(
          'logindetails.emaildetails.wrongcode'
        );
      });

      test('should show error message when submitting if user enters an existing email of another account', async () => {
        (changeMyEmailVerification as jest.Mock).mockResolvedValueOnce({
          errors: null,
          token: '123456',
        });
        (changeEmail as jest.Mock).mockResolvedValue({
          errors: [
            {
              message: 'Account already exists with this email.',
              type: 'account_exists',
            },
          ],
        });
        render(<LoginDetails email="foo@bar.com"></LoginDetails>);

        await userEvent.click(screen.getByTestId('email-details__submit'));
        await userEvent.type(
          screen.getByTestId('email-details__code-field'),
          '12345'
        );
        await userEvent.click(screen.getByTestId('email-details__submit'));

        expect(screen.queryAllByTestId('error-text')).toHaveLength(1);
        expect(screen.queryAllByTestId('error-text')[0].textContent).toContain(
          'logindetails.emaildetails.accountexists'
        );
      });

      test('should show success message after email is updated successfully', async () => {
        (changeMyEmailVerification as jest.Mock).mockResolvedValueOnce({
          errors: null,
          token: '123456',
        });
        (changeEmail as jest.Mock).mockResolvedValue({
          errors: null,
        });
        render(<LoginDetails email="foo@bar.com"></LoginDetails>);

        await userEvent.click(screen.getByTestId('email-details__submit'));
        await userEvent.type(
          screen.getByTestId('email-details__code-field'),
          '12346'
        );
        await userEvent.click(screen.getByTestId('email-details__submit'));
        expect(
          screen.getByTestId('email-details__general-message')
        ).toHaveTextContent('logindetails.emaildetails.success');
      });
    });
  });

  describe('Password details form', () => {
    test('should be able to display empty form as default', () => {
      render(<LoginDetails email="foo@bar.com"></LoginDetails>);

      expect(
        screen.getByTestId('password-details__current-password')
      ).toHaveValue('');
      expect(screen.getByTestId('password-details__new-password')).toHaveValue(
        ''
      );
    });

    test('should show required errors when submitting empty form', async () => {
      render(<LoginDetails email=""></LoginDetails>);
      await userEvent.click(screen.getByTestId('password-details__submit'));
      expect(screen.queryAllByTestId('error-text')).toHaveLength(2);
      expect(screen.queryAllByTestId('error-text')[0].textContent).toContain(
        'form.required'
      );
      expect(screen.queryAllByTestId('error-text')[1].textContent).toContain(
        'form.required'
      );
    });

    test('should show error message when submitting if user enters wrong current password', async () => {
      (changePassword as jest.Mock).mockResolvedValue({
        errors: [{ message: 'Incorrect password', type: 'password_missmatch' }],
      });
      render(<LoginDetails email="foo@bar.com"></LoginDetails>);
      await userEvent.type(
        screen.getByTestId('password-details__current-password'),
        'currentPassword'
      );
      await userEvent.type(
        screen.getByTestId('password-details__new-password'),
        'newPassword'
      );
      await userEvent.click(screen.getByTestId('password-details__submit'));

      expect(screen.queryAllByTestId('error-text')).toHaveLength(1);
      expect(screen.queryAllByTestId('error-text')[0].textContent).toContain(
        'logindetails.passworddetails.wrongcurrentpassword'
      );
    });

    test('should show error message when submitting if user enters wrong password complexity', async () => {
      (changePassword as jest.Mock).mockResolvedValue({
        errors: [
          {
            message: 'Incorrect password complexity',
            type: 'password_complexity',
          },
        ],
      });
      render(<LoginDetails email="foo@bar.com"></LoginDetails>);
      await userEvent.type(
        screen.getByTestId('password-details__current-password'),
        'currentPassword'
      );
      await userEvent.type(
        screen.getByTestId('password-details__new-password'),
        'newPassword'
      );
      await userEvent.click(screen.getByTestId('password-details__submit'));

      expect(screen.queryAllByTestId('error-text')).toHaveLength(1);
      expect(screen.queryAllByTestId('error-text')[0].textContent).toContain(
        'logindetails.passworddetails.wrongpasswordcomplexity'
      );
    });

    test('should reset data and show success message after password is changed successfully', async () => {
      (changePassword as jest.Mock).mockResolvedValue({
        errors: null,
      });
      render(<LoginDetails email="foo@bar.com"></LoginDetails>);
      await userEvent.type(
        screen.getByTestId('password-details__current-password'),
        'currentPassword'
      );
      await userEvent.type(
        screen.getByTestId('password-details__new-password'),
        'newPassword'
      );
      await userEvent.click(screen.getByTestId('password-details__submit'));
      expect(
        screen.getByTestId('password-details__current-password')
      ).toHaveTextContent('');
      expect(
        screen.getByTestId('password-details__new-password')
      ).toHaveTextContent('');
    });
  });
});
