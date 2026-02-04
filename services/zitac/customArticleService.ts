import { articleCache } from './articleCache';
import { RestApiService } from './restApiService';

export interface TextFieldOptions {
    code: string;
    description: string;
    longDescription?: string | null;
    imageUrl?: string | null;
    linkUrl?: string | null;
}

export interface PriceListItem {
    minQty?: number;
    MinQty?: number;
    price?: number;
    Price?: number;
    currencyCode?: string;
    CurrencyCode?: string;
    active?: boolean;
    Active?: boolean;
    StartDate?: string;
    EndDate?: string;
    VatIncluded?: boolean;
    Campaign?: boolean;
    Priority?: number;
}

export interface PriceList {
    [key: string]: PriceListItem[] | undefined;
}

export interface Article {
    id: string;
    name: string;
    description: string;
    fields: Record<string, unknown | null>;
    fieldsWithTextOptions: Record<string, TextFieldOptions[]>;
    priceList?: PriceList;
}

/**
 * Custom article service for fetching article-related data
 */
export class CustomArticleService extends RestApiService {
    /**
     * Fetches article details for a given articleId and normalizes the response.
     * Uses caching to prevent duplicate API calls for the same article.
     * @param articleId The article ID to fetch details for
     * @param useCache Whether to use cache (default: true)
     * @returns Article details with normalized data
     */
    static async getCustomArticleDetails(articleId: string | number, useCache: boolean = true): Promise<Article> {
        RestApiService.validateRequiredParam(articleId, "articleId");

        if (useCache) {
            const cached = articleCache.get(articleId);
            if (cached) {
                return cached;
            }
            // Check if there's a pending request for this article (deduplication)
            const pendingRequest = articleCache.getPendingRequest(articleId);
            if (pendingRequest) {
                return pendingRequest;
            }
        }
        // Create the fetch promise
        const fetchPromise = (async () => {
            const raw: any = await RestApiService.get("/article", { articleId });

            if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
                throw new Error("Unexpected response shape");
            }

            // Normalize top-level properties (supports Id/Name/Description or id/name/description)
            const id = String(raw.Id ?? raw.id ?? "");
            const name = String(raw.Name ?? raw.name ?? "");
            const description = String(raw.Description ?? raw.description ?? "");

            if (!id) throw new Error("Unexpected article payload: missing Id");

            // Fields: Dictionary<string, object?>
            const rawFields = (raw.Fields ?? raw.fields) ?? {};
            const fields: Record<string, unknown | null> =
                rawFields && typeof rawFields === "object" && !Array.isArray(rawFields) ? rawFields : {};

            // FieldsWithTextOptions: Dictionary<string, List<TextFieldOptions>>
            const rawFto = (raw.FieldsWithTextOptions ?? raw.fieldsWithTextOptions) ?? {};
            const fieldsWithTextOptions: Record<string, TextFieldOptions[]> = {};

            if (rawFto && typeof rawFto === "object" && !Array.isArray(rawFto)) {
                for (const [key, value] of Object.entries(rawFto)) {
                    if (Array.isArray(value)) {
                        fieldsWithTextOptions[key] = value.map((t: any): TextFieldOptions =>
                            RestApiService.normalizeToCamelCase(t) as TextFieldOptions
                        );
                    }
                }
            }

            // Handle both camelCase (PriceList) and lowercase (priceList) from API
            const priceList = raw.PriceList ?? raw.priceList ?? null;

            const article: Article = { id, name, description, fields, fieldsWithTextOptions, priceList };

            if (useCache) {
                articleCache.set(articleId, article);
            }

            return article;
        })();

        if (useCache) {
            articleCache.setPendingRequest(articleId, fetchPromise);
        }
        return fetchPromise;
    }

    /**
     * Gets all available pricelist keys from a priceList object
     * @param priceList The priceList object to inspect
     * @returns Array of pricelist keys
     */
    static getAvailablePricelistKeys(priceList: PriceList | null | undefined): string[] {
        if (!priceList) return [];
        return Object.keys(priceList).filter(key => priceList[key] && Array.isArray(priceList[key]) && priceList[key]!.length > 0);
    }

    /**
     * Gets the first available price from a pricelist key
     * @param priceList The priceList object
     * @param pricelistKey The pricelist key to get price from
     * @returns The price value or null if not available
     */
    static getPriceFromPricelist(priceList: PriceList | null | undefined, pricelistKey: string): number | null {
        if (!priceList || !priceList[pricelistKey]) return null;
        const items = priceList[pricelistKey];
        if (!items || items.length === 0) return null;
        return items[0]?.price ?? null;
    }
}

export const getCustomArticleDetails = CustomArticleService.getCustomArticleDetails;
export default getCustomArticleDetails;
