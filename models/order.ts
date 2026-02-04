import { OrderAddress } from './address';
import { Currency, DiscountInfo } from './cart';
import { ProductItem } from './products';

export interface Order {
  rows: OrderRow[];
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  grandTotal: number;
  orderNumber: string;
  status: string;
  orderDate: Date;
  tags: string[];
  id: string;
  discountInfos?: DiscountInfo[];
  totalVat?: number;
  totalFeesIncludingVat?: number;
  totalFeesExcludingVat?: number;
  shippingCostIncludingVat?: number;
  shippingCostExcludingVat?: number;
  currency: Currency;
}

export interface OrderRow {
  rowType: string;
  rowId: string;
  articleNumber: string;
  quantity: number;
  product?: ProductItem;
  totalIncludingVat: number;
  totalExcludingVat: number;
  discountInfos: DiscountInfo[];
  description?: string;
}
