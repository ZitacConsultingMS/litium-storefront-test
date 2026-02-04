'use server';

import { gql } from '@apollo/client';
import { ErrorPage } from 'models/error';
import { queryServer } from 'services/dataService.server';
import { get as getWebsite } from 'services/websiteService.server';

export const getErrorPageContent = async function (): Promise<ErrorPage> {
  const website = await getWebsite();
  return (
    await queryServer({
      query: GET_CONTENT,
      url: website.generalErrorPageUrl,
    })
  ).content;
};

const GET_CONTENT = gql`
  query GetErrorPageContent {
    content {
      ... on ErrorPage {
        id
        fields {
          title
          editor
        }
      }
    }
  }
`;
