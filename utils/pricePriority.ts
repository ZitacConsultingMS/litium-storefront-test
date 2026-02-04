import { PriceList } from 'services/zitac/customArticleService';

/**
 * Pricelist code mappings
 */
export const PRICELIST_CODES = {
    MEMBER_PRICE: 'SB',
    REGULAR_PRICE: 'K1',
    NET_PRICE: 'SC',
    CAMPAIGN_PRICE: 'SD',
    LOWEST_30_DAYS: 'LagstaPris30Dag',
} as const;

// PK and H3 are for ÅF.

export interface PriceDisplayInfo {
    price: number;
    pricelistKey: string;
    referencePrice?: number;
    referencePriceKey?: string;
    label?: string;
    colorClass?: string;
    discountPercentage?: number;
    discountAmount?: number;
}

/**
 * Priority rules (consistent across all product types):
 * 1. SB (Medlemspris) - Red, if exists and < min(SD, K1, SC). Show "Medlemspris", reference price (SC if SC <= K1, otherwise K1).
 * 2. SD (Kampanjpris) - Red, if exists and < min(K1, SC). Show "Du sparar", reference price (SC if SD < SC, otherwise K1).
 * 3. SC (Nettopris) - Red if SC < K1 and no SD < SC. Replaces K1, no label, no reference price (no line-through).
 * 4. K1 (OrdinariePris) - Black, fallback
 * 
 * Campaign selection (SB/SD):
 * - First filter by date validity (current date between StartDate and EndDate)
 * - Then sort by Priority (lower number = higher priority)
 * - Then by price (lower = better deal)
 * - Only campaigns with valid dates are considered
 * 
 * Price comparison rules:
 * - If SC >= K1, don't show SC (fallback to other prices)
 * - If SD >= K1 or SD >= SC, don't show SD (fallback to SC or K1)
 * - If SB >= any of (SD, K1, SC), don't show SB (fallback to next priority)
 * - If SD < SC, show SD in red with "Du sparar" label, SC with line-through (black) as reference
 * 
 * @param priceList The priceList object from the API
 * @returns PriceDisplayInfo with price, pricelistKey, referencePrice, label, and colorClass
 */
function calculatePricePriority(prices: {
    memberPrice: number | null;
    regularPrice: number | null;
    campaignPrice: number | null;
    netPrice: number | null;
}): PriceDisplayInfo | null {
    const { memberPrice, regularPrice, campaignPrice, netPrice } = prices;

    // Helper: Get minimum of available prices
    const minPrice = (...priceValues: (number | null)[]): number | null => {
        const validPrices = priceValues.filter((p): p is number => p !== null);
        return validPrices.length > 0 ? Math.min(...validPrices) : null;
    };

    // Helper: Get reference price (prefers SC over K1)
    const getRefPrice = () => {
        if (netPrice !== null && regularPrice !== null && netPrice <= regularPrice) {
            return { price: netPrice, key: PRICELIST_CODES.NET_PRICE };
        }
        if (regularPrice !== null) {
            return { price: regularPrice, key: PRICELIST_CODES.REGULAR_PRICE };
        }
        return null;
    };

    // 1. Check Medlemspris (SB)
    if (memberPrice !== null) {
        const minOfOthers = minPrice(regularPrice, netPrice, campaignPrice);
        if (minOfOthers !== null && memberPrice < minOfOthers) {
            const ref = getRefPrice();
            return {
                price: memberPrice,
                pricelistKey: PRICELIST_CODES.MEMBER_PRICE,
                referencePrice: ref?.price,
                referencePriceKey: ref?.key,
                label: 'Medlemspris',
                colorClass: 'text-red',
            };
        }
    }

    // 2. Check Kampanjpris (SD)
    if (campaignPrice !== null) {
        const minOfRegularAndNet = minPrice(regularPrice, netPrice);
        if (minOfRegularAndNet !== null && campaignPrice < minOfRegularAndNet) {
            // Reference price: If SD < SC, show SC with line-through, otherwise show K1
            let ref: { price: number; key: string } | null = null;
            if (netPrice !== null && campaignPrice < netPrice) {
                // SD < SC, so show SC with line-through
                ref = { price: netPrice, key: PRICELIST_CODES.NET_PRICE };
            } else if (regularPrice !== null) {
                // SD < K1 but SD >= SC, show K1 with line-through
                ref = { price: regularPrice, key: PRICELIST_CODES.REGULAR_PRICE };
            }

            const discountAmount = (ref?.price || 0) - campaignPrice;
            const discountPercentage = ref?.price ? Math.round((discountAmount / ref.price) * 100) : 0;

            return {
                price: campaignPrice,
                pricelistKey: PRICELIST_CODES.CAMPAIGN_PRICE,
                referencePrice: ref?.price,
                referencePriceKey: ref?.key,
                label: 'Du sparar',
                colorClass: 'text-red',
                discountAmount,
                discountPercentage,
            };
        }
    }

    // 3. Check Nettopris (SC) - Show if SC < K1 and no SD < SC was shown
    // SC replaces K1, displayed in red, no label, no reference price (no line-through)
    // Only show if SC < K1 (if SC >= K1, don't show SC at all)
    if (netPrice !== null && regularPrice !== null && netPrice < regularPrice) {
        return {
            price: netPrice,
            pricelistKey: PRICELIST_CODES.NET_PRICE,
            colorClass: 'text-red',
        };
    }

    // 4. Fallback to OrdinariePris (K1)
    if (regularPrice !== null) {
        return {
            price: regularPrice,
            pricelistKey: PRICELIST_CODES.REGULAR_PRICE,
            colorClass: 'text-dark-gray',
        };
    }

    return null;
}

