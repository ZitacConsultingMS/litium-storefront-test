import { describe, expect, test } from '@jest/globals';
import { generateCartLineItemData } from '__mock__/generateMockData';
import { DiscountInfo } from 'models/cart';
import { OrderRow } from 'models/order';
import {
  calculateProductRowDiscount,
  calculateShippingDiscounts,
  calculateTotalDiscounts,
  calculateTotalFees,
  calculateTotalProducts,
  getMultipleDiscountInfoMap,
  getOrderDiscounts,
  getProductDiscounts,
  getVatSelector,
  shouldShowOriginalPrice,
} from './discountService';

describe('calculateTotalDiscounts function', () => {
  test('Should calculate total discounts correctly', () => {
    const discountInfos: DiscountInfo[] = [
      {
        discountType: 'DiscountedProductPrice',
        resultOrderRow: {
          totalIncludingVat: -450,
          totalExcludingVat: -360,
          rowType: 'DISCOUNT',
          articleNumber: 'abc-xyz-0',
          quantity: 1,
          rowId: '0',
          discountInfos: [],
        },
      },
      {
        discountType: 'MixAndMatch',
        resultOrderRow: {
          totalIncludingVat: -100,
          totalExcludingVat: -80,
          rowType: 'DISCOUNT',
          articleNumber: 'abc-xyz-0',
          quantity: 1,
          rowId: '0',
          discountInfos: [],
        },
      },
    ];

    const totalIncludingVat = calculateTotalDiscounts(discountInfos);
    expect(totalIncludingVat).toBe(-550);

    const totalExcludingVat = calculateTotalDiscounts(discountInfos, false);
    expect(totalExcludingVat).toBe(-440);
  });

  test('Should return zero with empty data', () => {
    const discountInfos: DiscountInfo[] = [];

    const totalIncludingVat = calculateTotalDiscounts(discountInfos);
    expect(totalIncludingVat).toBe(0);

    const totalExcludingVat = calculateTotalDiscounts(discountInfos, false);
    expect(totalExcludingVat).toBe(0);
  });

  test('Should ignore FreeGift discount type', () => {
    const discountInfos: DiscountInfo[] = [
      {
        discountType: 'FreeGift',
        resultOrderRow: {
          totalIncludingVat: -100,
          totalExcludingVat: -80,
          rowType: 'DISCOUNT',
          articleNumber: 'abc-xyz-0',
          quantity: 1,
          rowId: '0',
          discountInfos: [],
        },
      },
      {
        discountType: 'DiscountedProductPrice',
        resultOrderRow: {
          totalIncludingVat: -200,
          totalExcludingVat: -160,
          rowType: 'DISCOUNT',
          articleNumber: 'abc-xyz-1',
          quantity: 1,
          rowId: '1',
          discountInfos: [],
        },
      },
    ];

    const totalIncludingVat = calculateTotalDiscounts(discountInfos);
    expect(totalIncludingVat).toBe(-200);

    const totalExcludingVat = calculateTotalDiscounts(discountInfos, false);
    expect(totalExcludingVat).toBe(-160);
  });
});

describe('shouldShowOriginalPrice function', () => {
  describe('Should return true when product has product discount', () => {
    test('with DiscountedProductPrice type', () => {
      const discountInfos: DiscountInfo[] = [
        {
          discountType: 'DiscountedProductPrice',
          resultOrderRow: {
            totalIncludingVat: -450,
            totalExcludingVat: -360,
            rowType: 'DISCOUNT',
            articleNumber: 'abc-xyz-0',
            quantity: 1,
            rowId: '0',
            discountInfos: [],
          },
        },
        {
          discountType: 'MixAndMatch',
          resultOrderRow: {
            totalIncludingVat: -100,
            totalExcludingVat: -80,
            rowType: 'DISCOUNT',
            articleNumber: 'abc-xyz-0',
            quantity: 1,
            rowId: '0',
            discountInfos: [],
          },
        },
      ];
      expect(shouldShowOriginalPrice(discountInfos)).toBe(true);
    });

    test('with ProductDiscount type', () => {
      const discountInfos: DiscountInfo[] = [
        {
          discountType: 'ProductDiscount',
          resultOrderRow: {
            totalIncludingVat: -450,
            totalExcludingVat: -360,
            rowType: 'DISCOUNT',
            articleNumber: 'abc-xyz-0',
            quantity: 1,
            rowId: '0',
            discountInfos: [],
          },
        },
      ];
      expect(shouldShowOriginalPrice(discountInfos)).toBe(true);
    });
  });
  test('Should return false when product has not product discount', () => {
    const discountInfos: DiscountInfo[] = [
      {
        discountType: 'MixAndMatch',
        resultOrderRow: {
          totalIncludingVat: -100,
          totalExcludingVat: -80,
          rowType: 'DISCOUNT',
          articleNumber: 'abc-xyz-0',
          quantity: 1,
          rowId: '0',
          discountInfos: [],
        },
      },
    ];
    expect(shouldShowOriginalPrice(discountInfos)).toBe(false);
  });
});

