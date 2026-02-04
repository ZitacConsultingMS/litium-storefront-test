'use client';
import clsx from 'clsx';
import Currency from 'components/Currency';
import Link from 'components/Link';
import { Button } from 'components/elements/Button';
import { Text } from 'components/elements/Text';
import Cart from 'components/icons/cart';
import Close from 'components/icons/close';
import { CartContext } from 'contexts/cartContext';
import { useTranslations } from 'hooks/useTranslations';
import { Fragment, useCallback, useContext, useState } from 'react';
import { calculateTotalProducts } from 'services/discountService';
import Sidebar from '../Sidebar';
import CartContent from './CartContent';

/**
 * Renders a mini cart's information.
 */
function MiniCart({ checkoutPageUrl }: { checkoutPageUrl: string }) {
  const [showCartInfo, setShowCartInfo] = useState(false);
  const onClose = useCallback(() => setShowCartInfo(false), [setShowCartInfo]);
  const cartContext = useContext(CartContext);
  const { rows, productCount, discountInfos, showPricesIncludingVat } =
    cartContext.cart;
  const t = useTranslations();
  const productLineItems = rows.filter((item) => item.rowType === 'PRODUCT');
  const totalInMiniCart = calculateTotalProducts(
    productLineItems,
    showPricesIncludingVat
  );

  return (
    <Fragment>
      <Button
        className="relative !border-0 !bg-transparent p-0 text-primary"
        onClick={() => setShowCartInfo(true)}
        aria-label={t('minicart.title')}
      >
        <Cart data-testid="mini-cart__bag" />
        {productCount ? <Badge count={productCount} /> : ''}
      </Button>
      <Sidebar
        visible={showCartInfo}
        onClose={onClose}
        className="flex flex-col overflow-auto sm:w-[400px]"
        data-testid="mini-cart__sidebar"
        fullscreen={true}
        blockScroll={true}
      >
        {/* header sidebar */}
        <div className="flex items-center justify-between">
          <Text inline={true} className="text-lg sm:text-2xl">
            {t('minicart.title')}
          </Text>
          <Button
            className="!border-0 !bg-transparent p-0 text-primary"
            onClick={onClose}
            aria-label={t('minicart.closecart')}
          >
            <Close />
          </Button>
        </div>
        {/* body sidebar */}
        <div className="my-5 flex-1">
          <CartContent
            onClose={onClose}
            rows={rows}
            discountInfos={discountInfos}
            showCostDetails={false}
          ></CartContent>
        </div>
        {/* footer sidebar */}
        <div className="sticky -bottom-5 -my-5 bg-primary pb-5">
          <div className="mb-3 flex justify-between">
            <Text inline={true}>{t('minicart.total')}</Text>
            <Currency price={totalInMiniCart} />
          </div>
          <Link
            href={checkoutPageUrl || ''}
            className={clsx(
              'button flex w-full items-center justify-center rounded border !p-2 text-xl',
              !productCount &&
                'pointer-events-none cursor-default border-disabled-border !bg-transparent !text-tertiary hover:border-disabled-border'
            )}
            data-testid="checkout-button"
            tabIndex={productCount ? 0 : -1}
            aria-disabled={!productCount}
            onClick={onClose}
          >
            {t('minicart.button.checkout')}
          </Link>
        </div>
      </Sidebar>
    </Fragment>
  );
}

const Badge = ({ count }: { count: number }) => (
  <Text
    inline={true}
    className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-2xl bg-secondary text-xs font-bold text-secondary"
    data-testid="mini-cart__count"
  >
    {count}
  </Text>
);

export default MiniCart;
