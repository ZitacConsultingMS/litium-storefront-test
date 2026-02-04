import { OrderRow } from './order';

export interface Cart {
  discountInfos: DiscountInfo[];
  rows: OrderRow[];
  grandTotal: number;
  productCount: number;
  discountCodes: string[];
  totalVat: number;
  showPricesIncludingVat: boolean;
  currency: Currency;
}

export interface DiscountInfo {
  resultOrderRow: OrderRow;
  discountType: string;
}

export interface Currency {
  code: string;
  symbol: string;
  symbolPosition: string;
  minorUnits: number;
}
