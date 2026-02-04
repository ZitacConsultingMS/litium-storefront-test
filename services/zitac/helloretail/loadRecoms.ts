export interface HelloRetailRequest {
    key: string;
    format?: string;
    fields?: string[];
    deviceType?: string;
    context?: {
        hierarchies?: string[][];
        urls?: string[];
    };
}

export interface HelloRetailProduct {
    keywords: string;
    hierarchies: string[][];
    extraData: {
        nettopris: string;
        bottomBadge: string;
        isNew: string;
        campaignPriceExpires?: string;
        discountBadgeText?: string;
        memberPrice?: string;
        supplierNumber?: string;
        previousPrice?: string;
        id?: string;
        sku?: string;
        brandname?: string;
        _product_link?: string;
        bullets?: string;
    };
    oldPrice?: number;
    description: string;
    trackingCode: string;
    originalUrl: string;
    productNumber: string;
    title: string;
    extraDataList: {
        bulletPoints: string[];
        campaignPrice: string[];
        previousPrice: string[];
        memberPrice: string[];
    };
    url: string;
    imgUrl: string;
    priceExVat?: number;
    oldPriceExVat?: number;
    ean: string;
    retailMediaCampaignId?: string;
    price: number;
    onSale: boolean;
    currency: string;
    inStock: boolean;
    category?: string;
    brand: string;
    extraDataNumber: Record<string, any>;
}

export interface HelloRetailResponse {
    key: string;
    success: boolean;
    countAfterSource: string;
    products: HelloRetailProduct[];
}

export interface HelloRetailApiResponse {
    responses: HelloRetailResponse[];
    success: boolean;
}

export async function getHelloRetailRecommendations(
    requests: HelloRetailRequest[],
    trackingUserId?: string
) {
    const websiteUuid = process.env.HELLORETAIL_WEBSITE_UUID;

    if (!websiteUuid) {
        throw new Error("HELLORETAIL_WEBSITE_UUID is not set in environment variables");
    }

    // Transform requests to match the new API format
    const transformedRequests = requests.map(request => {
        const transformed: any = { key: request.key };

        const urls = request.context?.urls?.filter(Boolean) ?? [];
        const hierarchies = request.context?.hierarchies?.filter(h => Array.isArray(h) && h.length) ?? [];
        if (urls.length || hierarchies.length) {
            transformed.context = {} as { urls?: string[]; hierarchies?: string[][] };
            if (urls.length) transformed.context.urls = urls;
            if (hierarchies.length) transformed.context.hierarchies = hierarchies as string[][];
        }

        // Only include other fields if explicitly provided and non-empty
        if (request.format) transformed.format = request.format;
        if (request.fields && request.fields.length) transformed.fields = request.fields;
        if (request.deviceType) transformed.deviceType = request.deviceType;

        return transformed;
    });

    const payload: any = {
        websiteUuid,
        requests: transformedRequests,
    };

    if (trackingUserId) {
        payload.trackingUserId = trackingUserId;
    }

    const response = await fetch('https://core.helloretail.com/serve/recoms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        next: { revalidate: 1700 },
    });

    if (!response.ok) {
        throw new Error(`HelloRetail request failed: ${response.statusText}`);
    }

    return response.json();
}

export function toAbsoluteUrl(relativeUrl: string, base?: string): string {
    try {
        if (!relativeUrl) return '';
        if (/^https?:\/\//i.test(relativeUrl)) return relativeUrl;
        if (base) return new URL(relativeUrl, base).href;
        // Fallback: return relative URL if base is not configured
        return relativeUrl;
    } catch {
        return relativeUrl || '';
    }
}

export function buildHelloRetailRequests(args: {
    key: string;
    productUrl?: string;
    fields?: string[];
    format?: string;
    deviceType?: string;
}): HelloRetailRequest[] {
    const { key, productUrl, fields, format, deviceType } = args;
    const req: HelloRetailRequest = { key };
    if (productUrl) {
        req.context = { urls: [productUrl] };
    }
    if (fields && fields.length) req.fields = fields;
    if (format) req.format = format;
    if (deviceType) req.deviceType = deviceType;
    return [req];
}

export async function getHelloRetailFromContent(
    content: any,
    trackingUserId?: string
): Promise<{ products: HelloRetailProduct[]; title: string; }> {
    const helloRetailFields = content?.helloRetailFieldGroup?.[0]?.fields ?? [];
    const title = helloRetailFields[0]?.stringValue || '';
    const recomBoxId = helloRetailFields[1]?.stringValue || '';

    const relativeUrl: string = content?.url || '';
    const base = process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.WEBSITE_URL || '';
    const absoluteUrl = toAbsoluteUrl(relativeUrl, base);

    let products: HelloRetailProduct[] = [];
    if (recomBoxId) {
        try {
            const requests = buildHelloRetailRequests({ key: recomBoxId, productUrl: absoluteUrl });
            const response: HelloRetailApiResponse = await getHelloRetailRecommendations(requests, trackingUserId);
            products = response?.responses?.[0]?.products ?? [];
        } catch (error) {
            // Intentionally swallow errors here to avoid impacting the page render
            console.error('HelloRetail load failed for boxId:', recomBoxId, error);
        }
    }

    return { products, title };
}

export async function getHelloRetailHorizontalFromContent(
    content: any,
    trackingUserId?: string
): Promise<{ products: HelloRetailProduct[]; title: string }[]> {
    const horizontalField = content?.helloRetailFieldGroup?.[0]?.fields?.find(
        (field: any) =>
            field.__typename === 'ZsHelloRetailRecomHorizontalProductFieldValues'
    );

    const arrayData =
        horizontalField?.zsHelloRetailRecomHorizontalProductFieldValues;
    if (!Array.isArray(arrayData) || arrayData.length === 0) {
        return [];
    }

    const relativeUrl: string = content?.url || '';
    const base =
        process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.WEBSITE_URL || '';
    const absoluteUrl = toAbsoluteUrl(relativeUrl, base);

    const results = await Promise.allSettled(
        arrayData.slice(0, 2).map(async (item) => {
            const recomBoxId = item?.zsHelloRetailRecomBoxIdProduct?.trim();
            if (!recomBoxId) return null;

            const requests = buildHelloRetailRequests({
                key: recomBoxId,
                productUrl: absoluteUrl,
            });
            const response = await getHelloRetailRecommendations(
                requests,
                trackingUserId
            );
            return {
                products: response?.responses?.[0]?.products ?? [],
                title: item?.zsHelloRetailRecomBoxIdProductTitle || '',
            };
        })
    );

    return results
        .filter(
            (
                result
            ): result is PromiseFulfilledResult<{
                products: HelloRetailProduct[];
                title: string;
            }> => result.status === 'fulfilled' && result.value !== null
        )
        .map((result) => result.value);
}
