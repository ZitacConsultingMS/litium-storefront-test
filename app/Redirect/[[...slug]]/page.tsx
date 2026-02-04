import { gql } from '@apollo/client';
import { SearchParams } from 'models/searchParams';
import { permanentRedirect, redirect } from 'next/navigation';
import { queryServer } from 'services/dataService.server';

export default async function Page(props: {
  params: Promise<any>;
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { location, permanent } = await getLocation(params, searchParams);
  const url = new URL(location);

  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  if (permanent) {
    permanentRedirect(url.href);
  } else {
    redirect(url.href);
  }
}

async function getLocation(params: any, searchParams: SearchParams) {
  const searchParamsObj = new SearchParams(searchParams);
  return (
    await queryServer({
      query: GET_REDIRECT_LOCATION,
      url: `${params.slug?.join('/') ?? '/'}${searchParamsObj.toString()}`,
    })
  ).content;
}

const GET_REDIRECT_LOCATION = gql`
  query GetRedirect {
    content {
      ... on Redirect {
        location
        permanent
      }
    }
  }
`;
