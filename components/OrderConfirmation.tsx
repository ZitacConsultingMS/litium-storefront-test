'use client';
import Link from 'components/Link';
import { useTranslations } from 'hooks/useTranslations';
import { OrderAddress } from 'models/address';
import { DiscountInfo } from 'models/cart';
import { OrderRow } from 'models/order';
import { Fragment, useEffect } from 'react';
import Currency from './Currency';
import CartContent from './cart/CartContent';
import { Heading1 } from './elements/Heading';
import { Text } from './elements/Text';

function OrderConfirmation({
  receipt,
  myPagesPageUrl,
  orderHistoryPageUrl,
  isLogged,
}: {
  receipt: {
    rows: OrderRow[];
    discountInfos: DiscountInfo[];
    shippingAddress: OrderAddress;
    orderNumber: string;
    grandTotal: number;
    totalVat: number;
    customerDetails: {
      email: string;
      phone: string;
    };
  };
  myPagesPageUrl: string;
  orderHistoryPageUrl: string;
  isLogged: boolean;
}) {
  const t = useTranslations();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);
  const {
    shippingAddress,
    rows,
    discountInfos,
    grandTotal,
    totalVat,
    orderNumber,
    customerDetails,
  } = receipt;
  return (
    <Fragment>
      <Heading1 className="mt-14" data-testid="order-confirmation__title">
        {t('orderconfirmation.title')} {orderNumber}
      </Heading1>
      <Text className="mt-2" data-testid="order-confirmation__sayhi">
        {t('orderconfirmation.sayhi')} {shippingAddress?.firstName},
      </Text>
      <Text className="mt-2" data-testid="order-confirmation__thankyou">
        {t('orderconfirmation.thankyou')} {orderNumber}
      </Text>
      <section className="mt-14">
        <Text className="font-bold">
          {t('orderconfirmation.deliveryaddress.title')}
        </Text>
        <Text className="mt-2" data-testid="order-confirmation__name-customer">
          {shippingAddress?.firstName} {shippingAddress?.lastName}
        </Text>
        <Text className="mt-2" data-testid="order-confirmation__address1">
          {shippingAddress?.address1}
        </Text>
        <Text className="mt-2" data-testid="order-confirmation__zipCode">
          {shippingAddress?.zipCode}
        </Text>
        <Text className="mt-2" data-testid="order-confirmation__city">
          {shippingAddress?.city}
        </Text>
        <Text className="mt-2" data-testid="order-confirmation__country">
          {shippingAddress?.country}
        </Text>
      </section>
      <section className="mt-14">
        <Text className="font-bold">
          {t('orderconfirmation.contactinfo.title')}
        </Text>
        <Text className="mt-2" data-testid="order-confirmation__email">
          {customerDetails?.email}
        </Text>
        <Text className="mt-2" data-testid="order-confirmation__phone">
          {customerDetails?.phone}
        </Text>
      </section>
      <section className="mt-14">
        <Text
          className="font-bold"
          data-testid="order-confirmation__order-number"
        >
          {t('orderconfirmation.ordernumber')} {orderNumber}
        </Text>
        <CartContent
          rows={rows}
          updatable={false}
          discountInfos={discountInfos}
          totalVat={totalVat}
        />
        <div className="my-2 flex justify-between font-bold">
          <Text inline={true}>{t('orderconfirmation.total.title')}</Text>
          <Currency
            price={grandTotal}
            data-testid="order-confirmation__grand-total"
          />
        </div>
      </section>
      <section className="mt-14">
        <Text>{t('orderconfirmation.anyquestions')}</Text>
        {isLogged ? (
          <Link
            className="mx-auto my-2 block w-72 rounded-md bg-secondary p-4 text-center text-secondary"
            href={orderHistoryPageUrl || '/'}
            data-testid="order-confirmation__order-history-url"
          >
            {t('orderconfirmation.orderhistory')}
          </Link>
        ) : (
          <Link
            className="mx-auto my-2 block w-72 rounded-md bg-secondary p-4 text-center text-secondary"
            href={myPagesPageUrl || '/'}
            data-testid="order-confirmation__my-pages-url"
          >
            {t('orderconfirmation.mypages')}
          </Link>
        )}
      </section>
    </Fragment>
  );
}

export default OrderConfirmation;
