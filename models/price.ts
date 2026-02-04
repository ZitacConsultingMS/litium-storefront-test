export interface ProductPriceItem {
  currency: string;
  unitPriceIncludingVat: number;
  unitPriceExcludingVat: number;
  discountPriceIncludingVat: number | null;
  discountPriceExcludingVat: number | null;
}
