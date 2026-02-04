import { Cart } from 'models/cart';

/**
 * Builds an absolute URL from a relative product URL
 * @param relativeUrl The relative URL to convert
 * @param baseUrl Optional base URL (useful for server-side rendering)
 */
export function buildAbsoluteProductUrl(relativeUrl: string | null | undefined, baseUrl?: string): string | null {
    if (!relativeUrl) return null;

    // If already absolute, return as is
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
        return relativeUrl;
    }

    // Build absolute URL
    let effectiveBaseUrl = baseUrl;
    if (!effectiveBaseUrl) {
        effectiveBaseUrl = typeof window !== 'undefined'
            ? window.location.origin
            : process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.WEBSITE_URL || '';
    }
    if (!effectiveBaseUrl) return null;

    // Ensure baseUrl has protocol
    if (!effectiveBaseUrl.startsWith('http://') && !effectiveBaseUrl.startsWith('https://')) {
        if (effectiveBaseUrl.includes('.') && !effectiveBaseUrl.startsWith('/')) {
            effectiveBaseUrl = `https://${effectiveBaseUrl}`;
        } else {
            return null;
        }
    }

    try {
        return new URL(relativeUrl, effectiveBaseUrl).href;
    } catch {
        return null;
    }
}

/**
 * Gets product numbers from cart rows
 */
export function getProductNumbersFromCart(cart: Cart): string[] {
    if (!cart?.rows) return [];

    return Array.from(new Set(
        cart.rows
            .filter(row => row.rowType === 'PRODUCT' && row.articleNumber)
            .map(row => row.articleNumber)
    ));
}

/**
 * Gets product URLs from cart rows
 */
export function getProductUrlsFromCart(cart: Cart): string[] {
    if (!cart?.rows) return [];

    return cart.rows
        .filter(row => row.rowType === 'PRODUCT' && row.product?.url)
        .map(row => buildAbsoluteProductUrl(row.product?.url))
        .filter((url): url is string => url !== null);
}

/**
 * Builds Hello Retail cart tracking payload
 */
export interface HelloRetailCartPayload {
    productNumbers?: string[];
    urls?: string[];
    total?: string;
    url?: string;
    email?: string;
}

export function buildHelloRetailCartPayload(
    cart: Cart,
    options?: {
        cartUrl?: string;
        email?: string;
    }
): HelloRetailCartPayload {
    const productNumbers = getProductNumbersFromCart(cart);
    const urls = getProductUrlsFromCart(cart);

    return {
        ...(productNumbers.length > 0 ? { productNumbers } : urls.length > 0 ? { urls } : { productNumbers: [] }),
        ...(cart.grandTotal != null && { total: cart.grandTotal.toString() }),
        ...(options?.cartUrl && { url: options.cartUrl }),
        ...(options?.email && { email: options.email }),
    };
}

