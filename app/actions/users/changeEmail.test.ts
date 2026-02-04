import { changeMyEmail } from 'services/userService.server';
import { changeEmail } from './changeEmail';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('services/userService.server', () => ({
  changeMyEmail: jest.fn(),
}));

jest.mock('utils/headers', () => ({
  getHost: jest.fn().mockReturnValue('https://localhost'),
}));

describe('changeEmail', () => {
  test('should return required error if code field is empty', async () => {
    const data = await changeEmail('/login-details', '', 'token');
    expect(data).toEqual({
      errors: [{ message: 'code is a required field' }],
    });
  });

  test('should call changeMyEmail mutation with correct params', async () => {
    await changeEmail('/login-details', '123456', 'token');
    expect(changeMyEmail).toHaveBeenCalledWith({
      verificationToken: '123456',
      token: 'token',
      notificationUrl:
        'https://localhost/api/email/sendEmailAccountChanged/login-details',
    });
  });

  test('should return errors as null if email is changed successfully', async () => {
    (changeMyEmail as jest.Mock).mockResolvedValueOnce({
      errors: null,
    });

    const data = await changeEmail('/login-details', '123456', 'token');
    expect(data).toEqual({
      errors: null,
    });
  });

  test('should return failure errors if getting error from server', async () => {
    (changeMyEmail as jest.Mock).mockRejectedValue([
      {
        type: 'verification_token',
        message: 'Wrong verification token',
      },
    ]);
    const data = await changeEmail('/login-details', '123456', 'token');
    expect(data).toEqual({
      errors: [
        {
          type: 'verification_token',
          message: 'Wrong verification token',
        },
      ],
    });
  });
});
