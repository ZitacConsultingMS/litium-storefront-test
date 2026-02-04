import { DiscountInfo } from 'models/cart';
import { OrderRow } from 'models/order';
import { DiscountType } from 'utils/constants';

const hasProductDiscount = (discountTypes: string[]) => {
  return (
    discountTypes.includes(DiscountType.DiscountedProductPrice) ||
    discountTypes.includes(DiscountType.ProductDiscount)
  );
};

const hasOrderDiscount = (discountTypes: string[]) => {
  return (
    discountTypes.includes(DiscountType.BuyXGetCheapestDiscount) ||
    discountTypes.includes(DiscountType.MixAndMatch)
  );
};

/**
 * The function calculates the total discount amount
 * @param discountInfos an array of discount info.
 * @returns total discount amount
 */
export function calculateTotalDiscounts(
  discountInfos: DiscountInfo[],
  includingVat: boolean = true
) {
  const vatSelector = getVatSelector(includingVat);

  return discountInfos.reduce((accumulator, currentValue) => {
    if (currentValue?.discountType === DiscountType.FreeGift) {
      return accumulator;
    }
    return accumulator + currentValue?.resultOrderRow?.[`total${vatSelector}`];
  }, 0);
}

/**
 * The function is used to check when the original price is displayed. Only show original price when product has product discount.
 * @param discountInfos an array of discount info.
 * @returns a boolean to show/hide original price
 */
export function shouldShowOriginalPrice(discountInfos: DiscountInfo[]) {
  return (
    discountInfos.length > 0 &&
    (discountInfos[0].discountType === DiscountType.DiscountedProductPrice ||
      discountInfos[0].discountType === DiscountType.ProductDiscount)
  );
}

/**
 * Produces a map of a line item and a flag if the line item has multiple discounts applied.
 * @param productLineItems an array of product line items
 * @returns a map to get multiple discount info
 */
export function getMultipleDiscountInfoMap(productLineItems: OrderRow[]): {
  [key: string]: boolean;
} {
  let tmp: { [key: string]: boolean } = {};
  productLineItems.forEach((item) => {
    if (item.discountInfos.length <= 1) {
      tmp[item.articleNumber] = false;
    } else {
      const allDiscounts: string[] = Array.from(
        new Set(item.discountInfos.map((d: DiscountInfo) => d.discountType))
      );
      tmp[item.articleNumber] =
        hasProductDiscount(allDiscounts) && hasOrderDiscount(allDiscounts);
    }
  });
  return tmp;
}

/**
 * Filters discount infos to return only those that satisfy the order discount condition.
 * @param discountInfos an array of discount info.
 * @returns an array of discount infos that are order discounts.
 */
export function getOrderDiscounts(discounts: DiscountInfo[]): DiscountInfo[] {
  const orderDiscountTypes = new Set([
    DiscountType.BuyXGetCheapestDiscount,
    DiscountType.BuyXGetMostExpensiveDiscount,
    DiscountType.MixAndMatch,
    DiscountType.OrderDiscount,
  ]);

  return discounts.filter((item) => orderDiscountTypes.has(item.discountType));
}

/**
 * The function is used to calculate the total fees.
 * @param fees an array of fees.
 * @returns a number to calculate the total fees.
 */
export function calculateTotalFees(
  fees: OrderRow[],
  includingVat: boolean = true
): number {
  const vatSelector = getVatSelector(includingVat);

  return fees.reduce((acc, item) => acc + item[`total${vatSelector}`], 0);
}

/**
 * The function is used to calculate the discount for shipping.
 * @param shippingDiscount an order row.
 * @returns a number to calculate the discount for shipping.
 */
export function calculateShippingDiscounts(
  shippingDiscount: OrderRow,
  includingVat: boolean = true
): number {
  const vatSelector = getVatSelector(includingVat);

  return shippingDiscount?.discountInfos.length > 0 &&
    shippingDiscount.discountInfos[0].discountType === DiscountType.FreeDelivery
    ? Math.abs(
        shippingDiscount.discountInfos[0].resultOrderRow[`total${vatSelector}`]
      )
    : 0;
}

/**
 * The function calculates the total product price
 * @param products an array of product.
 * @returns total product price
 */
export function calculateTotalProducts(
  products: OrderRow[],
  includingVat: boolean = true
) {
  const vatSelector = getVatSelector(includingVat);

  return products.reduce((acc, item) => {
    if (
      item?.discountInfos?.length > 0 &&
      item?.discountInfos[0]?.discountType === DiscountType.FreeGift
    ) {
      return acc;
    } else if (shouldShowOriginalPrice(item.discountInfos)) {
      const totalDiscountsPrice = calculateTotalDiscounts(
        item.discountInfos,
        includingVat
      );
      return acc + item[`total${vatSelector}`] + totalDiscountsPrice;
    }

    return acc + item[`total${vatSelector}`];
  }, 0);
}

/**
 * The function is used to calculate the discount for product row.
 * @param product an product row.
 * @returns a number to calculate the discount for product row.
 */
export function calculateProductRowDiscount(
  product: OrderRow,
  includingVat: boolean = true
): number {
  const vatSelector = getVatSelector(includingVat);

  if (
    product.discountInfos.length > 0 &&
    product.discountInfos[0].discountType === DiscountType.FreeGift
  ) {
    return 0;
  } else if (shouldShowOriginalPrice(product.discountInfos)) {
    const totalDiscountsPrice = calculateTotalDiscounts(
      product.discountInfos,
      includingVat
    );
    return product[`total${vatSelector}`] + totalDiscountsPrice;
  }

  return product[`total${vatSelector}`];
}

/**
 * Filters discount infos to return only those that satisfy the product discount condition.
 * @param discountInfos an array of discount info.
 * @returns an array of discount infos that are product discounts.
 */
export function getProductDiscounts(discounts: DiscountInfo[]): DiscountInfo[] {
  const productDiscountTypes = new Set([
    DiscountType.DiscountedProductPrice,
    DiscountType.ProductDiscount,
  ]);

  return discounts.filter((item) =>
    productDiscountTypes.has(item.discountType)
  );
}

/**
 * @param includingVat a boolean value.
 * @returns the selector for the vat value.
 */
export function getVatSelector(includingVat: boolean = true) {
  return includingVat ? 'IncludingVat' : 'ExcludingVat';
}
