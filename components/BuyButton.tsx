'use client';
import { CartContext } from 'contexts/cartContext';
import { useTranslations } from 'hooks/useTranslations';
import { useContext } from 'react';
import { add } from 'services/cartService.client';
import { Button } from './elements/Button';

interface BuyButtonProps {
  label: string;
  fluid?: boolean;
  href?: string;
  className?: string;
  articleNumber: string;
  disabled?: boolean;
  successLabel?: string;
  quantity?: number;
}

/**
 * A Buy button.
 * @param label label of the button.
 * @param fluid decides whether the button is in full width or not. False by default.
 * @param className the button's class name.
 * @param articleNumber an article number value.
 * @param disabled a flag to disable the button.
 * @param successLabel success label of the button
 * @returns
 */
const BuyButton = ({
  label = '',
  fluid = false,
  className = '',
  articleNumber,
  disabled,
  successLabel = '',
  quantity = 1,
}: BuyButtonProps) => {
  const t = useTranslations();
  const cartContext = useContext(CartContext);
  const handleClick = async (articleNumber: string) => {
    try {
      const cart = await add(articleNumber, quantity);
      cartContext.setCart(cart);
      return true;
    } catch (ex) {
      // Todo: show error
      console.log(ex);
      return false;
    }
  };
  return (
    <Button
      fluid={fluid}
      onClick={() => handleClick(articleNumber)}
      className={className}
      data-testid="buy-button"
      data-testarticlenumber={articleNumber}
      disabled={disabled}
      reactive={true}
      successLabel={successLabel}
    >
      {t(label)}
    </Button>
  );
};

export default BuyButton;
