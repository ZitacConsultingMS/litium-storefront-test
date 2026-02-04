import { generateOrganizationConnection } from '__mock__/generateMockData';
import {
  AuthenticationFailureType,
  SignInUserState,
} from 'models/authenticationFailureType';
import * as dataServiceServer from 'services/dataService.server';
import { signInUser } from './signInUser';

const mockRedirect = jest.fn();
jest.mock('next/navigation', () => ({
  redirect: (url: URL) => mockRedirect(url),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
  cookies: () => ({
    get: () => ({
      value: 'cookie',
    }),
  }),
}));

jest.mock('services/dataService.server', () => ({
  mutateServer: jest.fn(),
}));

jest.mock('utils/headers', () => ({
  getHost: jest.fn().mockReturnValue('https://localhost'),
  forwardCookies: jest.fn(),
}));
const mockSelectOrganization = jest.fn();
jest.mock('services/organizationService.server', () => ({
  selectOrganization: (organizationId: string) =>
    mockSelectOrganization(organizationId),
}));

describe('signInUser', () => {
  test('should return required error if username, password and new password field are empty', async () => {
    const formData = new FormData();
    formData.append('username', '');
    formData.append('password', '');
    formData.append('newPassword', '');
    const prevState: SignInUserState = {
      requiresChangePassword: true,
    };
    const data = await signInUser('/', '', prevState, formData);
    expect(data).toEqual({
      errors: [
        { message: 'username is a required field' },
        { message: 'password is a required field' },
        { message: 'newPassword is a required field' },
      ],
    });
  });

  test('should redirect to home page after logging in successfully', async () => {
    jest.spyOn(dataServiceServer, 'mutateServer').mockResolvedValue({
      signInUser: {
        authentication: {
          cookieName: 'token',
          me: {
            person: {},
          },
        },
        errors: null,
      },
    });
    const formData = new FormData();
    formData.append('username', 'foo');
    formData.append('password', 'foo');
    await signInUser('/', '', undefined, formData);
    expect(mockRedirect).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith(
      'https://localhost/?redirectUrl='
    );
  });

  test('should redirect to redirect url after logging in successfully', async () => {
    jest.spyOn(dataServiceServer, 'mutateServer').mockResolvedValue({
      signInUser: {
        authentication: {
          cookieName: 'token',
          me: {
            person: {},
          },
        },
        errors: null,
      },
    });
    const formData = new FormData();
    formData.append('username', 'foo');
    formData.append('password', 'foo');
    await signInUser('/', 'my-pages', undefined, formData);
    expect(mockRedirect).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith(
      'https://localhost/?redirectUrl=my-pages'
    );
  });

  test('should return change password error if user is required to change password', async () => {
    jest.spyOn(dataServiceServer, 'mutateServer').mockResolvedValue({
      signInUser: {
        errors: [
          {
            type: AuthenticationFailureType.REQUIRES_CHANGED_PASSWORD,
          },
        ],
      },
    });
    const formData = new FormData();
    formData.append('username', 'foo');
    formData.append('password', 'foo');
    const data = await signInUser('/', '', undefined, formData);
    expect(data).toEqual({
      errors: {
        type: AuthenticationFailureType.REQUIRES_CHANGED_PASSWORD,
      },
      requiresChangePassword: true,
    });
  });

  test('should return locked out error if account is locked', async () => {
    jest.spyOn(dataServiceServer, 'mutateServer').mockResolvedValue({
      signInUser: {
        errors: [
          {
            type: AuthenticationFailureType.LOCKED_OUT,
          },
        ],
      },
    });
    const formData = new FormData();
    formData.append('username', 'foo');
    formData.append('password', 'foo');
    const data = await signInUser('/', '', undefined, formData);
    expect(data).toEqual({
      errors: {
        type: AuthenticationFailureType.LOCKED_OUT,
      },
      requiresChangePassword: false,
    });
  });

  test('should return failure error if username or password is wrong', async () => {
    jest.spyOn(dataServiceServer, 'mutateServer').mockResolvedValue({
      signInUser: {
        errors: [
          {
            type: AuthenticationFailureType.FAILURE,
          },
        ],
      },
    });
    const formData = new FormData();
    formData.append('username', 'foo');
    formData.append('password', 'foo');
    const data = await signInUser('/', '', undefined, formData);
    expect(data).toEqual({
      errors: {
        type: AuthenticationFailureType.FAILURE,
      },
      requiresChangePassword: false,
    });
  });

  test('should select first organization when this user has more than 1 organizations', async () => {
    const organizationContection = generateOrganizationConnection(2);
    jest.spyOn(dataServiceServer, 'mutateServer').mockResolvedValue({
      signInUser: {
        authentication: {
          cookieName: 'token',
          me: {
            person: {
              organizations: organizationContection,
            },
          },
        },
        errors: null,
      },
    });

    const formData = new FormData();
    formData.append('username', 'foo');
    formData.append('password', 'foo');
    await signInUser('/', 'my-pages', undefined, formData);
    expect(mockSelectOrganization).toHaveBeenCalledWith(
      organizationContection.nodes[0].organization.id
    );
    expect(mockRedirect).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith(
      'https://localhost/?redirectUrl=my-pages'
    );
  });
});
