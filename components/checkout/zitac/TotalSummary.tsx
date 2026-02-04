'use client';
import Currency from 'components/Currency';
import { Button } from 'components/elements/Button';
import { Checkbox } from 'components/elements/Checkbox';
import { Text } from 'components/elements/Text';
import ErrorText, { ErrorField } from 'components/form/ErrorText';
import Link from 'components/Link';
import { CartContext } from 'contexts/cartContext';
import { useTranslations } from 'hooks/useTranslations';
import { useContext, useState } from 'react';

/**
 * Renders total summary in checkout page.
 */
const TotalSummary = (props: {
  errors: ErrorField | ErrorField[];
  onClick: () => void;
  policiesAccepted?: boolean;
  showPolicyCheckbox?: boolean;
}) => {
  const cartContext = useContext(CartContext);
  const grandTotal = cartContext.cart.grandTotal;
  const t = useTranslations();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const showCheckbox = props.showPolicyCheckbox !== false;
  const isOrderAllowed = showCheckbox
    ? isConfirmed
    : (props.policiesAccepted ?? false);

  return (
    <div className="text-center">
      <Text className="mb-3 text-sm">{t('totalsummary.totalVAT')}</Text>
      <Currency
        price={grandTotal}
        className="mb-5 text-xl font-bold"
        data-testid="total-summary__grand-total"
      />
      {showCheckbox && (
        <div className="mb-5 flex justify-center">
          <Checkbox
            id="order-confirmation-checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            data-testid="total-summary__confirmation-checkbox"
          >
            <Text inline={true} className="whitespace-normal text-sm">
              {t('totalsummary.checkbox.confirm')}{' '}
              <Link href="/kopvillkor" className="underline">
                {t('totalsummary.checkbox.termsLink')}
              </Link>{' '}
              {t('totalsummary.checkbox.and')}{' '}
              <Link href="/privacy" className="underline">
                {t('totalsummary.checkbox.privacyLink')}
              </Link>
            </Text>
          </Checkbox>
        </div>
      )}
      <Button
        rounded={true}
        className={`w-full rounded-md text-white transition-all ${
          !isOrderAllowed
            ? 'cursor-not-allowed bg-gray-400 opacity-60'
            : 'cursor-pointer bg-secondary hover:bg-secondary/80'
        }`}
        onClick={props.onClick}
        disabled={!isOrderAllowed}
        data-testid="total-summary__place-order"
      >
        {t('totalsummary.button.placeorder')}
      </Button>
      <ErrorText errors={props.errors} className="text-left" />
    </div>
  );
};
export default TotalSummary;
