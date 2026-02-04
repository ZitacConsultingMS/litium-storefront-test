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
      rounded = true,
      disabled = false,
      fluid = false,
      active = false,
      url = '',
      reactive = false,
      ...props
    },
    ref
  ) => {
    const hasBg = className.split(' ').some((cls: string) => cls.startsWith('bg-'));

    return type === 'link' ? (
      <Link
        href={url}
        className={clsx(
          'flex items-center justify-center border p-2 text-sm',
          className,
          rounded && 'rounded-md',
          active ? 'border-secondary' : 'border-secondary-2',
          disabled &&
            'border-disabled-border text-disabled hover:border-disabled-border',
          !disabled && 'text-primary hover:border-secondary'
        )}
        data-testid={props['data-testid']}
      >
        {props.title}
      </Link>
    ) : (
      <button
        type={type}
        className={clsx(
          'button',
          className,
          !hasBg &&
            !disabled &&
            'bg-secondary text-white hover:bg-secondary/80',
          disabled && 'text-secondary-2 outline outline-2 outline-secondary-2 -outline-offset-2',
          rounded && 'rounded-md',
          fluid && 'w-full'
        )}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        {props.label ?? props.children}
      </button>
    );
  }
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
    <Button
      className={clsx(
        'bg-secondary-3 text-primary hover:bg-tertiary hover:touchable:bg-tertiary',
        className
      )}
      {...otherProps}
    >
      {children}
    </Button>
  );
};