describe('getMultipleDiscountInfoMap function', () => {
  test('Should return a map of a line item with "true" value when the line item has multiple discounts applied', () => {
    const productLineItems = generateCartLineItemData(1, 10, 2, true).rows;
    expect(getMultipleDiscountInfoMap(productLineItems)).toStrictEqual({
      'abc-xyz-0': true,
    });
  });
  test('Should return a map of a line item with "false" value when the line item has not multiple discounts applied', () => {
    const productLineItems = generateCartLineItemData(1, 10, 2, false).rows;
    expect(getMultipleDiscountInfoMap(productLineItems)).toStrictEqual({
      'abc-xyz-0': false,
    });
  });
});

describe('getOrderDiscounts function', () => {
  test('Should return only order discounts', () => {
    const discountInfos: DiscountInfo[] = [
      {
        discountType: 'BuyXGetCheapestDiscount',
        resultOrderRow: {
          totalIncludingVat: -100,
          totalExcludingVat: -80,
          rowType: 'DISCOUNT',
          articleNumber: 'abc-xyz-0',
          quantity: 1,
          rowId: '0',
          discountInfos: [],
        },
      },
      {
        discountType: 'ProductDiscount',
        resultOrderRow: {
          totalIncludingVat: -50,
          totalExcludingVat: -40,
          rowType: 'DISCOUNT',
          articleNumber: 'abc-xyz-1',
          quantity: 1,
          rowId: '1',
          discountInfos: [],
        },
      },
      {
        discountType: 'MixAndMatch',
        resultOrderRow: {
          totalIncludingVat: -75,
          totalExcludingVat: -60,
          rowType: 'DISCOUNT',
          articleNumber: 'abc-xyz-2',
          quantity: 1,
          rowId: '2',
          discountInfos: [],
        },
      },
    ];
    const result = getOrderDiscounts(discountInfos);
    expect(result).toHaveLength(2);
    expect(result[0].discountType).toBe('BuyXGetCheapestDiscount');
    expect(result[1].discountType).toBe('MixAndMatch');
  });

  test('Should return empty array when no order discounts present', () => {
    const discountInfos: DiscountInfo[] = [
      {
        discountType: 'ProductDiscount',
        resultOrderRow: {
          totalIncludingVat: -50,
          totalExcludingVat: -40,
          rowType: 'DISCOUNT',
          articleNumber: 'abc-xyz-1',
          quantity: 1,
          rowId: '1',
          discountInfos: [],
        },
      },
    ];
    expect(getOrderDiscounts(discountInfos)).toHaveLength(0);
  });
});

