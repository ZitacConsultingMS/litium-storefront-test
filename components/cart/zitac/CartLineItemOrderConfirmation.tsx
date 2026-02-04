'use client';
import Currency from 'components/Currency';
import { Text } from 'components/elements/Text';
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
import { getProductDisplayName } from 'utils/productFieldUtils';

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

  const t = useTranslations();

  if (!item || !item.product) {
    return <Fragment></Fragment>;
  }

  const displayName = getProductDisplayName(
    item.product.name,
    item.product.fieldGroups,
    (item.product as any).allFieldGroups
  );

  return (
    <div className="my-2" data-testid={item.articleNumber}>
      <div className="ml-2 flex-1">
        <div className="mb-2 grid grid-cols-2 items-start justify-between md:grid-cols-3">
          <div className="w-44">
            {item.product.url ? (
              <Link
                href={item.product.url}
                className="text-sm uppercase text-primary hover:underline"
                title={displayName}
                data-testid={`${item.articleNumber}__name`}
              >
                {displayName}
              </Link>
            ) : (
              <Text
                className="break-words text-sm uppercase"
                title={displayName}
                data-testid={`${item.articleNumber}__name`}
              >
                {displayName}
              </Text>
            )}
            <Text
              className="truncate text-[10px] text-tertiary"
              title={item.articleNumber}
              data-testid={`${item.articleNumber}__article-number`}
            >
              Art. nr {item.articleNumber}
            </Text>
          </div>
          <div className="text-right">
            {!updatable && (
              <Text className="inline text-xs">
                {t('cartlineitem.quantity.title')} {item.quantity}
              </Text>
            )}
          </div>
          <div className="col-start-2 text-right md:col-start-3">
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
                className="text-[10px] text-tertiary"
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
