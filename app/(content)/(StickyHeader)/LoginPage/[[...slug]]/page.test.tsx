import { render } from '@testing-library/react';
import { generateOrganizationConnection } from '__mock__/generateMockData';
import { EmptyWebsite } from 'contexts/websiteContext';
import React from 'react';
import * as dataService from 'services/dataService.server';
import Page from './page';

const mockCookies = jest.fn();
jest.mock('next/headers', () => ({
  headers: jest.fn(),
  cookies: () => ({
    get: (name: string) => mockCookies(name),
  }),
}));

const mockRedirect = jest.fn();
jest.mock('next/navigation', () => ({
  redirect: (url: URL) => mockRedirect(url),
  usePathname: jest.fn(),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams('')),
}));

jest.mock('services/websiteService.server', () => ({
  get: jest.fn().mockResolvedValue({
    ...EmptyWebsite,
    myPagesPageUrl: '/my-page',
  }),
}));

jest.mock('react', () => ({
  ...jest.requireActual<typeof React>('react'),
  useActionState: jest.fn().mockReturnValue([{}, jest.fn()]),
}));
jest.mock('services/dataService.server', () => ({
  queryServer: jest.fn(),
}));

describe('Login page', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
    mockCookies.mockClear();
  });

  describe('Redirect', () => {
    describe('With token', () => {
      beforeEach(() => {
        mockCookies.mockReturnValue({ value: 'foo' });
      });

      describe('current user has less than 2 organizations', () => {
        beforeEach(() => {
          jest.spyOn(dataService, 'queryServer').mockResolvedValue({
            me: {
              selectedOrganization: null,
              person: {
                organizations: generateOrganizationConnection(1),
                id: 'foo',
              },
            },
          });
        });

        test('should redirect to redirectUrl if available', async () => {
          const Result = await Page({
            searchParams: Promise.resolve({ redirectUrl: '/man' }),
          });
          render(Result);

          expect(mockRedirect).toHaveBeenCalledTimes(1);
          expect(mockRedirect).toHaveBeenCalledWith('/man');
        });

        test('should redirect to my page if redirectUrl is not available', async () => {
          const Result = await Page({ searchParams: Promise.resolve({}) });
          render(Result);

          expect(mockRedirect).toHaveBeenCalledTimes(1);
          expect(mockRedirect).toHaveBeenCalledWith('/my-page');
        });

        test('should redirect to my page if searchParams is not available', async () => {
          const Result = await Page({});
          render(Result);

          expect(mockRedirect).toHaveBeenCalledTimes(1);
          expect(mockRedirect).toHaveBeenCalledWith('/my-page');
        });
      });

      describe('current user has more than 1 organizations', () => {
        test('should renders OrganizationSelect component', async () => {
          jest.spyOn(dataService, 'queryServer').mockResolvedValue({
            me: {
              selectedOrganization: null,
              person: {
                organizations: generateOrganizationConnection(2),
                id: 'foo',
              },
            },
          });
          const Result = await Page({
            searchParams: Promise.resolve({ redirectUrl: '/man' }),
          });
          const container = render(Result);
          expect(
            container.getByTestId('organization-select')
          ).toBeInTheDocument();
        });
      });

      describe('error', () => {
        test('should render Login component if user is unauthorized', async () => {
          jest.spyOn(dataService, 'queryServer').mockRejectedValue([
            {
              extensions: { code: 'AUTH_NOT_AUTHORIZED' },
            },
          ]);
          const Result = await Page({
            searchParams: Promise.resolve({ redirectUrl: '/man' }),
          });
          const container = render(Result);
          expect(container.getByTestId('login-form')).toBeInTheDocument();
        });

        test('should throw error if getUserOrganization is getting error exclude unauthorized error', async () => {
          jest
            .spyOn(dataService, 'queryServer')
            .mockRejectedValue('error message');

          let errorMessage;
          try {
            const Result = await Page({
              searchParams: Promise.resolve({ redirectUrl: '/man' }),
            });
            render(Result);
          } catch (error: any) {
            errorMessage = error;
          }
          expect(errorMessage).toEqual('error message');
        });
      });
    });

    describe('Without token', () => {
      beforeEach(() => {
        mockCookies.mockReturnValue({});
      });

      test('should not redirect', async () => {
        const Result = await Page({
          searchParams: Promise.resolve({ redirectUrl: '/man' }),
        });
        render(Result);

        expect(mockRedirect).toHaveBeenCalledTimes(0);
      });
    });
  });
});
