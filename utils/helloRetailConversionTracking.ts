import { OrderRow } from 'models/order';
import { buildAbsoluteProductUrl } from './helloRetailCartTracking';

/**
 * Product object for Hello Retail conversion tracking
 */
export interface HelloRetailConversionProduct {
    productNumber: string;
    url: string;
    quantity: number;
    lineTotal: number;
}

/**
 * Hello Retail conversion tracking payload
 */
export interface HelloRetailConversionPayload {
    total: number;
    orderNumber: string;
    email: string;
    customerId?: string;
    products: HelloRetailConversionProduct[];
}

/**
 * Builds Hello Retail conversion tracking payload from order data
 */
export function buildHelloRetailConversionPayload(
    order: {
        rows: OrderRow[];
        grandTotal: number;
        orderNumber: string;
        customerDetails: {
            email: string;
        };
    },
    options?: {
        customerId?: string;
        baseUrl?: string;
    }
): HelloRetailConversionPayload {
    const productRows = order.rows.filter((row) => row.rowType === 'PRODUCT' && row.articleNumber);

    const products: HelloRetailConversionProduct[] = productRows
        .map((row) => {
            // Build absolute product URL
            const relativeUrl = row.product?.url || '';
            const productUrl = relativeUrl ? buildAbsoluteProductUrl(relativeUrl, options?.baseUrl) || '' : '';

            if (!productUrl && relativeUrl) {
                console.error('[HelloRetail Conversion] Failed to build absolute URL for product:', row.articleNumber);
            }

            return {
                productNumber: row.articleNumber,
                url: productUrl,
                quantity: row.quantity,
                lineTotal: row.totalIncludingVat,
            };
        })
        .filter((product) => product.productNumber && product.url);

    return {
        total: order.grandTotal,
        orderNumber: order.orderNumber,
        email: order.customerDetails.email,
        ...(options?.customerId && { customerId: options.customerId }),
        products,
    };
}

