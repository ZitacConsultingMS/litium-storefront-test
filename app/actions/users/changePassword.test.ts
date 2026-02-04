import { changeMyPassword } from 'services/userService.server';
import { changePassword } from './changePassword';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('services/userService.server', () => ({
  changeMyPassword: jest.fn(),
}));

jest.mock('utils/headers', () => ({
  getHost: jest.fn().mockReturnValue('https://localhost'),
}));

describe('changePassword', () => {
  test('should return required error if current password is null', async () => {
    const data = await changePassword(
      {
        currentPassword: '',
        newPassword: 'newPassword',
      },
      '/login-details'
    );
    expect(data).toEqual({
      errors: [{ message: 'currentPassword is a required field' }],
    });
  });

  test('should return required error if new password is null', async () => {
    const data = await changePassword(
      {
        currentPassword: 'currentPassword',
        newPassword: '',
      },
      '/login-details'
    );
    expect(data).toEqual({
      errors: [{ message: 'newPassword is a required field' }],
    });
  });

  test('should call changeMyPassword mutation with correct params', async () => {
    await changePassword(
      {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      },
      '/login-details'
    );
    expect(changeMyPassword).toHaveBeenCalledWith({
      currentPassword: 'currentPassword',
      password: 'newPassword',
      notificationUrl:
        'https://localhost/api/email/sendEmailAccountChanged/login-details',
    });
  });

  test('should return errors as null if password is changed successfully', async () => {
    (changeMyPassword as jest.Mock).mockResolvedValueOnce({
      errors: null,
    });

    const data = await changePassword(
      {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      },
      '/login-details'
    );
    expect(data).toEqual({
      errors: null,
    });
  });

  test('should return failure errors if getting error from server', async () => {
    (changeMyPassword as jest.Mock).mockRejectedValue([
      { message: 'Incorrect password', type: 'password_missmatch' },
    ]);
    const data = await changePassword(
      {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      },
      '/login-details'
    );
    expect(data).toEqual({
      errors: [{ message: 'Incorrect password', type: 'password_missmatch' }],
    });
  });
});
