'use client';
import Currency from 'components/Currency';
import { Text } from 'components/elements/Text';
import FormattedDate from 'components/FormattedDate';
import Link from 'components/Link';
import { CartContext } from 'contexts/cartContext';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { OrderRow } from 'models/order';
import Image from 'next/image';
import { Fragment, useContext, useEffect, useState } from 'react';
import { remove, update } from 'services/cartService.client';
import {
  calculateProductRowDiscount,
  getVatSelector,
  shouldShowOriginalPrice,
} from 'services/discountService';
import { getAbsoluteImageUrl } from 'services/imageService';
import {
  getStockBalance,
  StockBalance,
} from 'services/zitac/stockbalanceService';

/**
 * Renders a line item in cart.
 * @param item a cart line item object.
 */
function CartLineItem({
  item,
  asterisk = false,
  updatable = true,
  includingVat = true,
}: {
  item: OrderRow;
  asterisk?: boolean;
  updatable?: boolean;
  includingVat?: boolean;
}) {
  const cartContext = useContext(CartContext);
  const handleChangeQuantity = async (value: number) => {
    const cart = await update(item.rowId, value);
    cartContext.setCart(cart);
    cartContext.setHasCartChanged(true);
  };
  const removeRow = async (rowId: string) => {
    const cart = await remove(rowId);
    cartContext.setCart(cart);
    cartContext.setHasCartChanged(true);
  };
  const vatSelector = getVatSelector(includingVat);
  const [discountedPrice, setDiscountedPrice] = useState(
    item && includingVat
      ? (item.totalIncludingVat ?? 0)
      : (item?.totalExcludingVat ?? 0)
  );
  const website = useContext(WebsiteContext);
  const [stock, setStock] = useState<StockBalance | null>(null);
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    if (!item) return;
    const productDiscount = calculateProductRowDiscount(
      {
        discountInfos: item.discountInfos ?? [],
        totalIncludingVat: item.totalIncludingVat ?? 0,
        totalExcludingVat: item.totalExcludingVat ?? 0,
      } as OrderRow,
      includingVat
    );
    setDiscountedPrice(productDiscount);
  }, [
    item?.discountInfos,
    item?.totalIncludingVat,
    item?.totalExcludingVat,
    includingVat,
  ]);

  useEffect(() => {
    if (!item?.articleNumber) return;
    let cancelled = false;
    setStockLoading(true);
    getStockBalance(item.articleNumber)
      .then((data) => {
        if (cancelled) return;
        // Filter for huvudlager
        const huvudlagerStock = data.find((s) =>
          s.name.toLowerCase().includes('huvudlager')
        );
        setStock(huvudlagerStock || null);
      })
      .catch(() => {
        if (!cancelled) setStock(null);
      })
      .finally(() => {
        if (!cancelled) setStockLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [item?.articleNumber]);

  const t = useTranslations();

  if (!item || !item.product) {
    return <Fragment></Fragment>;
  }

  const fieldGroups = (item.product as any)?.fieldGroups;
  const lagerGroup = fieldGroups?.find(
    (g: any) => g.fieldGroupId === 'LagerLeverans'
  );
  const etaField = lagerGroup?.fields?.find(
    (f: any) => f.field === 'eta_primary_stock'
  );
  const etaDate = etaField?.dateTimeValue;
  const estimatedDeliveryDate =
    etaDate && new Date(etaDate).getFullYear() >= 2000
      ? new Date(etaDate)
      : null;
  const isOutOfStock = !stockLoading && stock?.quantity === 0;

  return (
    <div className="my-2" data-testid={item.articleNumber}>
      <div className="ml-2 flex-1">
        <div className="mb-2 grid grid-cols-2 items-start justify-between md:grid-cols-4">
          <div className="w-52 md:col-span-2">
            {item.product.url ? (
              <Link
                href={item.product.url}
                className="text-sm uppercase text-primary hover:underline"
                title={item.product.name ?? ''}
                data-testid={`${item.articleNumber}__name`}
              >
                {item.product.name}
              </Link>
            ) : (
              <Text
                className="truncate text-sm uppercase"
                title={item.product.name ?? ''}
                data-testid={`${item.articleNumber}__name`}
              >
                {item.product.name}
              </Text>
            )}
            <Text
              className="truncate text-[11px] text-tertiary"
              title={item.articleNumber}
              data-testid={`${item.articleNumber}__article-number`}
            >
              Art. nr {item.articleNumber}
            </Text>
            {/* Stock status from huvudlager */}
            {stockLoading ? (
              <Text className="mt-1 text-[11px] text-tertiary">
                {t('cartlineitem.loading')}
              </Text>
            ) : stock ? (
              <Text
                className={`mt-1 text-[11px] text-dark-gray before:mr-1.5 before:inline-block before:h-[4px] before:w-[4px] before:rounded-[50%] before:align-middle before:content-[''] ${
                  stock.quantity > 0 ? 'before:bg-light-green' : 'before:bg-red'
                }`}
                data-testid={`${item.articleNumber}__stock-status`}
              >
                {stock.quantity > 0
                  ? `${t('zs.inStock')} ${stock.quantity} ${t('zs.stockCount') || ''}`
                  : t('zs.outOfStock')}
              </Text>
            ) : null}
            {/* Estimated delivery date - only show if out of stock */}
            {isOutOfStock && (
              <div
                className="mt-1 flex items-center gap-1 text-[11px] text-tertiary"
                data-testid={`${item.articleNumber}__estimated-delivery`}
              >
                {estimatedDeliveryDate ? (
                  <>
                    <span>{t('cartlineitem.estimatedDelivery')}</span>
                    <FormattedDate date={estimatedDeliveryDate} />
                  </>
                ) : (
                  <span>{t('cartlineitem.deliveryDateUnknown')}</span>
                )}
              </div>
            )}
          </div>
          <div className="text-right">
            {!updatable && (
              <Text className="inline text-xs">
                {t('cartlineitem.quantity.title')} {item.quantity}
              </Text>
            )}
          </div>
          <div className="col-start-2 text-right md:col-start-4">
            <Currency
              className="inline text-sm"
              price={discountedPrice}
              data-testid={`${item.articleNumber}__discount-price`}
            />
            {asterisk && (
              <Text
                inline={true}
                className="text-xs"
                data-testid={`${item.articleNumber}__asterisk`}
              >
                &nbsp;*
              </Text>
            )}
            {shouldShowOriginalPrice(item.discountInfos ?? []) && (
              <Currency
                className="text-[11px] text-tertiary"
                price={
                  includingVat
                    ? (item.totalIncludingVat ?? 0)
                    : (item.totalExcludingVat ?? 0)
                }
                data-testid={`${item.articleNumber}__original-price`}
                strikethrough
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between border-b pb-4">
        <div className="h-20 w-20 flex-none rounded-md bg-white p-2">
          {item.product.smallImages && item.product.smallImages.length > 0 ? (
            <Image
              src={getAbsoluteImageUrl(
                item.product.smallImages[0],
                website.imageServerUrl
              )}
              alt={`img-${item.articleNumber}`}
              width={item.product.smallImages[0]?.dimension?.width}
              height={item.product.smallImages[0]?.dimension?.height}
              className="mx-auto"
            />
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartLineItem;
