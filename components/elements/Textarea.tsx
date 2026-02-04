import clsx from 'clsx';

/**
 * Render a textarea with placeholder.
 * @param value a default value of the textarea
 * @param placeholder a label display by a placeholder
 * @param id an unique id of the textarea
 * @param onChange event occurs when value of the textarea is changed
 * @param className a customize class name
 */
function Textarea({
  value,
  onChange,
  id,
  className,
  placeholder,
  disabled = false,
  ...props
}: {
  value: string;
  onChange?: (value: any) => void;
  id: string;
  placeholder: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={clsx(
        'relative rounded border pt-7',
        disabled &&
          'border-disabled-border bg-disabled-background text-tertiary',
        !disabled && ' border-tertiary'
      )}
    >
      <textarea
        rows={3}
        onChange={onChange}
        value={value}
        className={clsx(
          'peer w-full px-3 outline-none disabled:bg-transparent',
          className
        )}
        id={id}
        name={id}
        disabled={disabled}
        {...props}
      />
      <label
        className={clsx(
          'absolute left-3 text-tertiary peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-sm',
          !value && 'top-[50%] -translate-y-[53%]',
          value && 'top-2 text-sm'
        )}
        htmlFor={id}
      >
        {placeholder}
      </label>
    </div>
  );
}

export default Textarea;
