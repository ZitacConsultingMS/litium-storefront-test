import { ProductItem } from 'models/(zitac)/products';
import { HelloRetailProduct } from 'services/zitac/helloretail/loadRecoms';

/**
 * Converts a HelloRetail product to the standard ProductItem format
 * used by the existing ProductCard component
 */
export function mapHelloRetailToProductItem(helloRetailProduct: HelloRetailProduct): ProductItem {
  // Clean up the image URL - only encode spaces, keep the original path structure
  const cleanImageUrl = helloRetailProduct.imgUrl
    ? helloRetailProduct.imgUrl.replace(/\s+/g, '%20') // Only replace spaces with %20
    : '';

  const imageData = cleanImageUrl ? [{ url: cleanImageUrl, dimension: {} }] : [];

  // Extract all price-related fields
  // Check both extraData and extraDataList for prices
  const memberPrice = helloRetailProduct.extraData?.memberPrice
    ? parseFloat(helloRetailProduct.extraData.memberPrice)
    : (helloRetailProduct.extraDataList?.memberPrice?.[0]
      ? parseFloat(helloRetailProduct.extraDataList.memberPrice[0])
      : null);

  const campaignPrice = helloRetailProduct.extraDataList?.campaignPrice?.[0]
    ? parseFloat(helloRetailProduct.extraDataList.campaignPrice[0])
    : null;

  // Store the original regular price for comparison (before applying campaign/member price)
  const originalRegularPrice = helloRetailProduct.price;

  return {
    id: helloRetailProduct.productNumber,
    name: helloRetailProduct.title,
    description: helloRetailProduct.description,
    url: helloRetailProduct.url,
    articleNumber: helloRetailProduct.productNumber,
    isVariant: true,
    price: {
      currency: helloRetailProduct.currency,
      unitPriceIncludingVat: originalRegularPrice,
      unitPriceExcludingVat: helloRetailProduct.priceExVat || originalRegularPrice,
      discountPriceIncludingVat: null,
      discountPriceExcludingVat: null,
    },
    stockStatus: {
      inStockQuantity: 0,
      description: '',
    },
    smallImages: imageData,
    mediumImages: imageData,
    largeImages: imageData,
    thumbnailImages: imageData,
    fields: {
      color: null,
      size: null,
      bullets: helloRetailProduct.extraDataList?.bulletPoints?.length ?
        `<ul>${helloRetailProduct.extraDataList.bulletPoints.map(point => `<li>${point.trim()}</li>`).join('')}</ul>` : '',
    },
    parent: {
      id: helloRetailProduct.category || 'uncategorized',
      name: helloRetailProduct.category || 'Uncategorized',
      url: '',
      description: '',
      fields: {},
    },
    rawData: { variants: [] },
    // Store HelloRetail-specific prices for priority calculation
    // Preserve null values (don't convert to undefined) so PriorityPriceDisplay can distinguish between "not set" and "set to null"
    memberPrice: memberPrice !== null ? memberPrice : undefined,
    campaignPrice: campaignPrice !== null ? campaignPrice : undefined,
    relationships: {
      similarProducts: { name: 'Similar Products', items: { nodes: [], edges: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false } } },
      accessory: { name: 'Accessories', items: { nodes: [], edges: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false } } },
    },
    fieldGroups: [],
    artikelmedaljerFieldGroups: [],
  };
}
