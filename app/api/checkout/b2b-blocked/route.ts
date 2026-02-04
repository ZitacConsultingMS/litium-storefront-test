import { NextResponse } from 'next/server';
import { getB2BBlockedStatus } from 'services/userService.server';

/**
 * Returns whether the current user's org is blocked from B2B orders.
 * Called by B2B CheckoutWizard so blocked status is resolved server-side.
 *
 * If you get nodesCount: 0 but the user has an org in CMS: the storefront
 * "me" query is not returning person.organizations.nodes. The signInUser
 * mutation response does include organizations; the me query resolver
 * must be updated to return person.organizations for the same user.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const storefrontPath = url.searchParams.get('url') ?? '/';
    const result = await getB2BBlockedStatus(storefrontPath);
    return NextResponse.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('getB2BBlockedStatus failed', error);
    return NextResponse.json(
      { blocked: false, nodesCount: 0 },
      { status: 200 }
    );
  }
}
