import { NextResponse } from 'next/server';
import { getHelloRetailTrackingId } from 'utils/helloRetailTracking';

/**
 * API route to get Hello Retail tracking user ID
 * GET /api/helloretail/tracking-user
 * 
 * Returns the tracking user ID from HelloRetail's cookie (hello_retail_id)
 * or falls back to other methods if needed.
 * 
 * Note: HelloRetail's script (helloretail.js) automatically sets the 
 * hello_retail_id cookie, so this endpoint is mainly for backward compatibility
 * or programmatic access.
 */
export async function GET() {
    try {
        const trackingUserId = await getHelloRetailTrackingId();

        if (!trackingUserId) {
            return NextResponse.json(
                { success: false, error: 'Tracking user ID not available' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, id: trackingUserId });
    } catch (error) {
        console.error('Error getting Hello Retail tracking user ID:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
