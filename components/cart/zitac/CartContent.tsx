'use client';
import Currency from 'components/Currency';
import Link from 'components/Link';
import CheckoutDiscountCodes from 'components/checkout/zitac/CheckoutDiscountCodes';
import { Text } from 'components/elements/Text';
import { CartContext } from 'contexts/cartContext';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { DiscountInfo } from 'models/cart';
import { OrderRow } from 'models/order';
import { Fragment, useContext } from 'react';
import {
  calculateShippingDiscounts,
  calculateTotalDiscounts,
  calculateTotalProducts,
  getMultipleDiscountInfoMap,
  getOrderDiscounts,
  getVatSelector,
} from 'services/discountService';
import { DiscountType } from 'utils/constants';
import { getIsB2B } from 'utils/isB2B';
import CartLineItem from './CartLineItem';
import CartLineItemOrderConfirmationB2B from './CartLineItemOrderConfirmation.b2b';
import CartLineItemOrderConfirmationB2C from './CartLineItemOrderConfirmation.b2c';

/**
 * Renders cart's content.
 * @param showDiscountCode a flag to show/hide cart discount code
 * @param showCostDetails a flag to show/hide cost details
 * @param rows a list of order row
 * @param updatable a flag to indicate that the item count can be updated
 * @param onClose an event occurs when clicking the keep shopping button
 */
function CartContent({
  showDiscountCode = false,
  showCostDetails = true,
  updatable = true,
  showLineComment = false,
  rows,
  discountInfos = [],
  totalVat = 0,
  onClose = () => {},
}: {
  showDiscountCode?: boolean;
  showCostDetails?: boolean;
  updatable?: boolean;
  showLineComment?: boolean;
  rows: OrderRow[];
  discountInfos?: DiscountInfo[];
  totalVat?: number;
  onClose?: () => void;
}) {
  const { showPricesIncludingVat: includingVat } = useContext(CartContext).cart;
  const website = useContext(WebsiteContext);
  const vatSelector = getVatSelector(includingVat);
  const productLineItems = rows.filter((item) => item.rowType === 'PRODUCT');
  const totalProductPrice = calculateTotalProducts(
    productLineItems,
    includingVat
  );
  const shippingFeeLine = rows.filter(
    (item) => item.rowType === 'SHIPPING_FEE'
  );
  const feeLines = rows.filter((item) => item.rowType === 'FEE');
  const taxLines = rows.filter((item) => item.rowType === 'TAX');
  const multipleDiscountInfoMap = getMultipleDiscountInfoMap(productLineItems);
  const isEmptyCart = productLineItems?.length === 0;
  const t = useTranslations();
  const homePageUrl = website.homePageUrl || '/';
  const orderDiscountLines = getOrderDiscounts(discountInfos);
  const totalOrderDiscount = Math.abs(
    calculateTotalDiscounts(orderDiscountLines, includingVat)
  );
  const productsSubtotal = Math.max(0, totalProductPrice - totalOrderDiscount);

  if (isEmptyCart) {
    return (
      <div
        className="mt-10 flex flex-col items-center gap-y-8"
        data-testid="cart-content__empty-cart"
      >
        <Text>{t('cartcontent.empty')}</Text>
        <Link
          href={homePageUrl || ''}
          className="button rounded px-9"
          data-testid="cart-content__keep-shopping"
          onClick={onClose}
        >
          {t('cartcontent.button.keepshopping')}
        </Link>
      </div>
    );
  }
  const isB2B = getIsB2B(website);
  const LineItemComponent = updatable
    ? CartLineItem
    : isB2B
      ? CartLineItemOrderConfirmationB2B
      : CartLineItemOrderConfirmationB2C;

  return (
    <Fragment>
      {productLineItems.map((item) => (
        <LineItemComponent
          item={item}
          asterisk={multipleDiscountInfoMap[item.articleNumber]}
          key={`cartItem-${item.articleNumber}`}
          updatable={
            updatable &&
            item.discountInfos[0]?.discountType !== DiscountType.FreeGift
          }
          includingVat={includingVat}
          rows={rows}
          showLineComment={showLineComment}
        />
      ))}
      {showDiscountCode && <CheckoutDiscountCodes></CheckoutDiscountCodes>}
      {showCostDetails && (
        <div data-testid={`cart-content__cost-details`}>
          {orderDiscountLines?.map((item: DiscountInfo) => (
            <div
              key={item.resultOrderRow.rowId}
              className="my-2 flex justify-between text-sm"
            >
              <Text
                data-testid={`cart-content__discount-name-${item.resultOrderRow.rowId}`}
              >
                {item.resultOrderRow.description ||
                  t('cartcontent.discounts.title')}
              </Text>
              <Currency
                data-testid={`cart-content__discount-price-${item.resultOrderRow.rowId}`}
                className="text-red-600 whitespace-nowrap"
                price={item.resultOrderRow[`total${vatSelector}`]}
              />
            </div>
          ))}
          {(shippingFeeLine?.length > 0 ||
            feeLines?.length > 0 ||
            !includingVat) && (
            <div className="my-2 flex flex-wrap justify-between text-lg">
              <Text className="font-bold">
                {t('cartcontent.productsSubtotal.title')}
              </Text>
              <Currency
                data-testid="cart-content__subtotal"
                price={productsSubtotal}
              />
            </div>
          )}
          {shippingFeeLine?.map((item: OrderRow) => {
            const shippingPrice = item[`total${vatSelector}`];
            const shippingDiscount = calculateShippingDiscounts(
              item,
              includingVat
            );

            return (
              <div
                key={item.rowId}
                className="my-2 flex justify-between text-sm"
              >
                <Text data-testid={`cart-content__shipping-name-${item.rowId}`}>
                  {item.description || t('cartcontent.shippingfee.title')}
                </Text>
                <div className="text-end">
                  <Currency
                    data-testid={`cart-content__shipping-price-${item.rowId}`}
                    className="whitespace-nowrap"
                    price={Math.max(0, shippingPrice - shippingDiscount)}
                  />
                  {shippingDiscount > 0 && (
                    <Currency
                      data-testid={`cart-content__shipping-discount-${item.rowId}`}
                      className="whitespace-nowrap text-[10px] text-tertiary"
                      strikethrough
                      price={
                        shippingDiscount > shippingPrice
                          ? shippingPrice
                          : shippingDiscount
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}
          {feeLines.map((item: OrderRow) => (
            <div key={item.rowId} className="my-2 flex justify-between text-sm">
              <Text data-testid={`cart-content__fee-name-${item.rowId}`}>
                {item.description || t('cartcontent.handlingfee.title')}
              </Text>
              <Currency
                className="whitespace-nowrap"
                price={item[`total${vatSelector}`]}
                data-testid={`cart-content__fee-price-${item.rowId}`}
              />
            </div>
          ))}
          {taxLines.map((item: OrderRow) => (
            <div key={item.rowId} className="my-2 flex justify-between text-sm">
              <Text data-testid={`cart-content__tax-name-${item.rowId}`}>
                {item.description || t('cartcontent.handlingtax.title')}
              </Text>
              <Currency
                className="whitespace-nowrap"
                price={item[`total${vatSelector}`]}
                data-testid={`cart-content__tax-price-${item.rowId}`}
              />
            </div>
          ))}
          {!includingVat && (
            <div className="my-2 flex flex-wrap justify-between text-sm">
              <Text>{t('cartcontent.vat.title')}</Text>
              <Currency data-testid="cart-content__vat" price={totalVat} />
            </div>
          )}
        </div>
      )}
    </Fragment>
  );
}

export default CartContent;
