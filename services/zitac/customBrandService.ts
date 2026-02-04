import { RestApiService } from './restApiService';

export interface BrandInfo {
    brandHeadLine: string;
    brandDescription: string;
    brandImageUrl: string | null;
}

/**
 * Custom brand service for fetching brand-related data
 */
export class CustomBrandService extends RestApiService {
    /**
     * Fetches brand information using a brand image ID
     * @param brandImageId The image ID extracted from the category image URL
     * @returns Brand information including headline, description, and image URL
     */
    static async getBrandInfo(brandImageId: string): Promise<BrandInfo> {
        RestApiService.validateRequiredParam(brandImageId, "brandImageId");

        const brandData = await RestApiService.get<BrandInfo>("/brand", { brandImageId });

        return {
            brandHeadLine: brandData.brandHeadLine || '',
            brandDescription: brandData.brandDescription || '',
            brandImageUrl: brandData.brandImageUrl || null,
        };
    }

    /**
     * Extracts image ID from URL path
     * @param url The image URL to extract ID from
     * @returns The extracted image ID or null if not found
     */
    static extractImageId(url: string): string | null {
        return RestApiService.extractImageId(url);
    }
}

/**
 * Fetches brand information from category image URL
 * @param imageUrl The category image URL
 * @param fallbackName Fallback name if brand data is not available
 * @param fallbackDescription Fallback description if brand data is not available
 * @returns Brand information with fallbacks
 */
export async function getBrandInfoFromImageUrl(
    imageUrl: string | null,
    fallbackName: string = '',
    fallbackDescription: string = ''
): Promise<BrandInfo> {
    if (!imageUrl) {
        return {
            brandHeadLine: fallbackName,
            brandDescription: fallbackDescription,
            brandImageUrl: null,
        };
    }

    const imageId = CustomBrandService.extractImageId(imageUrl);

    if (!imageId) {
        return {
            brandHeadLine: fallbackName,
            brandDescription: fallbackDescription,
            brandImageUrl: null,
        };
    }

    try {
        return await CustomBrandService.getBrandInfo(imageId);
    } catch (error) {
        return {
            brandHeadLine: fallbackName,
            brandDescription: fallbackDescription,
            brandImageUrl: null,
        };
    }
}

// Export convenience functions for backward compatibility
export const getBrandInfo = CustomBrandService.getBrandInfo;
export const extractImageId = CustomBrandService.extractImageId;
