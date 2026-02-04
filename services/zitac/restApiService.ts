// Global runtime config cache with request deduplication
let runtimeConfig: { apiBaseUrl: string } | null = null;
let configPromise: Promise<{ apiBaseUrl: string }> | null = null;

/**
 * Fetches the runtime configuration from the API with proper caching and deduplication
 */
async function getRuntimeConfig(): Promise<{ apiBaseUrl: string }> {
    if (runtimeConfig) {
        return runtimeConfig;
    }
    if (configPromise) {
        return configPromise;
    }

    configPromise = (async () => {
        try {
            // Check if we're in a server-side context
            const isServer = typeof window === 'undefined';

            if (isServer) {
                // In server-side context, use environment variable directly
                const apiBaseUrl = process.env.RUNTIME_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
                runtimeConfig = { apiBaseUrl };
                return runtimeConfig;
            }

            // In client-side context, fetch from API endpoint
            const response = await fetch('/api/config');
            if (!response.ok) {
                throw new Error(`Failed to fetch config: ${response.status}`);
            }
            runtimeConfig = await response.json();
            return runtimeConfig!;
        } catch (error) {
            console.error('Failed to fetch runtime config, using fallback:', error);
            // Fallback for local development
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
            runtimeConfig = { apiBaseUrl };
            return runtimeConfig;
        } finally {
            // Clear the promise so future calls can make new requests if needed
            configPromise = null;
        }
    })();
    return configPromise;
}

/**
 * REST API service with common functionality for Zitac services
 */
export class RestApiService {

    /**
     * Makes a GET request to the API
     * @param endpoint The API endpoint (without base URL)
     * @param params Optional query parameters
     * @returns The response data
     */
    protected static async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
        const config = await getRuntimeConfig();
        const url = this.buildUrl(endpoint, params, config.apiBaseUrl);

        const response = await fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch from ${endpoint}: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Makes a GET request to the API and returns both data and response headers
     * @param endpoint The API endpoint (without base URL)
     * @param params Optional query parameters
     * @returns Object with data and headers
     */
    protected static async getWithHeaders<T>(
        endpoint: string,
        params?: Record<string, string | number>
    ): Promise<{ data: T; headers: Headers }> {
        const config = await getRuntimeConfig();
        const url = this.buildUrl(endpoint, params, config.apiBaseUrl);

        const response = await fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch from ${endpoint}: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return { data, headers: response.headers };
    }

    /**
     * Builds a complete URL with query parameters
     * @param endpoint The API endpoint
     * @param params Optional query parameters
     * @param baseUrl Optional base URL (defaults to runtime config)
     * @returns Complete URL string
     */
    protected static buildUrl(endpoint: string, params?: Record<string, string | number>, baseUrl?: string): string {
        // Remove leading slash from endpoint and ensure proper path construction
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const urlBase = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-base-url.localtest.me';
        const normalizedBaseUrl = urlBase.endsWith('/') ? urlBase : `${urlBase}/`;
        const url = new URL(normalizedEndpoint, normalizedBaseUrl);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value));
            });
        }

        return url.toString();
    }

    /**
     * Validates that a required parameter is not empty
     * @param value The value to validate
     * @param paramName The name of the parameter for error messages
     */
    protected static validateRequiredParam(value: any, paramName: string): void {
        if (value === undefined || value === null || value === "") {
            throw new Error(`${paramName} is required`);
        }
    }

    /**
     * Normalizes PascalCase to camelCase for object properties
     * @param obj The object to normalize
     * @returns Normalized object
     */
    protected static normalizeToCamelCase(obj: any): any {
        if (!obj || typeof obj !== 'object') return obj;

        const normalized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
            normalized[camelKey] = value;
        }
        return normalized;
    }

    /**
     * Extracts image ID from URL path
     * @param url The image URL to extract ID from
     * @returns The extracted image ID or null if not found
     */
    protected static extractImageId(url: string): string | null {
        if (!url) return null;
        const match = url.match(/\/storage\/[A-F0-9]+\/([a-f0-9]+)\//i);
        return match ? match[1] : null;
    }
}
