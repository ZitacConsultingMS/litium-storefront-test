import { OrderRow } from './order';

export interface Cart {
  discountInfos: DiscountInfo[];
  rows: OrderRow[];
  grandTotal: number;
  productCount: number;
  discountCodes: string[];
  totalVat: number;
  showPricesIncludingVat: boolean;
  currency: {
    code: string;
    symbol: string;
    symbolPosition: string;
    minorUnits: number;
  };
}

export interface DiscountInfo {
  resultOrderRow: OrderRow;
  discountType: string;
}
