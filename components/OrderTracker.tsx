'use client';
import { Order, OrderRow } from 'models/order';
import { Fragment, useEffect, useRef } from 'react';
import {
  calculateTotalDiscounts,
  shouldShowOriginalPrice,
} from 'services/discountService';
import { DiscountType } from 'utils/constants';
import { trackEvent } from './TrackingManager';

/**
 * Represents a client component to monitor the user's order placement activity.
 * The `trackOrderPlaced` function should be invoked once when rendering the component,
 * or when the input `orderDetails` is changed.
 * @param orderDetails the order detail.
 */
export default function OrderTracker({
  orderDetails,
}: {
  orderDetails: Order;
}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      trackOrderPlaced(orderDetails);
      initialized.current = true;
    }
  }, [orderDetails]);
  return <Fragment></Fragment>;
}

/**
 * Sends order placement event.
 * @param orderDetails the order detail.
 */
export const trackOrderPlaced = (orderDetails: Order) => {
  const productLineItems = orderDetails.rows.filter(
    (item: OrderRow) => item.rowType === 'PRODUCT'
  );
  const shippingFeeLine = orderDetails.rows.filter(
    (item) => item.rowType === 'SHIPPING_FEE'
  );
  const totalShippingFees = shippingFeeLine.reduce(
    (acc, shippingFee) => acc + shippingFee.totalIncludingVat,
    0
  );
  const feeLines = orderDetails.rows.filter((item) => item.rowType === 'FEE');
  const totalFees = feeLines.reduce(
    (acc, fee) => acc + fee.totalIncludingVat,
    0
  );
  const list = productLineItems.map((item: OrderRow) => {
    let unitPrice = item.totalIncludingVat;
    if (item.discountInfos) {
      if (
        item.discountInfos.length > 0 &&
        item.discountInfos[0].discountType === DiscountType.FreeGift
      ) {
        unitPrice = 0;
      } else if (shouldShowOriginalPrice(item.discountInfos)) {
        const totalDiscountsPrice = calculateTotalDiscounts(item.discountInfos);
        unitPrice = item.totalIncludingVat + totalDiscountsPrice;
      }
    }
    return {
      sku: item.articleNumber,
      name: item.product?.name,
      price: unitPrice,
      quantity: item.quantity,
    };
  });

  const gtmOrder = {
    transactionId: orderDetails.orderNumber,
    transactionTotal: orderDetails.grandTotal,
    transactionTax: orderDetails.totalVat,
    transactionShipping: totalShippingFees,
    transactionFees: totalFees,
    transactionProducts: list,
  };

  return trackEvent({ gtmOrder });
};
