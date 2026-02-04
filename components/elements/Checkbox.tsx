import clsx from 'clsx';
import { ChangeEvent } from 'react';
import { Input } from './Input';

export function Checkbox({
  id,
  className = '',
  checked,
  children,
  onChange,
  disabled = false,
  ...props
}: {
  id: string;
  className?: string;
  checked: boolean;
  children: React.ReactNode;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  'data-testid'?: string;
}) {
  return (
    <label
      className={clsx(
        'whitespace-nowrap',
        disabled && 'cursor-default',
        !disabled && 'cursor-pointer'
      )}
      htmlFor={id}
      data-testid={`${props['data-testid']}-label`}
    >
      <Input
        id={id}
        className="peer absolute h-0 w-0 opacity-0"
        type="checkbox"
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onChange &&
              onChange(event as unknown as ChangeEvent<HTMLInputElement>);
          }
        }}
        {...props}
      />
      <span
        className={clsx(
          `flex items-center before:mr-1 before:inline-block before:h-5 before:w-5 before:rounded-md before:border before:border-tertiary`,
          !disabled &&
            `before:hoverable:hover:bg-[url('/images/check-hover.svg')] before:hoverable:hover:bg-center before:hoverable:hover:bg-no-repeat`,
          `before:peer-checked:bg-black before:peer-checked:bg-[url('/images/check.svg')] before:peer-checked:bg-center before:peer-checked:bg-no-repeat`,
          `before:peer-checked:border-black`,
          `before:peer-focus:outline before:peer-focus:outline-2 before:peer-focus:outline-offset-2 before:peer-focus:outline-secondary`,
          `peer-disabled:text-tertiary before:peer-disabled:border-disabled-border before:peer-disabled:bg-tertiary`,
          className
        )}
      >
        {children}
      </span>
    </label>
  );
}
