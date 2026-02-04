'use client';
import Currency from 'components/Currency';
import Link from 'components/Link';
import { Text } from 'components/elements/Text';
import { Button } from 'components/elements/zitac/Button';
import Cart from 'components/icons/zitac/cart';
import { CartContext } from 'contexts/cartContext';
import { useTranslations } from 'hooks/useTranslations';
import { Fragment, useCallback, useContext, useState } from 'react';
import { calculateTotalProducts } from 'services/discountService';
import SidebarMiniCart from '../../zitac/SidebarMiniCart';
import CartContent from '../zitac/CartContent';

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
      <div className="relative" onClick={() => setShowCartInfo(true)}>
        <Cart alt="cart" data-testid="mini-cart__bag" />
        {productCount ? <Badge count={productCount} /> : ''}
      </div>
      <SidebarMiniCart
        visible={showCartInfo}
        onClose={onClose}
        className="z-40 !mt-0 flex h-full flex-col overflow-auto bg-body-background sm:w-[400px]"
        data-testid="mini-cart__sidebar"
        fullscreen={false}
        blockScroll={true}
      >
        {/* header sidebar */}
        <div className="mt-10 text-center">
          <Text inline={true} className="text-lg sm:text-2xl">
            {t('minicart.title')}
          </Text>
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
        <div className="sticky -bottom-5 -my-5 bg-body-background pb-20 sm:pb-5">
          <div className="mb-3 flex justify-between">
            <Text inline={true}>{t('minicart.total')}</Text>
            <Currency price={totalInMiniCart} />
          </div>
          <Link href={checkoutPageUrl || ''} data-testid="checkout-button">
            <Button
              className="border !p-2 text-xl"
              fluid={true}
              rounded={true}
              onClick={onClose}
              disabled={!productCount}
            >
              {t('minicart.button.checkout')}
            </Button>
          </Link>
        </div>
      </SidebarMiniCart>
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