describe('calculateShippingDiscounts function', () => {
  test('Should calculate shipping discount for free delivery', () => {
    const shippingDiscount: OrderRow = {
      discountInfos: [
        {
          discountType: 'FreeDelivery',
          resultOrderRow: {
            totalIncludingVat: -100,
            totalExcludingVat: -80,
            rowType: 'DISCOUNT',
            articleNumber: 'shipping',
            quantity: 1,
            rowId: '0',
            discountInfos: [],
          },
        },
      ],
      totalIncludingVat: 100,
      totalExcludingVat: 80,
      rowType: 'SHIPPING',
      articleNumber: 'shipping',
      quantity: 1,
      rowId: '0',
    };

    const totalIncludingVat = calculateShippingDiscounts(shippingDiscount);
    expect(totalIncludingVat).toBe(100);

    const totalExcludingVat = calculateShippingDiscounts(
      shippingDiscount,
      false
    );
    expect(totalExcludingVat).toBe(80);
  });

  test('Should return 0 when no free delivery discount', () => {
    const shippingDiscount: OrderRow = {
      discountInfos: [],
      totalIncludingVat: 100,
      totalExcludingVat: 80,
      rowType: 'SHIPPING',
      articleNumber: 'shipping',
      quantity: 1,
      rowId: '0',
    };

    const totalIncludingVat = calculateShippingDiscounts(shippingDiscount);
    expect(totalIncludingVat).toBe(0);

    const totalExcludingVat = calculateShippingDiscounts(
      shippingDiscount,
      false
    );
    expect(totalExcludingVat).toBe(0);
  });

  test('Should return 0 when discount type is not FreeDelivery', () => {
    const shippingDiscount: OrderRow = {
      discountInfos: [
        {
          discountType: 'OrderDiscount', // Not FreeDelivery
          resultOrderRow: {
            totalIncludingVat: -100,
            totalExcludingVat: -80,
            rowType: 'DISCOUNT',
            articleNumber: 'shipping',
            quantity: 1,
            rowId: '0',
            discountInfos: [],
          },
        },
      ],
      totalIncludingVat: 100,
      totalExcludingVat: 80,
      rowType: 'SHIPPING',
      articleNumber: 'shipping',
      quantity: 1,
      rowId: '0',
    };

    const totalIncludingVat = calculateShippingDiscounts(shippingDiscount);
    expect(totalIncludingVat).toBe(0);

    const totalExcludingVat = calculateShippingDiscounts(
      shippingDiscount,
      false
    );
    expect(totalExcludingVat).toBe(0);
  });

  test('Should handle null or undefined shippingDiscount', () => {
    expect(calculateShippingDiscounts(null as unknown as OrderRow)).toBe(0);
    expect(calculateShippingDiscounts(undefined as unknown as OrderRow)).toBe(
      0
    );
  });
});

describe('calculateTotalProducts function', () => {
  test('Should calculate total products with discounts', () => {
    const products: OrderRow[] = [
      {
        totalIncludingVat: 1000,
        totalExcludingVat: 800,
        rowType: 'PRODUCT',
        articleNumber: 'product1',
        quantity: 1,
        rowId: '0',
        discountInfos: [
          {
            discountType: 'DiscountedProductPrice',
            resultOrderRow: {
              totalIncludingVat: -200,
              totalExcludingVat: -160,
              rowType: 'DISCOUNT',
              articleNumber: 'product1',
              quantity: 1,
              rowId: '0',
              discountInfos: [],
            },
          },
        ],
      },
      {
        totalIncludingVat: 500,
        totalExcludingVat: 400,
        rowType: 'PRODUCT',
        articleNumber: 'product2',
        quantity: 1,
        rowId: '1',
        discountInfos: [],
      },
    ];

    const totalIncludingVat = calculateTotalProducts(products);
    expect(totalIncludingVat).toBe(1300);

    const totalExcludingVat = calculateTotalProducts(products, false);
    expect(totalExcludingVat).toBe(1040);
  });

  test('Should calculate total products with no discounts', () => {
    const products: OrderRow[] = [
      {
        totalIncludingVat: 1000,
        totalExcludingVat: 800,
        rowType: 'PRODUCT',
        articleNumber: 'product1',
        quantity: 1,
        rowId: '0',
        discountInfos: [],
      },
      {
        totalIncludingVat: 500,
        totalExcludingVat: 400,
        rowType: 'PRODUCT',
        articleNumber: 'product2',
        quantity: 1,
        rowId: '1',
        discountInfos: [],
      },
    ];

    const totalIncludingVat = calculateTotalProducts(products);
    expect(totalIncludingVat).toBe(1500);

    const totalExcludingVat = calculateTotalProducts(products, false);
    expect(totalExcludingVat).toBe(1200);
  });

  test('Should return 0 for empty product array', () => {
    const products: OrderRow[] = [];

    const totalIncludingVat = calculateTotalProducts(products);
    expect(totalIncludingVat).toBe(0);

    const totalExcludingVat = calculateTotalProducts(products, false);
    expect(totalExcludingVat).toBe(0);
  });

  test('Should return 0 for free gift products', () => {
    const products: OrderRow[] = [
      {
        totalIncludingVat: 1000,
        totalExcludingVat: 800,
        rowType: 'PRODUCT',
        articleNumber: 'product1',
        quantity: 1,
        rowId: '0',
        discountInfos: [
          {
            discountType: 'FreeGift',
            resultOrderRow: {
              totalIncludingVat: -1000,
              totalExcludingVat: -800,
              rowType: 'DISCOUNT',
              articleNumber: 'product1',
              quantity: 1,
              rowId: '0',
              discountInfos: [],
            },
          },
        ],
      },
    ];

    const totalIncludingVat = calculateTotalProducts(products);
    expect(totalIncludingVat).toBe(0);

    const totalExcludingVat = calculateTotalProducts(products, false);
    expect(totalExcludingVat).toBe(0);
  });
});

