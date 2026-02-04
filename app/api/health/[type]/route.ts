import { notFound } from 'next/navigation';

/**
 * This endpoint will be pinged by the Litium Cloud infrastructure
 * to ensure that the app is up to ensure that public requests
 * not arrive before the app is ready to get requests.
 */
export async function GET(
  request: Request,
  props: { params: Promise<{ type: string }> }
) {
  const params = await props.params;
  // To ensure request is from Litium Cloud infrastructure the token that
  // is included in the request header can be validated with the environment
  // variable.
  const expectedCloudToken = process.env.LITIUM_CLOUD_TOKEN;
  if (expectedCloudToken) {
    const cloudToken = request.headers.get('x-litium-cloud-token');
    if (cloudToken !== expectedCloudToken) {
      return notFound();
    }
  }

  const type = params.type;
  switch (type) {
    // startup: requested to ensure that app is started
    case 'startup':
      return new Response('Ok');
    // ready: requested to ensure that app is ready to accept requests
    case 'ready':
      return new Response('Ok');
    // live: requested to ensure that app still should accept requests
    case 'live':
      return new Response('Ok');
    // other types are not configured to be handled
    default:
      return notFound();
  }
}
