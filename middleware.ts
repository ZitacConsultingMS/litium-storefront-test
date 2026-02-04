import { gql } from '@apollo/client';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createApolloClient } from 'services/apollo-client';
import { mutate, query as queryAction } from 'services/dataService';
import * as setCookie from 'set-cookie-parser';
import { CookieKeys, HeaderKeys, Token } from 'utils/constants';
import { getHeadersLink, getHost } from 'utils/headers';

/**
 * Rewrite the request to the correct route based on request's content type.
 * @param request
 * @returns
 */
export async function middleware(request: NextRequest) {
  const apolloClient = createApolloClient({
    links: [getHeadersLink()],
  });

  const data = await queryAction({
    client: apolloClient,
    query: GET_CONTENT_TYPE,
    url: `${request.nextUrl.pathname}?${request.nextUrl.searchParams}`,
    host: await getHost(),
  });

  let response: NextResponse;
  switch (data.content.__typename) {
    case 'AuthorizationError':
      // if the __typename is AuthorizationError the user is not authorized for the page
      // and need to sign in, redirect the user to the login page.
      response = BuildLoginResponse(request, data);
      // also make sure any invalid/expired token should be deleted.
      deleteCookie(response, Token.Name);
      break;
    case 'ForbiddenError':
      // redirect to access denied page if user doesn't have sufficient permission.
      response = Build403Response(request, data);
      break;
    case 'NotFoundError':
      // page is not found.
      response = Build404Response(request, data);
      break;
    default:
      data.content.id &&
        request.nextUrl.searchParams.append('id', data.content.id);
      const newHeaders = new Headers(request.headers);
      const url = new URL(request.url);
      newHeaders.set(HeaderKeys.OriginalUrl, url.pathname + url.search);
      const templateName = data.content.templateName ?? data.content.__typename;
      response = NextResponse.rewrite(
        new URL(
          `/${templateName}${request.nextUrl.pathname}?${request.nextUrl.searchParams}`,
          request.url
        ),
        {
          request: {
            headers: newHeaders,
          },
        }
      );
  }

  // set cookies that are included in the response from the server
  // example the authentication cookie is refreshed at a given
  // interval.
  setCookiesIfNeeded(request, response, data.__setCookie);

  // check if channel is changing so we create a new Cart with new currency
  if (
    request.cookies.has('cart-context') &&
    request.cookies.get(CookieKeys.ChannelId) &&
    request.cookies.get(CookieKeys.ChannelId)?.value !== data.channel.id
  ) {
    await resetCart(request, response);
  }

  // set channel Id in cookie if no channel was set, or if channel is changed
  if (
    !request.cookies.has(CookieKeys.ChannelId) ||
    request.cookies.get(CookieKeys.ChannelId)?.value !== data.channel.id
  ) {
    response.cookies.set(CookieKeys.ChannelId, data.channel.id);
  }

  return response;
}

/**
 * Build login request when user need to be authenticated
 */
function BuildLoginResponse(request: NextRequest, data: any): NextResponse {
  const loginPageUrl =
    data.content.query?.channel?.website?.fields.loginPage[0]?.item.url ?? '/';
  var url = new URL(loginPageUrl, request.url);
  url.search =
    '?redirectUrl=' +
    encodeURIComponent(
      `${request.nextUrl.pathname}?${request.nextUrl.searchParams}`
    );
  return NextResponse.redirect(url);
}

/**
 * Build access denied response
 */
function Build403Response(request: NextRequest, data: any): NextResponse {
  const forbiddenPageUrl =
    data.content.query?.channel?.website?.fields.forbiddenPage[0]?.item.url ??
    '/';
  return NextResponse.rewrite(
    new URL(`/ErrorPage${forbiddenPageUrl}`, request.url),
    { status: 403 }
  );
}

/**
 * Build not found response
 */
function Build404Response(request: NextRequest, data: any): NextResponse {
  // Note: don't fallback to '/' so NextJS's default 404 page will be shown if
  // no 404 page is configured in website.
  const notFoundPageUrl =
    data.content.query?.channel?.website?.fields.pageNotFound[0]?.item.url;
  const newHeaders = new Headers(request.headers);
  newHeaders.set(HeaderKeys.OriginalUrl, notFoundPageUrl);
  return NextResponse.rewrite(
    new URL(`/ErrorPage${notFoundPageUrl}`, request.url),
    {
      request: {
        headers: newHeaders,
      },
      status: 404,
    }
  );
}

/**
 * Create cart context if not available or a new one should be created.
 */
async function resetCart(request: NextRequest, response: NextResponse) {
  const apolloClient = createApolloClient({
    links: [getHeadersLink()],
  });
  await mutate({
    client: apolloClient,
    mutation: CLEAR_CART,
    host: await getHost(),
    url: `${request.nextUrl.pathname}?${request.nextUrl.searchParams}`,
  });

  // The response `data` then contains `__setCookie` props which should be used to
  // set cookie for the NextResponse.
  const data = await mutate({
    client: apolloClient,
    mutation: CREATE_CART,
    host: await getHost(),
    url: `${request.nextUrl.pathname}?${request.nextUrl.searchParams}`,
  });

  setCookiesIfNeeded(request, response, data.__setCookie);
}

const CLEAR_CART = gql`
  mutation clearCart {
    clearCart {
      cart {
        __typename
      }
    }
  }
`;

/**
 * Forward cookies from the GQL endpoint into response for the user.
 */
function setCookiesIfNeeded(
  request: NextRequest,
  response: NextResponse,
  setCookies: string | null
): void {
  if (setCookies) {
    const parsedCookies = setCookie.parse(
      setCookies?.split(',').map((s: string) => s.trim())
    );
    parsedCookies?.forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie as ResponseCookie);

      if (cookie.value.length == 0) {
        request.cookies.delete(cookie.name);
      } else {
        request.cookies.set(cookie.name, cookie.value);
      }
    });
  }
}

function deleteCookie(response: NextResponse, name: string) {
  // delete cookie by name and all cookie chunks starts with name.
  response.cookies.delete(name);
  const cookies = response.cookies.getAll();
  cookies
    .filter((c) => c.name.startsWith(name))
    .forEach((c) => response.cookies.delete(c.name));
}

const GET_CONTENT_TYPE = gql`
  query MiddlewareGetContent {
    channel {
      ...Id
    }
    content {
      __typename
      ...Id

      ... on ITemplateInfo {
        templateName
      }

      ... on Redirect {
        location
      }

      ... on AuthorizationError {
        query {
          channel {
            ... on DefaultChannelFieldTemplateChannel {
              id
              website {
                ... on AcceleratorWebsiteWebsite {
                  id
                  fields {
                    loginPage {
                      item {
                        id
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      ... on ForbiddenError {
        query {
          channel {
            ... on DefaultChannelFieldTemplateChannel {
              id
              website {
                ... on AcceleratorWebsiteWebsite {
                  id
                  fields {
                    forbiddenPage {
                      item {
                        id
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      ... on NotFoundError {
        query {
          channel {
            ... on DefaultChannelFieldTemplateChannel {
              id
              website {
                ... on AcceleratorWebsiteWebsite {
                  id
                  fields {
                    pageNotFound {
                      item {
                        id
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CREATE_CART = gql`
  mutation CreateCart {
    createCart {
      cart {
        __typename
      }
    }
  }
`;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
