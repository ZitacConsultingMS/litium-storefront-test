import { RestApiService } from './restApiService';

export interface StockBalance {
    id: string;
    name: string;
    quantity: number;
    mustContactStore?: boolean;
}

export interface Store {
    id: string;
    name: string;
}

/**
 * Stock balance service for fetching stock-related data
 */
export class StockBalanceService extends RestApiService {
    /**
     * Fetch stock balance for all available stock locations for a given articleId.
     * @param articleId The article ID to fetch stock balance for
     * @returns Array of stock balance information
     */
    static async getStockBalance(articleId: string | number): Promise<StockBalance[]> {
        RestApiService.validateRequiredParam(articleId, "articleId");

        const data: unknown = await RestApiService.get("/stockbalance", { articleId });

        if (!Array.isArray(data)) {
            throw new Error("Unexpected response shape");
        }

        // validate format for response
        const valid = data.every(
            (x) =>
                x &&
                typeof x === "object" &&
                typeof (x as any).id === "string" &&
                typeof (x as any).name === "string" &&
                typeof (x as any).quantity === "number" &&
                (typeof (x as any).mustContactStore === "undefined" ||
                    typeof (x as any).mustContactStore === "boolean")
        );

        if (!valid) {
            throw new Error("Kunde inte hämta lagerinformation");
        }

        return data as StockBalance[];
    }

    /**
     * Fetch all available stores/locations.
     * This gets the list of stores by using articleId=1 to get all available stores.
     * @returns Array of store information
     */
    static async getAllStores(): Promise<Store[]> {
        // Use articleId=1 to get all available stores (same approach as StoreSelector.tsx)
        const stockData = await this.getStockBalance(1);

        // Convert StockBalance[] to Store[] format
        return stockData.map(stock => ({
            id: stock.id,
            name: stock.name
        }));
    }
}

// Export convenience functions for backward compatibility
export const getStockBalance = StockBalanceService.getStockBalance;
export const getAllStores = StockBalanceService.getAllStores;
