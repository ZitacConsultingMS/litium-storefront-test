'use server';
import { gql } from '@apollo/client';
import { redirect } from 'next/navigation';
import { mutateServer } from 'services/dataService.server';
import { get } from 'services/websiteService.server';
import { setCookieFromResponse } from 'utils/cookies';

export const signOutUser = async () => {
  const result = await mutateServer({
    mutation: SIGN_OUT_USER,
    variables: {
      input: {},
    },
  });
  setCookieFromResponse(result);
  const websites = await get();
  redirect(websites.homePageUrl);
};
const SIGN_OUT_USER = gql`
  mutation signOutUser($input: SignOutUserInput!) {
    signOutUser(input: $input) {
      boolean
    }
  }
`;