describe('calculateTotalFees function', () => {
  test('Should calculate total fees correctly', () => {
    const fees: OrderRow[] = [
      {
        totalIncludingVat: 100,
        totalExcludingVat: 80,
        rowType: 'FEE',
        articleNumber: 'FEE-0',
        quantity: 1,
        rowId: '0',
        discountInfos: [],
      },
      {
        totalIncludingVat: 50,
        totalExcludingVat: 40,
        rowType: 'FEE',
        articleNumber: 'FEE-1',
        quantity: 1,
        rowId: '1',
        discountInfos: [],
      },
    ];

    const totalIncludingVat = calculateTotalFees(fees);
    expect(totalIncludingVat).toBe(150);

    const totalExcludingVat = calculateTotalFees(fees, false);
    expect(totalExcludingVat).toBe(120);
  });

  test('Should return zero with empty data', () => {
    const fees: OrderRow[] = [];

    const totalIncludingVat = calculateTotalFees(fees);
    expect(totalIncludingVat).toBe(0);

    const totalExcludingVat = calculateTotalFees(fees, false);
    expect(totalExcludingVat).toBe(0);
  });
});

describe('getVatSelector function', () => {
  test('Should return IncludingVat when includingVat is not provided (default value)', () => {
    expect(getVatSelector(undefined as unknown as boolean)).toBe(
      'IncludingVat'
    );
  });

  test('Should return IncludingVat when includingVat is true', () => {
    expect(getVatSelector(true)).toBe('IncludingVat');
  });

  test('Should return ExcludingVat when includingVat is false', () => {
    expect(getVatSelector(false)).toBe('ExcludingVat');
  });
});

describe('getProductDiscounts function', () => {
  test('Should return only product discounts', () => {
    const discountInfos: DiscountInfo[] = [
      {
        discountType: 'DiscountedProductPrice',
        resultOrderRow: {
          totalIncludingVat: -200,
          totalExcludingVat: -160,
          rowType: 'DISCOUNT',
          articleNumber: 'product1',
          quantity: 1,
          rowId: '0',
          discountInfos: [],
        },
      },
      {
        discountType: 'ProductDiscount',
        resultOrderRow: {
          totalIncludingVat: -150,
          totalExcludingVat: -120,
          rowType: 'DISCOUNT',
          articleNumber: 'product2',
          quantity: 1,
          rowId: '1',
          discountInfos: [],
        },
      },
      {
        discountType: 'MixAndMatch',
        resultOrderRow: {
          totalIncludingVat: -75,
          totalExcludingVat: -60,
          rowType: 'DISCOUNT',
          articleNumber: 'product3',
          quantity: 1,
          rowId: '2',
          discountInfos: [],
        },
      },
      {
        discountType: 'OrderDiscount',
        resultOrderRow: {
          totalIncludingVat: -100,
          totalExcludingVat: -80,
          rowType: 'DISCOUNT',
          articleNumber: 'product4',
          quantity: 1,
          rowId: '3',
          discountInfos: [],
        },
      },
    ];

    const result = getProductDiscounts(discountInfos);
    expect(result).toHaveLength(2);
    expect(result[0].discountType).toBe('DiscountedProductPrice');
    expect(result[1].discountType).toBe('ProductDiscount');
  });

  test('Should return empty array when no product discounts present', () => {
    const discountInfos: DiscountInfo[] = [
      {
        discountType: 'MixAndMatch',
        resultOrderRow: {
          totalIncludingVat: -75,
          totalExcludingVat: -60,
          rowType: 'DISCOUNT',
          articleNumber: 'product1',
          quantity: 1,
          rowId: '0',
          discountInfos: [],
        },
      },
      {
        discountType: 'OrderDiscount',
        resultOrderRow: {
          totalIncludingVat: -100,
          totalExcludingVat: -80,
          rowType: 'DISCOUNT',
          articleNumber: 'product2',
          quantity: 1,
          rowId: '1',
          discountInfos: [],
        },
      },
    ];

    expect(getProductDiscounts(discountInfos)).toHaveLength(0);
  });
});

