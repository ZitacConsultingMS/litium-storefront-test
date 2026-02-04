'use client';
import clsx from 'clsx';
import Currency from 'components/Currency';
import { CartContext, EmptyCart } from 'contexts/cartContext';
import { ProductPriceItem } from 'models/price';
import { useContext } from 'react';
import { getVatSelector } from 'services/discountService';

/**
 * Represents a component to render a Product price as a formatted string, with
 * currency and Vat being taken into account.
 * @param price a ProductPriceItem object.
 * @param className optional custom css class name.
 * @returns
 */
function ProductPrice({
  price,
  customRegularPrice,
  className = '',
  discountClassName = '',
  showDiscount = true,
  ...props
}: {
  price: ProductPriceItem | null | undefined;
  customRegularPrice?: string | null;
  className?: string;
  discountClassName?: string;
  showDiscount?: boolean;
}) {
  const { showPricesIncludingVat } = useContext(CartContext).cart || EmptyCart;
  const vatSelector = getVatSelector(showPricesIncludingVat);
  const productUnitPrice = customRegularPrice
    ? Number(customRegularPrice)
    : price?.[`unitPrice${vatSelector}`];
  const productDiscountPrice = price?.[`discountPrice${vatSelector}`];

  // Early return if no price data
  if (!price && !customRegularPrice) {
    return null;
  }

  if (showDiscount && !!price?.discountPriceIncludingVat) {
    return (
      <div className="flex items-baseline gap-x-5">
        {!!productDiscountPrice && (
          <Currency
            price={productDiscountPrice}
            {...props}
            data-testid="product-price__discount-price"
            className={clsx(discountClassName, 'font-medium text-red')}
          ></Currency>
        )}
        <Currency
          className={clsx(
            className,
            !!productDiscountPrice && 'self-end text-dark-gray line-through'
          )}
          price={productUnitPrice}
          {...props}
          data-testid="product-price__unit-price"
        />
      </div>
    );
  }
  // Otherwise just show the regular price
  return <Currency className={className} price={productUnitPrice} {...props} />;
}

export default ProductPrice;
