
export interface HelloRetailConversionRequest {
    trackingUserId: string;
    websiteUuid: string;
    total: number;
    orderNumber: string;
    email: string;
    customerId?: string;
    products: HelloRetailConversionProduct[];
}

export interface HelloRetailConversionProduct {
    productNumber: string;
    url: string;
    quantity: number;
    lineTotal: number;
}

export interface HelloRetailConversionResponse {
    success: boolean;
    message: string;
}

/**
 * Tracks conversion to Hello Retail using the REST API
 */
export async function trackConversionToHelloRetail(
    payload: HelloRetailConversionRequest
): Promise<HelloRetailConversionResponse> {
    const url = 'https://core.helloretail.com/serve/collect/conversion';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseData: HelloRetailConversionResponse;

    try {
        responseData = JSON.parse(responseText);
    } catch (e) {
        console.error('[HelloRetail Conversion] Failed to parse response:', responseText);
        throw new Error(`HelloRetail conversion tracking failed: Invalid JSON response`);
    }

    if (!response.ok) {
        console.error('[HelloRetail Conversion] API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            body: responseData,
        });
        throw new Error(
            `HelloRetail conversion tracking failed: ${response.statusText} - ${responseData.message || 'Unknown error'}`
        );
    }

    return responseData;
}

