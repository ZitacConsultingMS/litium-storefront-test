import clsx from 'clsx';
import React from 'react';

interface InputProps extends React.ComponentPropsWithoutRef<'input'> {}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type, ...props }, ref) => (
    <input className={className} type={type} ref={ref} {...props} />
  )
);
Input.displayName = 'Input';

/**
 * Renders an input element with type "number"
 * @param value a default value of an input number element
 * @param onChange event occurs when the value of an input number element is changed
 * @param positiveNumber flag to indicate if the input number is positive or negative number.
 */
export function InputNumber({
  id,
  value,
  onChange,
  positiveNumber = false,
  ...props
}: {
  id: string;
  value: number;
  onChange: (value: any) => void;
  positiveNumber?: boolean;
}) {
  const formatPositiveNumber = (value: any) => {
    return !!value && Math.abs(value) >= 0 ? Math.abs(value) : null;
  };
  return (
    <Input
      id={id}
      className="w-16 border border-secondary-2 p-1 text-sm focus:shadow-none focus:outline-none"
      autoComplete="off"
      value={value}
      type="number"
      onChange={(event) => onChange(event.target.value)}
      onInput={
        positiveNumber
          ? (event: any) =>
              (event.target.value = formatPositiveNumber(event.target.value))
          : undefined
      }
      onFocus={(event) => event.target.select()}
      {...props}
    />
  );
}

export interface InputTextProps
  extends React.ComponentPropsWithoutRef<'input'> {
  type?: string;
  value?: string;
  onChange: (value: any) => void;
  placeholder?: string;
  id: string;
  className?: string;
  disabled?: boolean;
}
/**
 * Render a text input with placeholder.
 * @param type a type of <input> element to display
 * @param value a default value of the input text
 * @param placeholder a label display by a placeholder
 * @param id an unique id of the input
 * @param onChange event occurs when value of the input text is changed
 * @param className a customize class name
 */
export const InputText = React.forwardRef<HTMLInputElement, InputTextProps>(
  (
    {
      type = 'text',
      value = '',
      onChange,
      placeholder = '',
      id,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => (
    <div
      className={clsx(
        'relative flex h-16 w-full flex-auto rounded border px-3 pb-0 pt-4',
        disabled && 'border-disabled-border bg-disabled-background',
        !disabled && 'border-tertiary',
        className
      )}
    >
      <Input
        className="peer h-auto w-full border-none outline-none autofill:!shadow-[0_0_0_30px_white_inset] disabled:bg-transparent disabled:text-tertiary"
        type={type}
        onChange={(event) => onChange(event.target.value)}
        value={value}
        name={id}
        id={id}
        ref={ref}
        autoComplete="off"
        disabled={disabled}
        {...props}
      />
      <label
        className={clsx(
          'absolute left-3 text-tertiary peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-sm',
          !value && 'top-[50%] -translate-y-2/4',
          value && 'top-2 text-sm'
        )}
        htmlFor={id}
      >
        {placeholder}
      </label>
    </div>
  )
);

InputText.displayName = 'InputText';
