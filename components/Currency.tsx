'use client';
import { CartContext } from 'contexts/cartContext';
import { WebsiteContext } from 'contexts/websiteContext';
import { useContext } from 'react';
import CurrencyServerComponent from './Currency.server';

/**
 * Represents a component to display a formatted currency based on the current Currency configuration.
 * @param price an input price value to format.
 * @param strikethrough a flag to indicate if a strikethrough should be added.
 * @param className optional custom css class name.
 * @returns
 */
function Currency({
  price,
  strikethrough = false,
  className = '',
  ...props
}: {
  price?: number;
  strikethrough?: boolean;
  className?: string;
}) {
  const websiteContext = useContext(WebsiteContext);
  const { cart } = useContext(CartContext);
  return (
    <CurrencyServerComponent
      price={price}
      strikethrough={strikethrough}
      className={className}
      culture={websiteContext.culture.code}
      currency={cart.currency}
      {...props}
    />
  );
}

export default Currency;
