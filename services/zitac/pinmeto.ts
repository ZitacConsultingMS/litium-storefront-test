export default async function getAccessToken(): Promise<string> {
    const APP_ID = process.env.PINMETO_APP_ID;
    const APP_SECRET = process.env.PINMETO_APP_SECRET;

    if (!APP_ID || !APP_SECRET) {
        throw new Error('PINMETO_APP_ID and PINMETO_APP_SECRET environment variables are required');
    }

    const CREDENTIALS = btoa(`${APP_ID}:${APP_SECRET}`);

    const response = await fetch(`https://api.pinmeto.com/oauth/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${CREDENTIALS}`,
        },
        body: "grant_type=client_credentials",
        next: { revalidate: 3600 } // Cache for 1 hour on the server
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch access token: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (!data.access_token) {
        throw new Error("Access token is null or undefined.");
    }

    return data.access_token;
}
