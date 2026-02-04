'use server';

import { trackCartToHelloRetail } from 'services/zitac/helloretail/trackCart';
import { HelloRetailCartPayload } from 'utils/helloRetailCartTracking';
import { getHelloRetailTrackingId } from 'utils/helloRetailTracking';

/**
 * Server action to track cart to Hello Retail using REST API
 */
export async function trackHelloRetailCart(
    cartPayload: HelloRetailCartPayload
): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const websiteUuid = process.env.HELLORETAIL_WEBSITE_UUID;
        if (!websiteUuid) {
            throw new Error('HELLORETAIL_WEBSITE_UUID is not set');
        }

        // Get tracking user ID from HelloRetail cookie (or fallback)
        const trackingUserId = await getHelloRetailTrackingId();

        if (!trackingUserId) {
            return {
                success: false,
                error: 'Tracking user ID not initialized',
            };
        }

        const response = await trackCartToHelloRetail({
            trackingUserId,
            websiteUuid,
            ...cartPayload,
        });

        return {
            success: response.success,
            message: response.message,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}
