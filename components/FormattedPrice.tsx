'use client';
import { CartContext } from 'contexts/cartContext';
import { WebsiteContext } from 'contexts/websiteContext';
import { Currency } from 'models/cart';
import { useContext } from 'react';
import FormattedPriceServerComponent from './FormattedPrice.server';

/**
 * Represents a component to display a formatted price based on the current Currency configuration.
 * @param price an input price value to format.
 * @param strikethrough a flag to indicate if a strikethrough should be added.
 * @param className optional custom css class name.
 * @param currency optional currency object. If not provided, the currency from the cart will be used.
 * @returns
 */
function FormattedPrice({
  price,
  strikethrough = false,
  className = '',
  currency,
  ...props
}: {
  price?: number;
  strikethrough?: boolean;
  className?: string;
  currency?: Currency;
}) {
  const websiteContext = useContext(WebsiteContext);
  const { cart } = useContext(CartContext);
  return (
    <FormattedPriceServerComponent
      price={price}
      strikethrough={strikethrough}
      className={className}
      culture={websiteContext.culture.code}
      currency={currency || cart.currency}
      {...props}
    />
  );
}

export default FormattedPrice;
