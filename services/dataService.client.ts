import { FetchPolicy, NormalizedCacheObject } from '@apollo/client';
import {
  ApolloClient,
  SSRMultipartLink,
} from '@apollo/client-integration-nextjs';
import { DocumentNode } from 'graphql';
import { createApolloClientOptions } from './apollo-client';
import { mutate, query as queryAction } from './dataService';

// define the cache for apollo client that is used in client side usage.
let apolloClient: ApolloClient<NormalizedCacheObject>;

function getClient() {
  apolloClient = apolloClient ?? initializeApollo();
  return apolloClient;
}

function initializeApollo(): ApolloClient<NormalizedCacheObject> {
  const links =
    typeof window === 'undefined'
      ? [
          // in a SSR environment, if you use multipart features like
          // @defer, you need to decide how to handle these.
          // This strips all interfaces with a `@defer` directive from your queries.
          new SSRMultipartLink({
            stripDefer: true,
          }),
        ]
      : [];
  return new ApolloClient(
    createApolloClientOptions({
      links,
    })
  );
}

/**
 * Queries content from GraphQL server, should be called from Client Components where access to `next/headers`
 * is not available.
 * @param query a GraphQL query.
 * @param url a relative content url. The current requested url should be used here. `window.location.pathname` will be used by default.
 * @param host an optional string contains host and port number. For example: localhost or https://localhost:3001. Only HTTPS is supported.
 * The value should be the value of `window.location.host` which represents the host name end users have at their browsers.
 * The value is used to determine the website's channel.
 * When ruuning at client browser, the default value is `window.location.host`.
 * @param variables GraphQL query's variables.
 * @param context GraphQL query's context. Cookie is sent along with every request as ApolloClient's `credentials` option is configured
 * as 'include' by default.
 * @param fetchPolicy GraphQL query's fetch policy. Specifies how the query interacts with the Apollo Client cache during execution.
 * @returns query result.
 */
export async function queryClient({
  client,
  query,
  url,
  host,
  variables,
  context,
  fetchPolicy,
}: {
  client?: ApolloClient<any>;
  query: DocumentNode;
  url?: string;
  host?: string;
  variables?: any;
  context?: any;
  fetchPolicy?: FetchPolicy;
}) {
  return await queryAction({
    client: client ?? getClient(),
    query,
    url: url ?? window.location.pathname,
    host: host || window.location.host,
    context,
    variables,
    fetchPolicy,
  });
}

/**
 * Sends a mutation request to GraphQL server, should be called from Client Components where access to `next/headers`
 * is not available.
 * @param mutation a mutation document.
 * @param url a relative content url. The current requested url should be used here. `window.location.pathname` will be used by default.
 * @param host an optinal string contains host and port number. For example: localhost or https://localhost:3001. Only HTTPS is supported.
 * The value should be the value of `window.location.host` which represents the host name end users have at their browsers.
 * The value is used to determine the website's channel.
 * When ruuning at client browser, the default value is `window.location.host`.
 * @param variables GraphQL query's variables.
 * @param context GraphQL query's context. Cookie is sent along with every request as ApolloClient's `credentials` option is configured
 * as 'include' by default.
 * @returns
 */
export async function mutateClient({
  client,
  mutation,
  url,
  host,
  variables,
  context,
}: {
  client?: ApolloClient<any>;
  mutation: DocumentNode;
  url?: string;
  host?: string;
  variables?: any;
  context?: any;
}) {
  return await mutate({
    mutation,
    client: client ?? getClient(),
    url: url ?? window.location.pathname,
    host: host || window.location.host,
    context,
    variables,
  });
}

const scriptPattern = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
const scriptFilePattern = /<script.*?src=["'](.*?)["']/gi;
/**
 * Extracts HTML snippet and scripts from a DOM string.
 * @param domString a DOM stringing.
 * @ return an object of:
 * - html: an HHTML snippet.
 * - scripts: a list of inline scripts.
 * - scriptFiles: a list of script files.
 */
export const extractScripts = (domString: string) => {
  let matches,
    html = domString;
  const scripts = [],
    scriptFiles = [];
  while ((matches = scriptPattern.exec(domString)) !== null) {
    html = html.replace(matches[0], '');
    matches[1] && matches[1].trim() !== '' && scripts.push(matches[1]);
  }
  while ((matches = scriptFilePattern.exec(domString)) !== null) {
    matches[1] && matches[1].trim() !== '' && scriptFiles.push(matches[1]);
  }

  return {
    html,
    scripts,
    scriptFiles,
  };
};
