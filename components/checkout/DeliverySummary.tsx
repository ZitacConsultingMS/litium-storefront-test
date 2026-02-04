import { Button } from 'components/elements/Button';
import { Heading2 } from 'components/elements/Heading';
import { useTranslations } from 'hooks/useTranslations';
import { OrderAddress } from 'models/address';
import { CheckoutOption } from 'models/checkout';
import { Fragment } from 'react';
import AddressSummary from './AddressSummary';
import OptionSummary from './OptionSummary';

/**
 * Renders delivery summary in checkout page.
 * @param selectedDeliveryOption selected option from deliveryOptions
 * @param onEdit an event occurs when editing delivery
 * @param showAddress a flag to show/hide address summary section
 */
const DeliverySummary = (props: {
  selectedDeliveryOption: CheckoutOption;
  shippingAddress: OrderAddress;
  onEdit: () => void;
  showAddress?: boolean;
}) => {
  const { showAddress = true, shippingAddress } = props;
  const t = useTranslations();
  return (
    <Fragment>
      <div className="mb-8 flex items-center justify-between">
        <Heading2>{t('deliverysummary.title')}</Heading2>
        <Button
          className="!border-0 !bg-transparent p-0 text-sm text-primary"
          onClick={props.onEdit}
          data-testid="delivery-summary__edit"
        >
          {t('deliverysummary.button.edit')}
        </Button>
      </div>
      {showAddress && (
        <AddressSummary
          value={shippingAddress}
          title={t('deliverysummary.address.title')}
          className="mb-5"
          showEdit={false}
        />
      )}
      <OptionSummary
        value={props.selectedDeliveryOption}
        title={t('deliverysummary.optionsummary.title')}
        className="mb-8"
      />
    </Fragment>
  );
};

export default DeliverySummary;
