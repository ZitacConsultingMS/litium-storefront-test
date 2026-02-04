'use client';
import CartContent from 'components/cart/zitac/CartContent';
import Currency from 'components/Currency';
import { Heading2 } from 'components/elements/Heading';
import { Text } from 'components/elements/Text';
import { CartContext } from 'contexts/cartContext';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { Fragment, useContext, useState } from 'react';
import { getIsB2B } from 'utils/isB2B';

/**
 * Renders cart's information of checkout page.
 */
function CheckoutCart() {
  const cartContext = useContext(CartContext);
  const website = useContext(WebsiteContext);
  const { rows, discountInfos, grandTotal, totalVat } = cartContext.cart;
  const [showCartContent, setShowCartContent] = useState(true);
  const t = useTranslations();
  const isB2B = getIsB2B(website);

  return (
    <Fragment>
      <div className="mb-4 flex justify-between">
        <Heading2 className="text-2xl">{t('checkoutcart.title')}</Heading2>
        {/*
        <Button
          className="h-6 w-6 !border-0 !bg-transparent p-0 text-primary lg:hidden"
          aria-label={
            showCartContent
              ? t('checkoutcart.collapsecartcontent')
              : t('checkoutcart.expandcartcontent')
          }
          onClick={() => setShowCartContent(!showCartContent)}
          data-testid="cart__toggle"
        >
          <CaretDown />
        </Button>
        */}
      </div>
      {showCartContent && (
        <div data-testid="cart__content">
          <CartContent
            rows={rows}
            showDiscountCode={true}
            discountInfos={discountInfos}
            totalVat={totalVat}
            showLineComment={isB2B}
          />
          <div className="mb-3 flex justify-between text-lg">
            <Text className="font-bold">{t('checkoutcart.total')}</Text>
            <Currency data-testid="cart__grand-total" price={grandTotal} />
          </div>
        </div>
      )}
    </Fragment>
  );
}

export default CheckoutCart;
