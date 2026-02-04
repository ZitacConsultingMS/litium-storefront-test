'use client';
import Currency from 'components/Currency';
import { Heading1 } from 'components/elements/Heading';
import { CartContext } from 'contexts/cartContext';
import { useTranslations } from 'hooks/useTranslations';
import { useContext } from 'react';

/**
 * Renders header of checkout page.
 */

function CheckoutHeader() {
  const cartContext = useContext(CartContext);
  const { productCount, grandTotal } = cartContext.cart;
  const t = useTranslations();
  return (
    <div className="text-center">
      <Heading1 className="mb-2 text-2xl">{t('checkoutheader.title')}</Heading1>
      {!!productCount && (
        <div
          className="text-sm font-normal text-tertiary"
          data-testid="header__info"
        >
          {`${productCount} ${
            productCount > 1
              ? `${t('checkoutheader.products')}${' '}`
              : `${t('checkoutheader.product')}${' '}`
          }`}
          <Currency className="inline-block" price={grandTotal} />
        </div>
      )}
    </div>
  );
}

export default CheckoutHeader;
