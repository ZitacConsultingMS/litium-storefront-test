export interface HelloRetailTrackingUserResponse {
    success: boolean;
    id: string;
}

/**
 * Gets or creates a Hello Retail tracking user ID using the REST API
 * @param websiteUuid The Hello Retail website UUID
 * @returns The tracking user ID
 */
export async function getHelloRetailTrackingUserId(websiteUuid: string): Promise<string> {
    const response = await fetch('https://core.helloretail.com/serve/trackingUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteUuid }),
    });

    if (!response.ok) {
        throw new Error(`HelloRetail tracking user request failed: ${response.statusText}`);
    }

    const data: HelloRetailTrackingUserResponse = await response.json();

    if (!data.success || !data.id) {
        throw new Error('HelloRetail tracking user response invalid');
    }

    return data.id;
}
