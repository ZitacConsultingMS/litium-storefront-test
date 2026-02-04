'use server';

import { trackConversionToHelloRetail } from 'services/zitac/helloretail/trackConversion';
import { HelloRetailConversionPayload } from 'utils/helloRetailConversionTracking';
import { getHelloRetailTrackingId } from 'utils/helloRetailTracking';

/**
 * Server action to track conversion to Hello Retail using REST API
 */
export async function trackHelloRetailConversion(
    conversionPayload: HelloRetailConversionPayload
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

        const fullPayload = {
            trackingUserId,
            websiteUuid,
            ...conversionPayload,
        };

        const response = await trackConversionToHelloRetail(fullPayload);

        return {
            success: response.success,
            message: response.message,
        };
    } catch (error) {
        console.error('Error tracking conversion to Hello Retail:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

