import 'server-only';

import { setContext } from '@apollo/client/link/context';
import { cookies, headers as requestHeaders } from 'next/headers';

/**
 * Reads and returns the running host name, including protocol.
 * @param headers incoming HTTP request headers to get host name.
 * @returns host name including protocol.
 */
export async function getHost() {
  const headersList = await requestHeaders();

  const host =
    headersList.get('x-forwarded-host')?.split(',')[0] ??
    headersList.get('host');
  if (!host) {
    throw 'Unable to get "host" from request headers. Request cancelled.';
  }

  const protocol =
    headersList.get('x-forwarded-proto')?.split(',')[0] ?? 'https';
  return `${protocol}://${host}`;
}

// if OpenTelemetry is not configured, we still want to propagate traceparent and tracestate headers
const clientHeaders = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  ? [
      'authorization',
      'x-forwarded-for',
      'x-forwarded-host',
      'x-forwarded-proto',
      'x-forwarded-port',
      'user-agent',
    ]
  : [
      'authorization',
      'x-forwarded-for',
      'x-forwarded-host',
      'x-forwarded-proto',
      'x-forwarded-port',
      'user-agent',
      'traceparent',
      'tracestate',
    ];

export function getHeadersLink() {
  return setContext(async (_, { headers }) => {
    // cookies need to be fetched from the cookies(), otherwise newly assigned authentication cookies
    // is omitted from other GQL executions in the same request, this may lead to unauthenticated errors.
    const allHeaders = {
      ...headers,
      cookie: (await cookies())
        .getAll()
        .map((c: any) => `${c.name}=${c.value}`)
        .join('; '),
    };

    const headerList = await requestHeaders();
    for (const item of clientHeaders) {
      const clientHeader = headerList.get(item);
      if (clientHeader) {
        allHeaders[item] = clientHeader;
      }
    }

    return {
      headers: allHeaders,
    };
  });
}
