
export interface HelloRetailCartTrackingRequest {
    trackingUserId: string;
    websiteUuid: string;
    productNumbers?: string[];
    urls?: string[];
    total?: string;
    url?: string;
    email?: string;
}

export interface HelloRetailCartTrackingResponse {
    success: boolean;
    message: string;
}

/**
 * Tracks cart to Hello Retail using the REST API
 */
export async function trackCartToHelloRetail(
    payload: HelloRetailCartTrackingRequest
): Promise<HelloRetailCartTrackingResponse> {
    const response = await fetch('https://core.helloretail.com/serve/collect/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
            `HelloRetail cart tracking failed: ${response.statusText} - ${errorBody.message || 'Unknown error'}`
        );
    }

    return response.json();
}
