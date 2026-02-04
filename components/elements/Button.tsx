'use client';
import clsx from 'clsx';
import Link from 'components/Link';
import WithReactiveStyle from 'components/WithReactiveStyle';
import React from 'react';
interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  type?: 'button' | 'submit' | 'reset' | 'link' | undefined;
  className?: string;
  rounded?: boolean;
  disabled?: boolean;
  fluid?: boolean;
  active?: boolean;
  url?: string;
  reactive?: boolean;
  [key: string]: any;
}
const RawButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      className = '',
      rounded = false,
      disabled = false,
      fluid = false,
      active = false,
      url = '',
      reactive = false,
      ...props
    },
    ref
  ) =>
    type === 'link' ? (
      <Link
        href={url}
        className={clsx(
          'flex items-center justify-center border p-2 text-sm',
          className,
          rounded && 'rounded',
          active ? 'border-secondary' : 'border-secondary-4',
          disabled &&
            'cursor-default border-disabled-border text-disabled hover:border-disabled-border',
          !disabled && 'cursor-pointer text-primary hover:border-secondary'
        )}
        aria-disabled={disabled ? 'true' : undefined}
        {...(props as any)}
      >
        {props.title}
      </Link>
    ) : (
      <button
        type={type}
        className={clsx(
          'button',
          rounded && 'rounded',
          fluid && 'w-full',
          className,
          disabled &&
            'cursor-default border border-disabled-border text-disabled hover:border-disabled-border',
          !disabled && 'cursor-pointer'
        )}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        {props.label ?? props.children}
      </button>
    )
);
RawButton.displayName = 'RawButton';

export const Button = React.forwardRef<HTMLButtonElement, any>(
  ({ reactive, ...props }, ref) => {
    if (reactive) {
      const ReactiveButton = WithReactiveStyle({
        WrappedComponent: RawButton,
        onClick: props.onClick,
        stylePrefix: 'reactive-button',
        label: props.label,
        successLabel: props.successLabel || '',
        ...props,
      });

      return ReactiveButton;
    }

    return <RawButton ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export const SecondaryButon = (props: ButtonProps) => {
  const { className, children, ...otherProps } = props;
  return (
    <Button className={clsx('secondary-btn', className)} {...otherProps}>
      {children}
    </Button>
  );
};
