'use client';
import clsx from 'clsx';
import Currency from 'components/Currency';
import { CartContext } from 'contexts/cartContext';
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
  className = '',
  ...props
}: {
  price: ProductPriceItem;
  className?: string;
}) {
  const { showPricesIncludingVat } = useContext(CartContext).cart;
  const vatSelector = getVatSelector(showPricesIncludingVat);
  const productUnitPrice = price[`unitPrice${vatSelector}`];
  const productDiscountPrice = price[`discountPrice${vatSelector}`];

  return (
    <div className="flex items-baseline gap-x-5">
      {!!productDiscountPrice && (
        <Currency
          price={productDiscountPrice}
          {...props}
          data-testid="product-price__discount-price"
        ></Currency>
      )}
      <Currency
        className={clsx(
          className,
          !!productDiscountPrice && 'text-secondary-2 line-through'
        )}
        price={productUnitPrice}
        {...props}
        data-testid="product-price__unit-price"
      />
    </div>
  );
}

export default ProductPrice;
