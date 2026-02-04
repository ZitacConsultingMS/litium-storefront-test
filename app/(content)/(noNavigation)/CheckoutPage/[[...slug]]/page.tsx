'use client';
import Link from 'components/Link';
import CheckoutCart from 'components/checkout/CheckoutCart';
import CheckoutHeader from 'components/checkout/CheckoutHeader';
import CheckoutWizard from 'components/checkout/CheckoutWizard';
import { Heading2 } from 'components/elements/Heading';
import { Text } from 'components/elements/Text';
import { CartContext } from 'contexts/cartContext';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { Fragment, useContext } from 'react';

export default function Page({ params }: { params: any }) {
  const productCount = useContext(CartContext).cart.productCount;
  const homePageUrl = useContext(WebsiteContext).homePageUrl;
  const t = useTranslations();
  return (
    <div className="container mx-auto px-5">
      <CheckoutHeader />
      {productCount > 0 ? (
        <div className="mt-10 flex flex-col justify-center gap-x-20 gap-y-5 lg:flex-row">
          <div className="w-full lg:order-1 lg:w-96">
            <CheckoutCart />
            <div className="mt-5 hidden text-center lg:block">
              <CheckoutSupport />
            </div>
          </div>
          <div className="lg:order-0 w-full lg:w-96">
            <CheckoutWizard />
          </div>
          <div className="text-center lg:hidden">
            <CheckoutSupport />
          </div>
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center gap-y-8">
          <Heading2>{t('checkoutpage.cart.heading')}</Heading2>
          <Text>{t('checkoutpage.cart.empty')}</Text>
          <Link href={homePageUrl || '/'} className="button rounded px-9">
            {t('checkoutpage.cart.keepshoping')}
          </Link>
        </div>
      )}
    </div>
  );
}

const CheckoutSupport = () => {
  const t = useTranslations();
  return (
    <Fragment>
      <Text className="mb-2 text-lg font-bold">
        {t('checkoutpage.support.title')}
      </Text>
      <Text className="text-sm">{t('checkoutpage.support.description')}</Text>
    </Fragment>
  );
};
