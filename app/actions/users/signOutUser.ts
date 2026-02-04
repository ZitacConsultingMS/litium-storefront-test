'use server';
import { gql } from '@apollo/client';
import { redirect } from 'next/navigation';
import { mutateServer } from 'services/dataService.server';
import { get } from 'services/websiteService.server';
import { setCookieFromResponse } from 'utils/cookies';
import { getHost } from 'utils/headers';

export const signOutUser = async () => {
  const result = await mutateServer({
    mutation: SIGN_OUT_USER,
    variables: {
      input: {},
    },
  });
  setCookieFromResponse(result);
  const websites = await get();
  const homeUrl = new URL(websites.homePageUrl, await getHost());
  homeUrl.searchParams.append('refreshCart', 'true');
  redirect(homeUrl.href);
};
const SIGN_OUT_USER = gql`
  mutation signOutUser($input: SignOutUserInput!) {
    signOutUser(input: $input) {
      boolean
    }
  }
`;
