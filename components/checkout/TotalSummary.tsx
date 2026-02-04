'use client';
import Currency from 'components/Currency';
import { Button } from 'components/elements/Button';
import { Text } from 'components/elements/Text';
import ErrorText, { ErrorField } from 'components/form/ErrorText';
import { CartContext } from 'contexts/cartContext';
import { useTranslations } from 'hooks/useTranslations';
import { useContext } from 'react';

/**
 * Renders total summary in checkout page.
 */
const TotalSummary = (props: {
  errors: ErrorField | ErrorField[];
  onClick: () => void;
}) => {
  const cartContext = useContext(CartContext);
  const grandTotal = cartContext.cart.grandTotal;
  const t = useTranslations();
  return (
    <div className="text-center">
      <Text className="mb-3 text-sm">{t('totalsummary.totalVAT')}</Text>
      <Currency
        price={grandTotal}
        className="mb-5 text-xl font-bold"
        data-testid="total-summary__grand-total"
      />
      <Button
        rounded={true}
        className="mb-3 w-full p-2 text-sm"
        onClick={props.onClick}
        data-testid="total-summary__place-order"
      >
        {t('totalsummary.button.placeorder')}
      </Button>
      <ErrorText errors={props.errors} className="text-left" />
    </div>
  );
};
export default TotalSummary;
