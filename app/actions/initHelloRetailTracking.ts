'use server';

import { cookies } from 'next/headers';
import { getHelloRetailTrackingUserId } from 'services/zitac/helloretail/getTrackingUserId';
import { CookieKeys } from 'utils/constants';

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/**
 * Server Action to initialize HelloRetail tracking ID
 * Fetches from API if needed and stores in cookie
 * This can be called from client components to ensure the cookie is set
 */
export async function initHelloRetailTracking(): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const cookieStore = await cookies();

        // Check if we already have a cookie
        const existingId = cookieStore.get('hello_retail_id')?.value ||
            cookieStore.get(CookieKeys.HelloRetailTrackingUserId)?.value;

        if (existingId) {
            return { success: true, id: existingId };
        }

        // Fetch new ID from API
        const websiteUuid = process.env.HELLORETAIL_WEBSITE_UUID;
        if (!websiteUuid) {
            return { success: false, error: 'HELLORETAIL_WEBSITE_UUID is not set' };
        }

        const trackingId = await getHelloRetailTrackingUserId(websiteUuid);

        // Store in cookie (this works in Server Actions)
        cookieStore.set(CookieKeys.HelloRetailTrackingUserId, trackingId, {
            maxAge: COOKIE_MAX_AGE,
            httpOnly: false,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });

        return { success: true, id: trackingId };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

