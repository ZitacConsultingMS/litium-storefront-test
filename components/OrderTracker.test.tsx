import { render } from '@testing-library/react';
import { Order, OrderRow } from 'models/order';
import { DiscountType } from 'utils/constants';
import OrderTracker, { trackOrderPlaced } from './OrderTracker';
import { trackEvent } from './TrackingManager';

jest.mock('./TrackingManager', () => ({
  trackEvent: jest.fn(),
}));

describe('OrderTracker component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const mockOrder: Order = {
    orderNumber: '12345',
    grandTotal: 1000,
    totalVat: 200,
    rows: [
      {
        rowType: 'PRODUCT',
        articleNumber: 'A1',
        product: { name: 'Product A' },
        totalIncludingVat: 500,
        quantity: 1,
      } as OrderRow,
      { rowType: 'SHIPPING_FEE', totalIncludingVat: 15 } as OrderRow,
      { rowType: 'SHIPPING_FEE', totalIncludingVat: 30 } as OrderRow,
      { rowType: 'SHIPPING_FEE', totalIncludingVat: 5 } as OrderRow,
      { rowType: 'FEE', totalIncludingVat: 20 } as OrderRow,
      { rowType: 'FEE', totalIncludingVat: 10 } as OrderRow,
    ],
    status: '',
    orderDate: new Date(),
    tags: [],
    id: '',
  };

  test('should calculate gtmOrder correctly and send event', () => {
    trackOrderPlaced(mockOrder);
    const expectedData = {
      transactionId: '12345',
      transactionTotal: 1000,
      transactionTax: 200,
      transactionShipping: 50,
      transactionFees: 30,
      transactionProducts: [
        { sku: 'A1', name: 'Product A', price: 500, quantity: 1 },
      ],
    };
    expect(trackEvent).toHaveBeenCalledWith({ gtmOrder: expectedData });
  });

  test('should not call trackOrderPlaced on re-renders', () => {
    const { rerender } = render(<OrderTracker orderDetails={mockOrder} />);
    expect(trackEvent).toHaveBeenCalledTimes(1);
    rerender(<OrderTracker orderDetails={mockOrder} />);
    expect(trackEvent).toHaveBeenCalledTimes(1);
  });

  test('should include product discount', () => {
    trackOrderPlaced({
      ...mockOrder,
      grandTotal: 1450,
      rows: [
        ...mockOrder.rows,
        {
          rowType: 'PRODUCT',
          articleNumber: 'B',
          product: { name: 'Product B' },
          totalIncludingVat: 500,
          quantity: 1,
          discountInfos: [
            {
              discountType: DiscountType.DiscountedProductPrice,
              resultOrderRow: {
                totalIncludingVat: -50,
              },
            },
          ],
        } as OrderRow,
      ],
    });
    const expectedData = {
      transactionId: '12345',
      transactionTotal: 1450,
      transactionTax: 200,
      transactionShipping: 50,
      transactionFees: 30,
      transactionProducts: [
        { sku: 'A1', name: 'Product A', price: 500, quantity: 1 },
        { sku: 'B', name: 'Product B', price: 450, quantity: 1 },
      ],
    };
    expect(trackEvent).toHaveBeenCalledWith({ gtmOrder: expectedData });
  });

  test('should handle free gift as 0 price product', () => {
    trackOrderPlaced({
      ...mockOrder,
      rows: [
        ...mockOrder.rows,
        {
          rowType: 'PRODUCT',
          articleNumber: 'B',
          product: { name: 'Product B' },
          totalIncludingVat: 500,
          quantity: 1,
          discountInfos: [
            {
              discountType: DiscountType.FreeGift,
            },
          ],
        } as OrderRow,
      ],
    });
    const expectedData = {
      transactionId: '12345',
      transactionTotal: 1000,
      transactionTax: 200,
      transactionShipping: 50,
      transactionFees: 30,
      transactionProducts: [
        { sku: 'A1', name: 'Product A', price: 500, quantity: 1 },
        { sku: 'B', name: 'Product B', price: 0, quantity: 1 },
      ],
    };
    expect(trackEvent).toHaveBeenCalledWith({ gtmOrder: expectedData });
  });
});
