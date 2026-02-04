import { ApolloLink, createHttpLink } from '@apollo/client';
import { ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs';
import {
  InMemoryCacheConfig,
  createFragmentRegistry,
} from '@apollo/client/cache';
import { onError } from '@apollo/client/link/error';
import { print } from 'graphql/language/printer';
import { ALL_BLOCK_TYPES_FRAGMENT } from 'operations/fragments/blocks/allBlockTypes';
import { BANNER_BLOCK_FRAGMENT } from 'operations/fragments/blocks/banner';
import { CART_FRAGMENT } from 'operations/fragments/cart';
import {
  CHECKOUT_FRAGMENT,
  ORDER_ADDRESS_FRAGMENT,
} from 'operations/fragments/checkout';
import {
  FIELD_METADATA_FRAGMENT,
  FIELD_VALUES_FRAGMENT,
} from 'operations/fragments/fields';
import { IMAGE_FRAGMENT } from 'operations/fragments/image';
import { METADATA_FRAGMENT } from 'operations/fragments/metadata';
import { NODE_ID } from 'operations/fragments/nodeId';
import { ORDER_FRAGMENT } from 'operations/fragments/order';
import { ORDER_DETAIL_FRAGMENT } from 'operations/fragments/orderDetail';
import { PRODUCT_FRAGMENT } from 'operations/fragments/products/product';
import { PRODUCT_CARD_FRAGMENT } from 'operations/fragments/products/productCard';
import {
  CATEGORY_SEARCH_RESULT_FRAGMENT,
  PAGE_SEARCH_RESULT_FRAGMENT,
  PRODUCT_SEARCH_RESULT_FRAGMENT,
} from 'operations/fragments/search';
import possibleTypes from 'possibleTypes.json';

function createIsomorphLink() {
  const url =
    typeof window === 'undefined'
      ? new URL('/storefront.graphql', process.env.RUNTIME_LITIUM_SERVER_URL)
          .href
      : new URL('/storefront.graphql', window.location.origin).href;
  const httpLink = createHttpLink({
    uri: url,
    credentials: 'same-origin',
  });

  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      const data = {
        query: print(operation.query),
        variables: operation.variables,
      };
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error for url ${url}]: Message: ${message}, Location: ${JSON.stringify(
            locations
          )}, Path: ${JSON.stringify(path)} Variables: ${JSON.stringify(data.variables)}, Query: ${JSON.stringify(data.query)}`
        )
      );
    }
    if (networkError) {
      console.log(`[GraphQL Network error for url ${url}]: ${networkError}`);
      networkError.cause && console.log(`Cause: ${networkError.cause}`);
      networkError.stack && console.log(`Stack: ${networkError.stack}`);
    }
  });

  if (typeof window === 'undefined') {
    // If the response has set-cookie header, store it in data.__setCookie
    // so middleware.ts will pick it and set cookie for NextResponse.
    // Since the storefront and GQL server are running on the same domain,
    // the cookie is also set for requests running from client browser.
    const responseCookieLink = new ApolloLink((operation, forward) => {
      return forward(operation).map((response) => {
        const setCookie = operation
          .getContext()
          .response.headers.get('set-cookie');
        if (setCookie) {
          response.data = {
            ...(response.data || {}),
            __setCookie: setCookie,
          };
        }
        return response;
      });
    });

    return [errorLink, responseCookieLink, httpLink];
  } else {
    return [errorLink, httpLink];
  }
}

export function createApolloClient(options?: { links?: ApolloLink[] }) {
  return new ApolloClient(createApolloClientOptions(options));
}

export function createApolloClientOptions(options?: { links?: ApolloLink[] }) {
  return {
    link: ApolloLink.from([...(options?.links ?? []), ...createIsomorphLink()]),
    cache: new InMemoryCache(CacheConfig),
  };
}

const CacheConfig: InMemoryCacheConfig = {
  possibleTypes,
  fragments: createFragmentRegistry(
    NODE_ID,
    FIELD_VALUES_FRAGMENT,
    FIELD_METADATA_FRAGMENT,
    CATEGORY_SEARCH_RESULT_FRAGMENT,
    PAGE_SEARCH_RESULT_FRAGMENT,
    PRODUCT_SEARCH_RESULT_FRAGMENT,
    METADATA_FRAGMENT,
    IMAGE_FRAGMENT,
    ORDER_ADDRESS_FRAGMENT,
    CHECKOUT_FRAGMENT,
    CART_FRAGMENT,
    PRODUCT_FRAGMENT,
    PRODUCT_CARD_FRAGMENT,
    ALL_BLOCK_TYPES_FRAGMENT,
    BANNER_BLOCK_FRAGMENT,
    ORDER_FRAGMENT,
    ORDER_DETAIL_FRAGMENT
  ),
  typePolicies: {
    CurrentUser: {
      keyFields: ['person', ['id']],
    },
    IFieldValueItem: {
      keyFields: false,
    },
  },
};
