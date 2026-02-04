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
import QuantityInput from '../zitac/QuantityInput';

const ROW_COMMENT_KEY = 'RowComment';

function getCommentAdditionalInfo(
  comment: string
): { key: string; value: string }[] | undefined {
  const v = comment.trim();
  return v ? [{ key: ROW_COMMENT_KEY, value: v }] : undefined;
}

/**
 * Renders a line item in cart.
 * @param item a cart line item object.
 */
function CartLineItem({
  item,
  asterisk = false,
  updatable = true,
  includingVat = true,
  showLineComment = false,
}: {
  item: OrderRow;
  asterisk?: boolean;
  updatable?: boolean;
  includingVat?: boolean;
  showLineComment?: boolean;
}) {
  const cartContext = useContext(CartContext);
  const serverComment =
    item.additionalInfo?.find((e) => e.key === ROW_COMMENT_KEY)?.value ?? '';
  const [lineComment, setLineComment] = useState(serverComment);
  const [isSavingComment, setIsSavingComment] = useState(false);

  useEffect(() => {
    setLineComment(serverComment);
  }, [serverComment]);

  const handleChangeQuantity = async (value: number) => {
    const cart = await update(
      item.rowId,
      value,
      getCommentAdditionalInfo(lineComment)
    );
    cartContext.setCart(cart);
    cartContext.setHasCartChanged(true);
  };
  const saveLineComment = async () => {
    if (isSavingComment) return;
    setIsSavingComment(true);
    try {
      const cart = await update(
        item.rowId,
        item.quantity,
        getCommentAdditionalInfo(lineComment)
      );
      cartContext.setCart(cart);
      cartContext.setHasCartChanged(true);
    } finally {
      setIsSavingComment(false);
    }
  };
  const removeRow = async (rowId: string) => {
    const cart = await remove(rowId);
    cartContext.setCart(cart);
    cartContext.setHasCartChanged(true);
  };
  const vatSelector = getVatSelector(includingVat);
  const [discountedPrice, setDiscountedPrice] = useState(
    includingVat ? item.totalIncludingVat : item.totalExcludingVat
  );
  const website = useContext(WebsiteContext);

  useEffect(() => {
    const productDiscount = calculateProductRowDiscount(
      {
        discountInfos: item.discountInfos,
        totalIncludingVat: item.totalIncludingVat,
        totalExcludingVat: item.totalExcludingVat,
      } as OrderRow,
      includingVat
    );
    setDiscountedPrice(productDiscount);
  }, [
    item.discountInfos,
    item.totalIncludingVat,
    item.totalExcludingVat,
    includingVat,
  ]);

  const t = useTranslations();

  if (!item.product) {
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
        <div className="mb-2 flex justify-between">
          <div className="w-44">
            {item.product.url ? (
              <Link
                href={item.product.url}
                className="break-words text-sm text-primary hover:underline"
                title={displayName}
                data-testid={`${item.articleNumber}__name`}
              >
                {displayName}
              </Link>
            ) : (
              <Text
                className="break-words text-sm text-primary"
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
          <div>
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
            {shouldShowOriginalPrice(item.discountInfos) && (
              <Currency
                className="text-[10px] text-tertiary"
                price={
                  includingVat ? item.totalIncludingVat : item.totalExcludingVat
                }
                data-testid={`${item.articleNumber}__original-price`}
                strikethrough
              />
            )}
          </div>
        </div>
      </div>
      {showLineComment && (
        <div className="mb-2">
          <label className="flex flex-col gap-1">
            <Text className="text-xs font-medium">
              {t('cartlineitem.kommentar') || 'Kommentar'}
            </Text>
            <input
              type="text"
              value={lineComment}
              onChange={(e) => setLineComment(e.target.value)}
              onBlur={saveLineComment}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
              data-testid={`${item.articleNumber}__line-comment`}
              placeholder={t('cartlineitem.kommentar.placeholder')}
              disabled={isSavingComment}
            />
          </label>
        </div>
      )}
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
        {updatable && (
          <div className="items-center justify-between pb-5 text-right">
            <QuantityInput
              value={item.quantity}
              onChange={handleChangeQuantity}
            />
            <div
              className="mt-1 cursor-pointer text-[10px] text-tertiary"
              onClick={() => removeRow(item.rowId)}
              data-testid={`${item.articleNumber}__remove-btn`}
            >
              {t('cartlineitem.button.remove')}
            </div>
          </div>
        )}
        {!updatable && (
          <Text className="text-end text-xs">
            {t('cartlineitem.quantity.title')} {item.quantity}
          </Text>
        )}
      </div>
    </div>
  );
}

export default CartLineItem;
