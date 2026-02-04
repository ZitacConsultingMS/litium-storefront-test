'use client';
import { CartContext } from 'contexts/cartContext';
import { useTranslations } from 'hooks/useTranslations';
import { Fragment, useContext } from 'react';
import { add } from 'services/cartService.client';
import { Button } from '../elements/zitac/Button';
import WithReactiveStyleBuyButton from './WithReactiveStyleBuyButton';

interface BuyButtonProps {
  label: string;
  fluid?: boolean;
  href?: string;
  className?: string;
  articleNumber: string;
  disabled?: boolean;
  onClick: (articleNumber: string) => void;
}

/**
 * A Buy button.
 * @param label label of the button.
 * @param fluid decides whether the button is in full width or not. False by default.
 * @param className the button's class name.
 * @param articleNumber an article number value.
 * @param disabled a flag to disable the button.
 * @param onClick the button's onClick event.
 * @returns
 */
const BuyButton = ({
  label = '',
  fluid = false,
  className = '',
  articleNumber,
  disabled,
  onClick,
}: BuyButtonProps) => {
  const t = useTranslations();
  return (
    <Fragment>
      <Button
        fluid={fluid}
        onClick={() => onClick(articleNumber)}
        className={className}
        data-testid="buy-button"
        data-testarticlenumber={articleNumber}
        disabled={disabled}
      >
        {t(label)}
      </Button>
    </Fragment>
  );
};

const StyledButton = ({ ...props }) => {
  const cartContext = useContext(CartContext);
  const onClick =
    props.onClick ??
    (async (articleNumber: string) => {
      try {
        const cart = await add(articleNumber);
        cartContext.setCart(cart);
        return true;
      } catch (ex) {
        // Todo: show error
        console.log(ex);
        return false;
      }
    });

  const Button = WithReactiveStyleBuyButton({
    WrappedComponent: BuyButton,
    onClick,
    stylePrefix: 'buy-button',
    label: props.label,
    successLabel: props.successLabel || props.label,
    ...props,
  });

  return Button;
};

export default StyledButton;
