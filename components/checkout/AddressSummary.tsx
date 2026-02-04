import clsx from 'clsx';
import { Button } from 'components/elements/Button';
import { Text } from 'components/elements/Text';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { OrderAddress } from 'models/address';
import { useContext } from 'react';

/**
 * Renders an address summary of checkout page.
 * @param title a title to describe the type of address
 * @param value an object to contain address value
 * @param onEdit an event occurs when
 * @param className optional custom css class name
 */
function AddressSummary({
  title = '',
  value,
  onEdit,
  className = '',
  showEdit = true,
}: {
  title?: string;
  value: OrderAddress;
  onEdit?: () => void;
  className?: string;
  showEdit?: boolean;
}) {
  const countries = useContext(WebsiteContext).countries;
  const t = useTranslations();
  function getCountryName(code: string) {
    return countries.find((country) => country.code === code)?.name;
  }
  return (
    <div data-testid="address-summary" className={clsx('text-sm', className)}>
      {title && (
        <Text inline={true} data-testid="address-summary__title">
          {title}
        </Text>
      )}
      <div
        className={clsx(
          !title && 'flex justify-between gap-6 rounded border px-2 py-3'
        )}
      >
        <div className={clsx(title && 'text-tertiary', !title && 'break-all')}>
          <Text data-testid="address-summary__name">
            {!!value?.organizationName
              ? [
                  value?.firstName.concat(' ', value?.lastName),
                  value?.organizationName,
                ].join(', ')
              : value?.firstName?.concat(' ', value?.lastName)}
          </Text>
          <Text data-testid="address-summary__address">
            {[
              value?.address1,
              value?.zipCode,
              value?.city,
              getCountryName(value?.country),
            ].join(', ')}
          </Text>
          <Text data-testid="address-summary__contact">
            {[value?.email, value?.phoneNumber].join(', ')}
          </Text>
        </div>
        {showEdit && (
          <Button
            data-testid="address-summary__btnEdit"
            className="!border-0 !bg-transparent p-0 text-primary"
            onClick={onEdit}
          >
            {t('addresssummary.button.edit')}
          </Button>
        )}
      </div>
    </div>
  );
}

export default AddressSummary;
