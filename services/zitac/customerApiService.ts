// Global runtime config cache with request deduplication
let runtimeConfig: { apiBaseUrl: string } | null = null;
let configPromise: Promise<{ apiBaseUrl: string }> | null = null;

/**
 * Fetches the runtime configuration from the API with proper caching and deduplication
 */
export async function getRuntimeConfig(): Promise<{ apiBaseUrl: string }> {
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
      const response = await fetch('/api/customer');
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
