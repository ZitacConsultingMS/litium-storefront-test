import { selectUserOrganization } from './selectOrganization';

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
jest.mock('services/websiteService.server', () => ({
  get: () => ({
    loginPageUrl: '/login',
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

describe('selectUserOrganization', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
  });
  test('should call selectOrganization with the correct parameter', async () => {
    const formData = new FormData();

    mockSelectOrganization.mockResolvedValue({
      selectUserOrganization: {
        authentication: {
          cookieName: 'token',
        },
      },
    });
    formData.append('id', 'foo');
    await selectUserOrganization('/my-pages', formData);
    expect(mockSelectOrganization).toHaveBeenCalled();
    expect(mockSelectOrganization).toHaveBeenCalledWith('foo');
  });
  test('should call redirect if redirectUrl is provided', async () => {
    const formData = new FormData();

    mockSelectOrganization.mockResolvedValue({
      selectUserOrganization: {
        authentication: {
          cookieName: 'token',
        },
      },
    });
    formData.append('id', 'foo');
    await selectUserOrganization('/my-pages', formData);
    expect(mockRedirect).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('https://localhost/my-pages');
  });
  test('should redirect to login page if user is not authorized', async () => {
    const formData = new FormData();
    const error = [
      {
        extensions: {
          code: 'AUTH_NOT_AUTHORIZED',
        },
      },
    ];

    formData.append('id', 'foo');
    mockSelectOrganization.mockRejectedValueOnce(error);
    await selectUserOrganization('/', formData);
    expect(mockRedirect).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('https://localhost/login');
  });

  it('throw errors which are not AUTH_NOT_AUTHORIZED', async () => {
    const formData = new FormData();
    formData.append('id', 'foo');
    const error = new Error('Some unexpected error');

    mockSelectOrganization.mockRejectedValueOnce(error);

    await expect(selectUserOrganization('/my-pages', formData)).rejects.toThrow(
      error
    );
  });
});
