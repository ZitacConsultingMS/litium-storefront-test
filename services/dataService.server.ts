import { FetchPolicy } from '@apollo/client';
import {
  ApolloClient,
  registerApolloClient,
} from '@apollo/client-integration-nextjs';
import { DocumentNode } from 'graphql';
import { headers as getHeaders } from 'next/headers';
import 'server-only';
import { HeaderKeys } from 'utils/constants';
import { getHeadersLink, getHost } from 'utils/headers';
import { createApolloClient } from './apollo-client';
import { mutate, query as queryAction } from './dataService';

const { getClient } = registerApolloClient(() => {
  return createApolloClient({ links: [getHeadersLink()] });
});

/**
 * Queries content from GraphQL server, should be called from Server Components,
 * where access to `next/headers` is available.
 * @param queryDocument a GraphQL query.
 * @param client an optional ApolloClient object. If empty, the default getClient will be used.
 * @param url a relative content url. The current requested url should be used here. The one stored in headers will be used by default.
 * @param headers a request header object to get the requesting host information. GraphQL server needs this
 * information to determine the website's channel. `cookie` value if available in `headers` will be added
 * to the GQL request.
 * @param variables GraphQL query's variables.
 * @param fetchPolicy GraphQL query's fetch policy. Specifies how the query interacts with the Apollo Client cache during execution.
 * By default, all queries executed at server are not cached.
 * @returns
 */
export async function queryServer(options: {
  query: DocumentNode;
  client?: ApolloClient<any>;
  url?: string;
  variables?: any;
  fetchPolicy?: FetchPolicy;
}) {
  const { url, variables, fetchPolicy } = options;
  return await queryAction({
    client: options.client ?? getClient(),
    query: options.query,
    url: url ?? (await getHeaders()).get(HeaderKeys.OriginalUrl) ?? '/',
    host: await getHost(),
    variables,
    fetchPolicy: fetchPolicy ?? 'no-cache',
  });
}

/**
 * Sends a mutation request to GraphQL server, should be called from Server Components,
 * where access to `next/headers` is available.
 * @param mutation a mutation document.
 * @param client an optional ApolloClient object. If empty, the default getClient will be used.
 * @param url a relative content url. The current requested url should be used here. The one stored in headers will be used by default.
 * @param headers a request header object to get the requesting host information. GraphQL server needs this
 * information to determine the website's channel. `cookie` value if available in `headers` will be added
 * to the GQL request.
 * @param variables GraphQL query's variables.
 * @returns
 */
export async function mutateServer(options: {
  mutation: DocumentNode;
  client?: ApolloClient<any>;
  url?: string;
  variables?: any;
}) {
  const { mutation, variables, url } = options;
  return await mutate({
    client: options.client ?? getClient(),
    mutation,
    host: await getHost(),
    variables,
    url: url ?? (await getHeaders()).get(HeaderKeys.OriginalUrl) ?? '/',
  });
}
