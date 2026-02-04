'use client';
import clsx from 'clsx';
import { Button } from 'components/elements/Button';
import { InputNumber } from 'components/elements/Input';
import { Option, Select } from 'components/elements/Select';
import { useTranslations } from 'hooks/useTranslations';
import { Fragment, useCallback, useEffect, useState } from 'react';

const defaultQuantityOptions = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  'quantityinput.option.more',
];

function QuantityInput({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange?: (value: number) => void;
  className?: string;
}) {
  const [showInputQuantity, setShowInputQuantity] = useState(false);
  const [quantity, setQuantity] = useState(value);
  const [quantityInput, setQuantityInput] = useState(quantity);
  const [quantityOptions, setQuantityOptions] = useState(
    defaultQuantityOptions
  );
  const onChangeOption = (value: any) => {
    if (value === 'quantityinput.option.more') {
      setShowInputQuantity(true);
    } else {
      setShowInputQuantity(false);
      setQuantity(value);
      setQuantityInput(value);
      onChange && onChange(value);
    }
    setQuantityOptions(defaultQuantityOptions);
  };
  const onChangeInput = (value: any) => {
    setQuantityInput(value);
  };
  const reBuildOptions = useCallback((value: any) => {
    // Rebuild list option when value is greater than 9
    let newQuantityOptions = [...defaultQuantityOptions];
    newQuantityOptions.splice(9, 0, value);
    setQuantityOptions(newQuantityOptions);
  }, []);
  const onChangeQuantity = useCallback(
    (value: any) => {
      if (value > 9) {
        reBuildOptions(value);
      }
      setQuantity(value);
      setShowInputQuantity(false);
      onChange && onChange(value);
    },
    [onChange, reBuildOptions]
  );
  useEffect(() => {
    if (value > 9) {
      reBuildOptions(value);
    }
    setQuantity(value);
  }, [reBuildOptions, value]);

  // Focus the input field when it appears
  useEffect(() => {
    if (showInputQuantity) {
      const inputElement = document.getElementById('quantityInput');
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [showInputQuantity]);

  const t = useTranslations();

  return (
    <Fragment>
      {!showInputQuantity && (
        <Select
          id="quantitySelect"
          className={clsx(className, '!p-1 text-sm')}
          value={quantity}
          aria-label={t('quantityinput.productquantity')}
          onChange={(event) => onChangeOption(event.target.value)}
          data-testid="quantity-input__select"
        >
          {quantityOptions.map((option) => (
            <Option
              value={option}
              key={`miniCart-${option}`}
              data-testid="quantity-input__option"
            >
              {typeof option === 'string' ? t(option) : option}
            </Option>
          ))}
        </Select>
      )}
      {showInputQuantity && (
        <div>
          <InputNumber
            id="quantityInput"
            value={quantityInput}
            onChange={onChangeInput}
            positiveNumber={true}
            aria-label={t('quantityinput.productquantity')}
            data-testid="quantity-input__input"
          />
          <Button
            className="ml-2 !border-0 !bg-transparent p-0 text-primary"
            onClick={() => onChangeQuantity(quantityInput)}
            data-testid="quantity-input__input-ok"
          >
            {t('quantityinput.button.ok')}
          </Button>
        </div>
      )}
    </Fragment>
  );
}

export default QuantityInput;
