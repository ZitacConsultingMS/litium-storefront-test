import { FetchPolicy } from '@apollo/client';
import { ApolloClient } from '@apollo/client-integration-nextjs';
import { DocumentNode } from 'graphql';
import { HeaderKeys } from 'utils/constants';

/**
 * Queries content from GraphQL server.
 * @param query a GraphQL query.
 * @param url a relative content url. The current requested url should be used.
 * @param host a string contains host and port number. For example: localhost or https://localhost:3001. Only HTTPS is supported.
 * @param variables GraphQL query's variables.
 * @param context GraphQL query's context. Cookie is sent along with every request as ApolloClient's `credentials` option is configured
 * as 'include' by default.
 * @param fetchPolicy GraphQL query's fetch policy. Specifies how the query interacts with the Apollo Client cache during execution.
 * @returns query result.
 */
export async function query({
  client,
  query,
  url,
  host,
  variables,
  context,
  fetchPolicy,
}: {
  client: ApolloClient<any>;
  query: DocumentNode;
  url: string;
  host: string;
  variables?: any;
  context?: any;
  fetchPolicy?: FetchPolicy;
}) {
  return await execute({
    client,
    queryFn: async (client: ApolloClient<any>, context: any) => {
      return await client.query({
        query,
        variables,
        context,
        fetchPolicy,
        // Saves both data and errors into the Apollo Cache so your UI can use them.
        // more info: https://www.apollographql.com/docs/react/v2/data/error-handling/#error-policies
        errorPolicy: 'all',
      });
    },
    url,
    host,
    context,
  });
}

/**
 * Sends a mutation request to GraphQL server, should be called from Client Components where access to `next/headers`
 * is not available.
 * @param mutation a mutation document.
 * @param url a relative content url. The current requested url should be used.
 * @param host a string contains host and port number. For example: localhost or https://localhost:3001. Only HTTPS is supported.
 * @param variables GraphQL query's variables.
 * @param context GraphQL query's context. Cookie is sent along with every request as ApolloClient's `credentials` option is configured
 * as 'include' by default.
 * @returns
 */
export async function mutate({
  client,
  mutation,
  url,
  host,
  variables,
  context,
}: {
  client: ApolloClient<any>;
  mutation: DocumentNode;
  url: string;
  host: string;
  variables?: any;
  context?: any;
}) {
  return await execute({
    client,
    queryFn: async (client: ApolloClient<any>, context: any) => {
      return await client.mutate({
        mutation,
        variables,
        context,
        // Saves both data and errors into the Apollo Cache so your UI can use them.
        // more info: https://www.apollographql.com/docs/react/v2/data/error-handling/#error-policies
        errorPolicy: 'all',
      });
    },
    url,
    host,
    context,
  });
}

async function execute({
  client,
  queryFn,
  url,
  host,
  context,
}: {
  client: ApolloClient<any>;
  queryFn: (client: ApolloClient<any>, context: any) => Promise<any>;
  url: string;
  host: string;
  context: any;
}) {
  if (url.indexOf('https://') === 0 || url.indexOf('http://') === 0) {
    throw '"url" param should be a relative url, it should not contain protocol nor domain name. Request cancelled.';
  }
  if (!host) {
    throw '"host" param is empty. Request cancelled.';
  }
  if (host.indexOf('http://') === 0) {
    throw '"host" contains HTTP protocol. Only HTTPS is supported. Request cancelled.';
  }

  const fullUrl = new URL(
    url,
    host.indexOf('https://') === 0 ? host : `https://${host}`
  ).href;

  const ctx = {
    ...(context || {}),
    headers: {
      ...(context || {}).headers,
      [HeaderKeys.ContextUrl]: fullUrl,
    },
  };

  const result = await queryFn(client, ctx);
  if (result.errors) {
    throw result.errors;
  }
  const { data } = result;
  return data;
}
