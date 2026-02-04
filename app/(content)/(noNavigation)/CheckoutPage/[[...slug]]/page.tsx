'use client';
import Link from 'components/Link';
import B2BReferenceFields from 'components/checkout/b2b/B2BReferenceFields';
import CheckoutWizardB2B from 'components/checkout/b2b/CheckoutWizard';
import CheckoutCart from 'components/checkout/zitac/CheckoutCart';
import CheckoutHeader from 'components/checkout/zitac/CheckoutHeader';
import CheckoutWizardB2C from 'components/checkout/zitac/CheckoutWizard';
import HelloRetailCheckoutRecommendations from 'components/checkout/zitac/HelloRetailCheckoutRecommendations';
import { Heading2 } from 'components/elements/Heading';
import { Text } from 'components/elements/Text';
import { CartContext } from 'contexts/cartContext';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { Fragment, useContext, useState } from 'react';
import { getIsB2B } from 'utils/isB2B';

export default function Page({ params }: { params: any }) {
  const productCount = useContext(CartContext).cart.productCount;
  const website = useContext(WebsiteContext);
  const homePageUrl = website.homePageUrl;
  const t = useTranslations();
  const [orderReferens, setOrderReferens] = useState('');
  const [erReferens, setErReferens] = useState('');

  const isB2B = getIsB2B(website);
  const WizardComponent = isB2B ? CheckoutWizardB2B : CheckoutWizardB2C;
  return (
    <div className="container mx-auto px-5">
      <CheckoutHeader />
      {productCount > 0 ? (
        isB2B ? (
          <div className="mt-10 flex flex-col gap-y-5">
            <div className="rounded-lg bg-white p-6">
              <B2BReferenceFields
                orderReferens={orderReferens}
                erReferens={erReferens}
                onOrderReferensChange={setOrderReferens}
                onErReferensChange={setErReferens}
                required
              />
            </div>
            <div className="rounded-lg bg-white p-6 pb-8">
              <CheckoutCart />
            </div>
            <div className="rounded-lg bg-white p-6">
              <WizardComponent
                orderReferens={orderReferens}
                erReferens={erReferens}
              />
            </div>
          </div>
        ) : (
          <div className="mt-10 flex flex-col justify-center gap-x-8 gap-y-5 lg:flex-row">
            <div className="flex h-fit w-full flex-col lg:order-1 lg:max-w-[450px]">
              <div className="rounded-lg bg-white p-6 pb-8">
                <CheckoutCart />
              </div>
              <div className="mt-5 hidden rounded-lg bg-white p-6 pb-8 text-center lg:block">
                <CheckoutSupport />
              </div>
              <div className="mt-5 overflow-visible rounded-lg bg-white px-6 pb-3 pt-6 lg:max-w-[450px]">
                <div className="rounded bg-body-background p-4">
                  <HelloRetailCheckoutRecommendations
                    recomBoxId="k68ef87ecd4274aa691b7c53b"
                    title={t('checkoutpage.helloretail.title')}
                    slidesPerViewBreakpoints={{
                      320: 1.6,
                      768: 2.4,
                      1024: 1.6,
                      default: 1.6,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="lg:order-0 h-fit w-full rounded-lg bg-white p-6 lg:max-w-[660px]">
              <WizardComponent />
            </div>
            <div className="rounded-lg bg-white p-6 pb-8 text-center lg:hidden">
              <CheckoutSupport />
            </div>
          </div>
        )
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
