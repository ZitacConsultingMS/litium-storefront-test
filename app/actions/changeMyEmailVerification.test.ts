import { mutateServer } from 'services/dataService.server';
import { changeMyEmailVerification } from './changeMyEmailVerification';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('services/dataService.server', () => ({
  mutateServer: jest.fn(),
}));

jest.mock('utils/headers', () => ({
  getHost: jest.fn().mockReturnValue('https://localhost'),
}));

describe('changeMyEmailVerification', () => {
  test('should return required error if email field is empty', async () => {
    const data = await changeMyEmailVerification('/login-details', '');
    expect(data).toEqual({
      errors: [{ message: 'email is a required field' }],
    });
  });

  test('should return email error if email field is invalid', async () => {
    const data = await changeMyEmailVerification('/login-details', 'foo');
    expect(data).toEqual({
      errors: [{ message: 'email must be a valid email' }],
    });
  });

  test('should call changeMyEmailVerification mutation with correct params', async () => {
    await changeMyEmailVerification('/login-details', 'foo@bar.com');
    expect(mutateServer).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            email: 'foo@bar.com',
            notificationUrl:
              'https://localhost/api/email/sendVerificationCode/login-details',
          },
        },
      })
    );
  });

  test('should be able to get token if verification code is sent', async () => {
    (mutateServer as jest.Mock).mockResolvedValue({
      changeMyEmailVerification: {
        token: '123456',
        errors: null,
      },
    });

    const data = await changeMyEmailVerification(
      '/login-details',
      'foo@bar.com'
    );
    expect(data).toEqual({
      token: '123456',
      errors: null,
    });
  });

  test('should return failure error if getting error from server', async () => {
    (mutateServer as jest.Mock).mockRejectedValue([
      {
        message: 'Unexpected error',
      },
    ]);

    const data = await changeMyEmailVerification(
      '/login-details',
      'foo@bar.com'
    );
    expect(data).toEqual({
      errors: [
        {
          message: 'Unexpected error',
        },
      ],
    });
  });
});
