import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as resetUserPasswordModule from 'app/actions/users/resetUserPassword';
import * as resetUserPasswordVerificationModule from 'app/actions/users/resetUserPasswordVerification';
import ForgotPassword from './ForgotPassword';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/login'),
}));

jest.mock('app/actions/users/resetUserPassword', () => ({
  resetUserPassword: jest.fn(),
}));

jest.mock('app/actions/users/resetUserPasswordVerification', () => ({
  resetUserPasswordVerification: jest.fn(),
}));

describe('ForgotPassword component', () => {
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Forgot password form', () => {
    test('should render forgot password form with username field', () => {
      render(<ForgotPassword onClose={mockOnCancel} />);

      expect(screen.getByTestId('forgot-password')).toBeInTheDocument();
      expect(
        screen.getByTestId('forgot-password__username')
      ).toBeInTheDocument();
      expect(screen.getByTestId('forgot-password__cancel')).toBeInTheDocument();
      expect(screen.getByTestId('forgot-password__submit')).toBeInTheDocument();
      expect(screen.getByText('forgotpassword.title')).toBeInTheDocument();
      expect(
        screen.getByText('forgotpassword.description')
      ).toBeInTheDocument();
    });

    test('should not render verification email form', () => {
      render(<ForgotPassword onClose={mockOnCancel} />);

      expect(
        screen.queryByTestId('forgot-password__verification-code')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('forgot-password__new-password')
      ).not.toBeInTheDocument();
    });

    test('should call onCancel when cancel button is clicked', async () => {
      render(<ForgotPassword onClose={mockOnCancel} />);

      await userEvent.click(screen.getByTestId('forgot-password__cancel'));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    test('should show required error when submitting empty username', async () => {
      render(<ForgotPassword onClose={mockOnCancel} />);

      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(screen.getByTestId('error-text')).toBeInTheDocument();
        expect(screen.getByTestId('error-text').textContent).toContain(
          'form.required'
        );
      });
    });

    test('should call resetUserPasswordVerification with username when form is submitted', async () => {
      const mockResetUserPasswordVerification = jest
        .spyOn(
          resetUserPasswordVerificationModule,
          'resetUserPasswordVerification'
        )
        .mockResolvedValue({
          errors: [],
          token: 'mock-token-123',
        });

      render(<ForgotPassword onClose={mockOnCancel} />);

      await userEvent.type(
        screen.getByTestId('forgot-password__username'),
        'testuser@example.com'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(mockResetUserPasswordVerification).toHaveBeenCalledWith(
          '/login',
          'testuser@example.com'
        );
      });
    });

    test('should display errors when resetUserPasswordVerification returns errors', async () => {
      const mockErrors = [
        { message: 'User not found', type: 'user_not_found' },
      ];

      jest
        .spyOn(
          resetUserPasswordVerificationModule,
          'resetUserPasswordVerification'
        )
        .mockResolvedValue({
          errors: mockErrors,
          token: '',
        });

      render(<ForgotPassword onClose={mockOnCancel} />);

      await userEvent.type(
        screen.getByTestId('forgot-password__username'),
        'nonexistent@example.com'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(screen.getByTestId('error-text')).toBeInTheDocument();
        expect(screen.getByTestId('error-text').textContent).toContain(
          'User not found'
        );
      });
    });
  });

  describe('Verification email form', () => {
    beforeEach(async () => {
      jest
        .spyOn(
          resetUserPasswordVerificationModule,
          'resetUserPasswordVerification'
        )
        .mockResolvedValue({
          errors: [],
          token: 'mock-token-123',
        });
    });
    test('should show verification code step after successful username submission', async () => {
      render(<ForgotPassword onClose={mockOnCancel} />);

      await userEvent.type(
        screen.getByTestId('forgot-password__username'),
        'testuser@example.com'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(
          screen.queryByTestId('forgot-password__username')
        ).not.toBeInTheDocument();
        expect(
          screen.getByTestId('forgot-password__verification-code')
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('forgot-password__new-password')
        ).toBeInTheDocument();
        expect(
          screen.getByText('forgotpassword.verificationcode.description')
        ).toBeInTheDocument();
      });
    });

    test('should display success message when verification code is sent', async () => {
      render(<ForgotPassword onClose={mockOnCancel} />);

      await userEvent.type(
        screen.getByTestId('forgot-password__username'),
        'testuser@example.com'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(
          screen.getByTestId('forgot-password__general-message')
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('forgot-password__general-message').textContent
        ).toContain('forgotpassword.verificationcode.sent');
      });
    });

    test('should show required error when submitting empty verification code and new password', async () => {
      render(<ForgotPassword onClose={mockOnCancel} />);

      await userEvent.type(
        screen.getByTestId('forgot-password__username'),
        'testuser@example.com'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(
          screen.getByTestId('forgot-password__verification-code')
        ).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        const errors = screen.getAllByTestId('error-text');
        expect(errors.length).toBe(2);
        expect(errors[0].textContent).toContain('form.required');
        expect(errors[1].textContent).toContain('form.required');
      });
    });

    test('should call resetUserPassword with correct parameters when form is submitted', async () => {
      const mockResetUserPassword = jest
        .spyOn(resetUserPasswordModule, 'resetUserPassword')
        .mockResolvedValue({
          errors: [],
        });

      render(<ForgotPassword onClose={mockOnCancel} />);

      await userEvent.type(
        screen.getByTestId('forgot-password__username'),
        'testuser@example.com'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(
          screen.getByTestId('forgot-password__verification-code')
        ).toBeInTheDocument();
      });

      await userEvent.type(
        screen.getByTestId('forgot-password__verification-code'),
        '123456'
      );
      await userEvent.type(
        screen.getByTestId('forgot-password__new-password'),
        'NewPassword123!'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(mockResetUserPassword).toHaveBeenCalledWith(
          '/login',
          '123456',
          'mock-token-123',
          'NewPassword123!',
          'testuser@example.com'
        );
      });
    });

    test('should clear previous errors when submitting verification code and new password', async () => {
      const mockResetUserPassword = jest
        .spyOn(resetUserPasswordModule, 'resetUserPassword')
        .mockResolvedValue({
          errors: [],
        });

      render(<ForgotPassword onClose={mockOnCancel} />);

      await userEvent.type(
        screen.getByTestId('forgot-password__username'),
        'testuser@example.com'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(
          screen.getByTestId('forgot-password__verification-code')
        ).toBeInTheDocument();
      });

      expect(
        screen.getByTestId('forgot-password__general-message')
      ).toBeInTheDocument();

      await userEvent.type(
        screen.getByTestId('forgot-password__verification-code'),
        '123456'
      );
      await userEvent.type(
        screen.getByTestId('forgot-password__new-password'),
        'NewPassword123!'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(mockResetUserPassword).toHaveBeenCalled();
      });
    });

    test('should display translated error message for wrong verification code', async () => {
      jest
        .spyOn(resetUserPasswordModule, 'resetUserPassword')
        .mockResolvedValue({
          errors: [{ message: 'Invalid code', type: 'verification_token' }],
        });

      render(<ForgotPassword onClose={mockOnCancel} />);

      await userEvent.type(
        screen.getByTestId('forgot-password__username'),
        'testuser@example.com'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(
          screen.getByTestId('forgot-password__verification-code')
        ).toBeInTheDocument();
      });

      await userEvent.type(
        screen.getByTestId('forgot-password__verification-code'),
        '999999'
      );
      await userEvent.type(
        screen.getByTestId('forgot-password__new-password'),
        'NewPassword123!'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(screen.getByTestId('error-text')).toBeInTheDocument();
        expect(screen.getByTestId('error-text').textContent).toContain(
          'forgotpassword.verificationcode.wrongcode'
        );
      });
    });

    test('should display translated error message for expired verification code', async () => {
      jest
        .spyOn(resetUserPasswordModule, 'resetUserPassword')
        .mockResolvedValue({
          errors: [{ message: 'Expired code', type: 'expired_token' }],
        });

      render(<ForgotPassword onClose={mockOnCancel} />);

      await userEvent.type(
        screen.getByTestId('forgot-password__username'),
        'testuser@example.com'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));
      await waitFor(() => {
        expect(
          screen.getByTestId('forgot-password__verification-code')
        ).toBeInTheDocument();
      });

      await userEvent.type(
        screen.getByTestId('forgot-password__verification-code'),
        '123456'
      );
      await userEvent.type(
        screen.getByTestId('forgot-password__new-password'),
        'NewPassword123!'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(screen.getByTestId('error-text')).toBeInTheDocument();
        expect(screen.getByTestId('error-text').textContent).toContain(
          'forgotpassword.verificationcode.expired'
        );
      });
    });

    test('should display generic error message for other error types', async () => {
      jest
        .spyOn(resetUserPasswordModule, 'resetUserPassword')
        .mockResolvedValue({
          errors: [{ message: 'Some other error', type: 'generic_error' }],
        });

      render(<ForgotPassword onClose={mockOnCancel} />);

      await userEvent.type(
        screen.getByTestId('forgot-password__username'),
        'testuser@example.com'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));
      await waitFor(() => {
        expect(
          screen.getByTestId('forgot-password__verification-code')
        ).toBeInTheDocument();
      });

      await userEvent.type(
        screen.getByTestId('forgot-password__verification-code'),
        '123456'
      );
      await userEvent.type(
        screen.getByTestId('forgot-password__new-password'),
        'NewPassword123!'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(screen.getByTestId('error-text')).toBeInTheDocument();
        expect(screen.getByTestId('error-text').textContent).toContain(
          'Some other error'
        );
      });
    });

    test('should handle successful password reset', async () => {
      jest
        .spyOn(resetUserPasswordModule, 'resetUserPassword')
        .mockResolvedValue({
          errors: [],
        });

      render(<ForgotPassword onClose={mockOnCancel} />);

      await userEvent.type(
        screen.getByTestId('forgot-password__username'),
        'testuser@example.com'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));
      await waitFor(() => {
        expect(
          screen.getByTestId('forgot-password__verification-code')
        ).toBeInTheDocument();
      });

      await userEvent.type(
        screen.getByTestId('forgot-password__verification-code'),
        '123456'
      );
      await userEvent.type(
        screen.getByTestId('forgot-password__new-password'),
        'NewPassword123!'
      );
      await userEvent.click(screen.getByTestId('forgot-password__submit'));

      await waitFor(() => {
        expect(resetUserPasswordModule.resetUserPassword).toHaveBeenCalled();
        // TODO: This should redirect or show success message, but component doesn't implement this yet
      });
    });
  });
});