/**
 * Gets the price based on priority logic from a PriceList object.
 * 
 * @param priceList The priceList object from the API
 * @returns PriceDisplayInfo with price, pricelistKey, referencePrice, label, and colorClass
 */
export function getPriceByPriority(
    priceList: PriceList | null | undefined
): PriceDisplayInfo | null {
    if (!priceList) return null;

    // Helper: Get value from item (handles both camelCase and lowercase)
    const getItemValue = (item: any, key: string): any => {
        return (item as any)[key] ?? (item as any)[key.toLowerCase()];
    };

    // Helper: Check if item is active
    const isItemActive = (item: any): boolean => {
        return getItemValue(item, 'Active') === true;
    };

    // Helper: Get price from item
    const getItemPrice = (item: any): number | null => {
        const price = getItemValue(item, 'Price');
        if (price == null) return null;
        const priceNum = Number(price);
        return !isNaN(priceNum) ? priceNum : null;
    };

    // Helper: Get active price from exact key match (K1, SC, etc.)
    const getExactPrice = (key: string): number | null => {
        const items = priceList[key];
        if (!items) return null;
        const activeItem = items.find(isItemActive);
        return activeItem ? getItemPrice(activeItem) : null;
    };

    // Helper: Check if campaign is valid based on date range
    const isCampaignDateValid = (item: any): boolean => {
        const startDate = getItemValue(item, 'StartDate');
        const endDate = getItemValue(item, 'EndDate');
        const now = new Date();

        if (startDate) {
            const start = new Date(startDate);
            if (now < start) return false;
        }

        if (endDate) {
            const end = new Date(endDate);
            if (now > end) return false;
        }

        return true;
    };

    // Helper: Get best active campaign price from prefix match (SB_*, SD_*)
    const getCampaignPrice = (prefix: string): number | null => {
        const validItems: Array<{ price: number; priority: number; isValidDate: boolean }> = [];

        for (const [listKey, items] of Object.entries(priceList)) {
            if (!listKey.startsWith(prefix) || !items) continue;

            for (const item of items) {
                if (!isItemActive(item)) continue;

                const isValidDate = isCampaignDateValid(item);
                const price = getItemPrice(item);
                if (price == null) continue;

                const priority = getItemValue(item, 'Priority') ?? 999;
                validItems.push({
                    price,
                    priority: Number(priority),
                    isValidDate
                });
            }
        }

        if (validItems.length === 0) return null;

        // Sort by: 1) date validity (valid first), 2) priority (lower = higher), 3) price
        validItems.sort((a, b) => {
            if (a.isValidDate !== b.isValidDate) {
                return a.isValidDate ? -1 : 1;
            }
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return a.price - b.price;
        });

        return validItems[0].price;
    };

    // Get all available prices
    const memberPrice = getCampaignPrice(PRICELIST_CODES.MEMBER_PRICE);
    const regularPrice = getExactPrice(PRICELIST_CODES.REGULAR_PRICE);
    const campaignPrice = getCampaignPrice(PRICELIST_CODES.CAMPAIGN_PRICE);
    const netPrice = getExactPrice(PRICELIST_CODES.NET_PRICE);

    const result = calculatePricePriority({
        memberPrice,
        regularPrice,
        campaignPrice,
        netPrice,
    });

    // If no result, try any other available price as last resort
    if (!result) {
        for (const key of Object.keys(priceList)) {
            if (key === PRICELIST_CODES.LOWEST_30_DAYS) continue;
            if (key.startsWith(PRICELIST_CODES.MEMBER_PRICE) || key.startsWith(PRICELIST_CODES.CAMPAIGN_PRICE)) continue;
            const price = getExactPrice(key);
            if (price !== null) {
                return {
                    price,
                    pricelistKey: key,
                    colorClass: 'text-dark-gray',
                };
            }
        }
    }

    return result;
}

/**
 * Gets the price based on priority logic for HelloRetail products.
 * Uses the same priority rules as regular products (SB > SD > SC > K1).
 * 
 * @param regularPrice The regular price (K1)
 * @param memberPrice Optional member price (SB)
 * @param campaignPrice Optional campaign price (SD)
 * @returns PriceDisplayInfo with price, pricelistKey, referencePrice, label, and colorClass
 */
export function getHelloRetailPriceByPriority(
    regularPrice: number | null | undefined,
    memberPrice?: number | null | undefined,
    campaignPrice?: number | null | undefined
): PriceDisplayInfo | null {
    // Normalize undefined/null values and filter out NaN
    const normalizedRegularPrice =
        regularPrice !== null && regularPrice !== undefined && !isNaN(regularPrice)
            ? regularPrice
            : null;
    const normalizedMemberPrice =
        memberPrice !== null && memberPrice !== undefined && !isNaN(memberPrice)
            ? memberPrice
            : null;
    const normalizedCampaignPrice =
        campaignPrice !== null && campaignPrice !== undefined && !isNaN(campaignPrice)
            ? campaignPrice
            : null;

    if (!normalizedRegularPrice) return null;

    return calculatePricePriority({
        memberPrice: normalizedMemberPrice,
        regularPrice: normalizedRegularPrice,
        campaignPrice: normalizedCampaignPrice,
        netPrice: null, // HelloRetail products don't have SC/Nettopris
    });
}
