'use client';
import ListBox from 'components/elements/ListBox';
import ErrorText, { ErrorField } from 'components/form/ErrorText';
import { CheckoutOption } from 'models/checkout';
import { Fragment } from 'react';
import OptionSummary from './OptionSummary';

/**
 * Renders payment options for checkout page.
 * @param value an option list.
 * @param selectedOption selected option from options
 * @param onChange event occurs when the value of an option item is changed
 * @param errors a list of error message
 */
function PaymentOptions({
  value,
  selectedOption,
  onChange,
  errors,
}: {
  value: CheckoutOption[];
  selectedOption: CheckoutOption;
  onChange: (id: string) => void;
  errors: ErrorField | ErrorField[];
}) {
  //fix => hide listbox if svea is selected
  const isSveaSelected = (() => {
    const name = (selectedOption?.name ?? '').toLocaleLowerCase('sv-SE');
    return name.includes('svea');
  })();

  return (
    <Fragment>
      {!isSveaSelected && (
        <ListBox
          key={selectedOption?.id ?? 'none'} // forces clean rerender on switch
          value={value}
          onChange={(option) => onChange(option.id)}
          childrenSelector={getChildrenSelector}
          selectedOption={selectedOption}
          idSelector={idSelector}
        />
      )}
      <ErrorText errors={errors} className="mb-3 text-left" />
    </Fragment>
  );
}

const getChildrenSelector = (option: CheckoutOption) => {
  return <OptionSummary value={option} />;
};

const idSelector = (option: CheckoutOption) => option.id;

export default PaymentOptions;