describe('calculateProductRowDiscount function', () => {
  test('Should return 0 for free gift products', () => {
    const product: OrderRow = {
      totalIncludingVat: 1000,
      totalExcludingVat: 800,
      rowType: 'PRODUCT',
      articleNumber: 'product1',
      quantity: 1,
      rowId: '0',
      discountInfos: [
        {
          discountType: 'FreeGift',
          resultOrderRow: {
            totalIncludingVat: -1000,
            totalExcludingVat: -800,
            rowType: 'DISCOUNT',
            articleNumber: 'product1',
            quantity: 1,
            rowId: '0',
            discountInfos: [],
          },
        },
      ],
    };

    const totalIncludingVat = calculateProductRowDiscount(product);
    expect(totalIncludingVat).toBe(0);

    const totalExcludingVat = calculateProductRowDiscount(product, false);
    expect(totalExcludingVat).toBe(0);
  });

  test('Should return the product price with product discount applied', () => {
    const product: OrderRow = {
      totalIncludingVat: 1000,
      totalExcludingVat: 800,
      rowType: 'PRODUCT',
      articleNumber: 'product1',
      quantity: 1,
      rowId: '0',
      discountInfos: [
        {
          discountType: 'DiscountedProductPrice',
          resultOrderRow: {
            totalIncludingVat: -200,
            totalExcludingVat: -160,
            rowType: 'DISCOUNT',
            articleNumber: 'product1',
            quantity: 1,
            rowId: '0',
            discountInfos: [],
          },
        },
      ],
    };

    const totalIncludingVat = calculateProductRowDiscount(product);
    expect(totalIncludingVat).toBe(800);

    const totalExcludingVat = calculateProductRowDiscount(product, false);
    expect(totalExcludingVat).toBe(640);
  });

  test('Should return the original product price when no discounts are applied', () => {
    const product: OrderRow = {
      totalIncludingVat: 1000,
      totalExcludingVat: 800,
      rowType: 'PRODUCT',
      articleNumber: 'product1',
      quantity: 1,
      rowId: '0',
      discountInfos: [],
    };

    const totalIncludingVat = calculateProductRowDiscount(product);
    expect(totalIncludingVat).toBe(1000);

    const totalExcludingVat = calculateProductRowDiscount(product, false);
    expect(totalExcludingVat).toBe(800);
  });

  test('Should handle multiple product discounts correctly', () => {
    const product: OrderRow = {
      totalIncludingVat: 1000,
      totalExcludingVat: 800,
      rowType: 'PRODUCT',
      articleNumber: 'product1',
      quantity: 1,
      rowId: '0',
      discountInfos: [
        {
          discountType: 'DiscountedProductPrice',
          resultOrderRow: {
            totalIncludingVat: -200,
            totalExcludingVat: -160,
            rowType: 'DISCOUNT',
            articleNumber: 'product1',
            quantity: 1,
            rowId: '0',
            discountInfos: [],
          },
        },
        {
          discountType: 'ProductDiscount',
          resultOrderRow: {
            totalIncludingVat: -100,
            totalExcludingVat: -80,
            rowType: 'DISCOUNT',
            articleNumber: 'product1',
            quantity: 1,
            rowId: '1',
            discountInfos: [],
          },
        },
      ],
    };

    const totalIncludingVat = calculateProductRowDiscount(product);
    expect(totalIncludingVat).toBe(700);

    const totalExcludingVat = calculateProductRowDiscount(product, false);
    expect(totalExcludingVat).toBe(560);
  });
});
