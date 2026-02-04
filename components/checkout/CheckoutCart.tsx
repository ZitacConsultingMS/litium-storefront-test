'use client';
import CartContent from 'components/cart/CartContent';
import { Button } from 'components/elements/Button';
import { Heading2 } from 'components/elements/Heading';
import { Text } from 'components/elements/Text';
import FormattedPrice from 'components/FormattedPrice';
import { CartContext } from 'contexts/cartContext';
import { useTranslations } from 'hooks/useTranslations';
import { ChevronDown } from 'lucide-react';
import { Fragment, useContext, useState } from 'react';

/**
 * Renders cart's information of checkout page.
 */
function CheckoutCart() {
  const cartContext = useContext(CartContext);
  const { rows, discountInfos, grandTotal, totalVat } = cartContext.cart;
  const [showCartContent, setShowCartContent] = useState(true);
  const t = useTranslations();

  return (
    <Fragment>
      <div className="mb-4 flex justify-between">
        <Heading2>{t('checkoutcart.title')}</Heading2>
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
          <ChevronDown className="h-8 w-8 text-[#333]" />
        </Button>
      </div>
      {showCartContent && (
        <div data-testid="cart__content">
          <CartContent
            rows={rows}
            showDiscountCode={true}
            discountInfos={discountInfos}
            totalVat={totalVat}
          ></CartContent>
          <div className="mb-3 flex justify-between text-lg">
            <Text className="font-bold">{t('checkoutcart.total')}</Text>
            <FormattedPrice
              data-testid="cart__grand-total"
              price={grandTotal}
            />
          </div>
        </div>
      )}
    </Fragment>
  );
}

export default CheckoutCart;
