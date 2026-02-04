import { gql } from '@apollo/client';
import { redirect } from 'next/navigation';
import { mutateServer } from 'services/dataService.server';
import { get } from 'services/websiteService.server';
import { setCookieFromResponse } from 'utils/cookies';
import { signOutUser } from './signOutUser'; // Assuming the file is named signOut.ts

jest.mock('services/dataService.server', () => ({
  mutateServer: jest.fn(),
}));

jest.mock('services/websiteService.server', () => ({
  get: jest.fn(),
}));

jest.mock('utils/cookies', () => ({
  setCookieFromResponse: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('signOutUser', () => {
  const SIGN_OUT_USER = gql`
    mutation signOutUser($input: SignOutUserInput!) {
      signOutUser(input: $input) {
        boolean
      }
    }
  `;

  test('should sign out user, set cookie, and redirect to home page', async () => {
    const mockHomePageUrl = 'https://example.com';
    const mockWebsites = { homePageUrl: mockHomePageUrl };

    // Mock the mutateServer function to resolve successfully
    (mutateServer as jest.Mock).mockResolvedValue({
      __setCookie:
        'token=8932fijefu0e; path=/; secure; samesite=none; httponly',
    });

    // Mock the get function to return a homepage URL
    (get as jest.Mock).mockResolvedValue(mockWebsites);

    // Call the function
    await signOutUser();

    // Ensure that mutateServer was called with the correct parameters
    expect(mutateServer).toHaveBeenCalledWith({
      mutation: SIGN_OUT_USER,
      variables: {
        input: {},
      },
    });

    // Ensure the deleteCookie function was called
    expect(setCookieFromResponse).toHaveBeenCalled();

    // Ensure the get function was called to fetch the homepage URL
    expect(get).toHaveBeenCalled();

    // Ensure that the redirect function was called with the correct URL
    expect(redirect).toHaveBeenCalledWith(mockHomePageUrl);
  });
  test('should handle mutation failure gracefully', async () => {
    const mockHomePageUrl = 'https://example.com';
    const mockWebsites = { homePageUrl: mockHomePageUrl };

    // Mock the mutateServer function to resolve successfully
    (mutateServer as jest.Mock).mockRejectedValue(new Error('Sign out failed'));

    // Mock the get function to return a homepage URL
    (get as jest.Mock).mockResolvedValue(mockWebsites);

    // Call the function
    try {
      await signOutUser();
    } catch (error) {}

    // Ensure the deleteCookie function was still called even if mutation failed
    expect(setCookieFromResponse).toHaveBeenCalled();

    // Ensure the redirect function was still called even if mutation failed
    expect(redirect).toHaveBeenCalledWith(mockHomePageUrl);
  });
});
