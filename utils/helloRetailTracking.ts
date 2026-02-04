import { cookies } from 'next/headers';
import { getHelloRetailTrackingUserId } from 'services/zitac/helloretail/getTrackingUserId';
import { CookieKeys } from 'utils/constants';

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/**
 * Gets the HelloRetail tracking user ID from cookies.
 * 
 * This function checks for HelloRetail's native cookie (hello_retail_id) first,
 * which is set by their external script. Falls back to the custom cookie
 * for backward compatibility, or fetches a new ID if neither exists and stores it.
 * 
 * @returns The tracking user ID, or undefined if not available
 */
export async function getHelloRetailTrackingId(): Promise<string | undefined> {
    const cookieStore = await cookies();

    // First, check for HelloRetail's native cookie (set by their script)
    const helloRetailId = cookieStore.get('hello_retail_id')?.value;
    if (helloRetailId) {
        return helloRetailId;
    }

    // Fallback to custom cookie for backward compatibility
    const customId = cookieStore.get(CookieKeys.HelloRetailTrackingUserId)?.value;
    if (customId) {
        console.log('[HelloRetail Tracking] Using fallback _helloretail_uid cookie:', customId);
        return customId;
    }

    // If neither exists, try to get one from HelloRetail API
    // This happens when the client-side script hasn't loaded yet (e.g., first request, SSR)
    // We store it in our cookie so it persists across requests (if we're in a mutable context)
    try {
        const websiteUuid = process.env.HELLORETAIL_WEBSITE_UUID;
        if (websiteUuid) {
            const apiId = await getHelloRetailTrackingUserId(websiteUuid);

            // Try to store it in our cookie so it persists across requests
            // Note: This only works in Server Actions or Route Handlers, not in Server Components
            // If we're in a Server Component, the cookie won't be set but we'll still return the ID
            try {
                cookieStore.set(CookieKeys.HelloRetailTrackingUserId, apiId, {
                    maxAge: COOKIE_MAX_AGE,
                    httpOnly: false,
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                    path: '/',
                });
            } catch (cookieError) {
                // The ID will still be used for this request, but won't persist across requests
                // This is expected behavior when called from Server Components.
                // The HelloRetailUserInit component will ensure the cookie is set via Server Action
                if (process.env.NODE_ENV === 'development') {
                    console.warn(
                        '[HelloRetail Tracking] Could not store cookie in Server Component context. ' +
                        'The tracking ID will be used for this request but may not persist. ' +
                        'This is expected - the HelloRetailUserInit component handles cookie initialization.'
                    );
                }
            }

            return apiId;
        }
    } catch (error) {
        console.error('[HelloRetail] Failed to get tracking ID from API:', error);
    }

    return undefined;
}

