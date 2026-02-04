import clsx from 'clsx';
import Currency from 'components/Currency';
import { Text } from 'components/elements/Text';
import { CheckoutOption } from 'models/checkout';

/**
 * Renders option summary, for example, selected payment or delivery option.
 * @param title a title to separate Delivery or Payment
 * @param value an option value.
 * @param className optional custom css class name
 */
function OptionSummary({
  title,
  value,
  className,
}: {
  title?: string;
  value: CheckoutOption;
  className?: string;
}) {
  return (
    <div className={clsx('text-sm', className)}>
      {title && <Text data-testid="option-summary__title">{title}</Text>}
      <Text
        className={clsx(title ? 'text-tertiary' : 'font-bold text-primary')}
        data-testid="option-summary__name"
      >
        {value.name}
      </Text>
      <div className="text-tertiary" data-testid="option-summary__description">
        <Currency price={value.price} className="inline-block" />
        &nbsp;
        {value?.description}
      </div>
    </div>
  );
}

export default OptionSummary;
